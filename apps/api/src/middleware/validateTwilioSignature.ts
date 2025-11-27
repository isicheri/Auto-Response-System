import express from "express";
import { TwilioService } from "../services/twillio.service";

export const validateTwilioSignature = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const twilioSignature = req.headers["x-twilio-signature"] as string;
  
  if (!twilioSignature) {
    return res.status(403).json({ error: "Missing Twilio signature" });
  }

  const twilioService = new TwilioService();
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  
  const isValid = twilioService.validateWebhook(
    twilioSignature,
    url,
    req.body
  );

  if (!isValid) {
    return res.status(403).json({ error: "Invalid Twilio signature" });
  }

  next();
};