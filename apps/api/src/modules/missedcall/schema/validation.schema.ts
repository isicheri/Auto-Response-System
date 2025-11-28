import { z } from "zod";

// Schema for incoming Twilio Voice webhook
export const TwilioVoiceWebhookSchema = z.object({
  CallSid: z.string(),
  AccountSid: z.string(),
  From: z.string(), // Caller's phone number
  To: z.string(), // Your Twilio number
  CallStatus: z.enum([
    "queued",
    "ringing",
    "in-progress",
    "completed",
    "busy",
    "no-answer",
    "failed",
    "canceled"
  ]),
  Direction: z.string().optional(),
  CallerName: z.string().optional().default("Unknown Caller"),
  Timestamp: z.string().optional(),
});

// Schema for your internal missed call creation
export const MissedCallSchema = z.object({
  businessId: z.string().uuid(),
  callerName: z.string(),
  callerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
  timeStamp: z.coerce.date(), // Converts string to Date
  callStatus: z.enum(["pending", "responded", "recovered", "lost"]).default("pending")
});

// Schema for SMS reply webhook from Twilio
export const TwilioSMSWebhookSchema = z.object({
  MessageSid: z.string(),
  AccountSid: z.string(),
  From: z.string(), // Customer's phone
  To: z.string(), // Your Twilio number
  Body: z.string(), // SMS message content
  NumMedia: z.string().optional(),
});


//Schema to validate query parameters
export const ListCallsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),  // ← z.coerce converts string to number
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "responded", "recovered", "lost"]).optional(), 
});

export const UpdateCallAsRecovered = z.object({
  missedCallId: z.string(),
  estimatedValue: z.number().nonnegative()
})


export type TwilioVoiceWebhookDto = z.infer<typeof TwilioVoiceWebhookSchema>;
export type MissedCallDto = z.infer<typeof MissedCallSchema>;
export type TwilioSMSWebhookDto = z.infer<typeof TwilioSMSWebhookSchema>;
export type ListCallsQueryDto = z.infer<typeof ListCallsQuerySchema>;
export type UpdateCallAsRecoveredDto = z.infer<typeof UpdateCallAsRecovered>