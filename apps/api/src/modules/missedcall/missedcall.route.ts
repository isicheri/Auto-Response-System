import express from "express";
import { MissedCallService } from "./missedcall.service";
import { MissedCallController } from "./missedcall.controller";
import { responseHandler } from "../../config/handlers/responseHandler";
import { validateTwilioSignature } from "src/middleware/validateTwilioSignature";
import { businessMiddleware } from "src/middleware/business.middleware";

const missedCallRouter: express.Router = express.Router();
const missedCallService = new MissedCallService();
const missedCallController = MissedCallController(missedCallService);

/**
 * 📞 Voice Webhook - Receives call status from Twilio
 * Configure this URL in Twilio Console under Voice Settings
 */
missedCallRouter.post(
  "/webhook/voice",
  validateTwilioSignature,
  responseHandler(missedCallController.handleVoiceWebhook)
);

/**
 * 💬 SMS Reply Webhook - Receives customer SMS responses
 * Configure this URL in Twilio Console under Messaging Settings
 */
missedCallRouter.post(
  "/webhook/sms-reply",
  validateTwilioSignature,
  responseHandler(missedCallController.handleSMSReply)
);



missedCallRouter.get(
  "/stats/today",
  businessMiddleware,
  responseHandler(missedCallController.getTodayStats)
);

missedCallRouter.get(
  "/stats/month"
,businessMiddleware,responseHandler(missedCallController.getMonthStat));

missedCallRouter.get(
  "/activity/recent",
  businessMiddleware,
  responseHandler(missedCallController.getRecentActivity)
)

missedCallRouter.get(
  "/calls",
  businessMiddleware,
  responseHandler(missedCallController.listCalls)
)

export default missedCallRouter;