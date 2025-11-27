import express from "express";
import { MissedCallService } from "./missedcall.service";
import {
  TwilioVoiceWebhookSchema,
  TwilioSMSWebhookSchema,
  ListCallsQuerySchema,
  UpdateCallAsRecovered,
  // MissedCallSchema,
} from "./schema/validation.schema";
import formatZodValidationError from "../../config/handlers/formatvalidationerrror";
import {prisma} from "@autocall/db"
import HttpError from "src/config/handlers/httperror";
import e from "express";
import { Http } from "winston/lib/winston/transports";

interface IMissedCallController {
  handleVoiceWebhook: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  handleSMSReply: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  getTodayStats: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  getMonthStat: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  getRecentActivity: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  listCalls: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response | void>;
  markCallAsRecovered: (req: express.Request,res: express.Response,next: express.NextFunction) => Promise<express.Response | void>
}
export const MissedCallController = (
  missedCallService: MissedCallService
): IMissedCallController => {
  return {
    /**
     * Handle Twilio Voice Webhook (Missed Call Detection)
     */
    async handleVoiceWebhook(req, res, next) {
      try {
        console.log(" Voice webhook received:", req.body);

        // Validate Twilio webhook data
        const parsed = await TwilioVoiceWebhookSchema.safeParseAsync(req.body);

        if (!parsed.success) {
          return res.status(400).json({
            error: "Invalid Twilio webhook data",
            details: formatZodValidationError(parsed),
          });
        }

       const { CallStatus, From, To, CallerName, CallSid } = parsed.data;

    // 🎯 LOOKUP BUSINESS BY TWILIO NUMBER
    const business = await prisma.business.findUnique({
      where: { twilioNumber: To }
    });

      if (!business) {
      console.error(`No business found for Twilio number: ${To}`);
      throw new HttpError( "Business not found for this Twilio number",404,"Business not found",null)
    }
        // Detect missed calls (not completed)
        const missedCallStatuses = ["no-answer", "busy", "failed", "canceled"];

        if (missedCallStatuses.includes(CallStatus)) {
          console.log(`Missed call detected: ${CallSid} from ${From}`);

          // Save to database and trigger AI workflow 
          await missedCallService.create({
            businessId: business?.id,
            callerName: CallerName || "Unknown Caller",
            callerPhone: From,
            timeStamp: new Date(),
            callStatus: "pending",
          });

          return res.status(200).json({
            success: true,
            message: "Missed call processed, auto-response triggered",
            callSid: CallSid,
          });
        }

        // Call was completed - no action needed
        console.log(`Call completed: ${CallSid}`);
        return res.status(200).json({
          success: true,
          message: "Call completed, no action needed",
        });
      } catch (error) {
        console.error("Voice webhook error:", error);
        next(error);
      }
    },

    /**
     *  Handle Customer SMS Reply
     */
    async handleSMSReply(req, res, next) {
      try {
        console.log("SMS reply received:", req.body);

        // Validate Twilio SMS webhook
        const parsed = await TwilioSMSWebhookSchema.safeParseAsync(req.body);

        if (!parsed.success) {
          return res.status(400).json({
            error: "Invalid SMS webhook data",
            details: formatZodValidationError(parsed),
          });
        }

        const { From, Body, MessageSid } = parsed.data;

        // Find the related missed call
        const missedCall = await missedCallService.findRecentMissedCallByPhone(From);

        if (!missedCall) {
          console.log(`No recent missed call found for ${From}`);
          return res.status(200).json({
            success: true,
            message: "SMS received but no matching missed call found",
          });
        }

        // Log customer response
        await missedCallService.logCustomerResponse(missedCall.id, Body);

        console.log(`Customer response logged: ${MessageSid}`);

        // TODO: Alert dispatcher/team about customer response
        // You can trigger another Mastra workflow here for notifications

        return res.status(200).json({
          success: true,
          message: "Customer response logged",
          missedCallId: missedCall.id,
        });
      } catch (error) {
        console.error("SMS reply error:", error);
        next(error);
      }
    },

    /**
     * To get analytics for today
     */
    
    async getTodayStats(req,res,next) {
      try {
        
        const businessId = req.business?.businessId

        if(!businessId) {
          throw new HttpError("Business not found",404,"Business not found",null)
        }
        const todayStats = await missedCallService.getTodayStats(businessId)
   if (process.env.NODE_ENV === 'development') {
  console.log("Today stats:", todayStats);
}
  return   res.status(200).json({
          success: true,
          data: todayStats
        })
      } catch (error) {
        console.log("Today stats error:",error)
        next(error)
      }
    },


async getMonthStat(req,res,next) {
      try {
        const businessId = req.business?.businessId;

        if (!businessId) {
          throw new HttpError("Business not found", 404, "Business not found", null)
        }
     const monthstat = await missedCallService.getMonthStat(businessId)
     if (process.env.NODE_ENV === 'development') {
  console.log("Month stat:",monthstat)
}
     return res.status(200).json({
      success: true,
      data: monthstat
     })
    }catch(error) {
      next(error)
    }
  },

  async getRecentActivity(req,res,next) {
    try {
      const businessId = req.business?.businessId;

      

      if (!businessId) {
        throw new HttpError("Business not found", 404, "Business not found", null)
      }
      const recentActivity = await missedCallService.getRecentActivity(businessId)
    return  res.status(200).json({
        success: true,
        data: recentActivity
      })
    } catch (error) {
      next(error)
    }
  },

async listCalls(req, res, next) {
  try {
    const parsed = await ListCallsQuerySchema.safeParseAsync(req.query);
 if (!parsed.success) {
          throw new HttpError(
            "Invalid query parameters",
            400,
            "Invalid query parameters", formatZodValidationError(parsed));
        }
        const {page,limit,status} = parsed.data;
        const businessId = req.business?.businessId;

    if(!businessId) {
      throw new HttpError("Business not found",404,"Business not found",null)  }

      const calls = await missedCallService.listCalls({page,limit,status,businessId})

     return res.status(200).json({
        success: true,
        data: calls
      })

  } catch (error) {
    next(error)
  }
},



async markCallAsRecovered(req,res,next) {
  try {
   const parsed = await UpdateCallAsRecovered.safeParseAsync(req.body)
   const businessId = req.business?.businessId;

   if(!parsed.success) {
    throw new HttpError("Invalid request body",400,"Invalid request body",formatZodValidationError(parsed))
   }

   if(!businessId) {
    throw new HttpError("Business not found",404,"Business not found",null)
   }
   const updated = await missedCallService.markCallAsRecovered({...parsed.data,businessId})
   return res.status(200).json({
    success: true,
    data: updated
   })
   
    
  } catch (error) {
    next(error)
  }
}


  };
};