import twilio from "twilio";
import { config } from "../config/dotenv";

export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials missing");
    }

    this.client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
    this.fromNumber = config.TWILIO_PHONE_NUMBER;
  }

  /**
   * Send SMS to a customer
   */
  async sendSMS(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to,
      });

      console.log(`SMS sent to ${to}: ${message.sid}`);
      return {
        success: true,
        sid: message.sid,
        status: message.status,
      };
    } catch (error: any) {
      console.error("Twilio SMS Error:", error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Validate Twilio webhook signature (security)
   */
  validateWebhook(signature: string, url: string, params: any): boolean {
    const authToken = config.TWILIO_AUTH_TOKEN;
    return twilio.validateRequest(authToken, signature, url, params);
  }

  /**
   * Get call details from Twilio (optional - for verification)
   */
  async getCallDetails(callSid: string) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return call;
    } catch (error: any) {
      console.error("Failed to fetch call details:", error.message);
      return null;
    }
  }
}