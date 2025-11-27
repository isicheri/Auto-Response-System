import { Workflow, Step } from "@mastra/core";
import { TwilioService } from "../../services/twillio.service";
import { prisma } from "@autocall/db";

interface MissedCallWorkflowInput {
  missedCallId: string;
  callerName: string;
  callerPhone: string;
  businessId: string;
}

// STEP 1: Determine Message Scenario (business hours vs after-hours)
const determineScenarioStep: Step<MissedCallWorkflowInput, string> = {
  name: "determine-scenario",
  execute: async (input) => {
    const currentHour = new Date().getHours();
    
    // Business hours: 8 AM - 6 PM
    const isBusinessHours = currentHour >= 8 && currentHour < 18;
    
    // Check for emergency keywords in caller name (optional)
    const isEmergency = input.callerName.toLowerCase().includes("emergency");
    
    if (isEmergency) return "emergency";
    if (isBusinessHours) return "standard";
    return "afterHours";
  },
};

// STEP 2: Get Message Template from Database
const getTemplateStep: Step<{ businessId: string; scenario: string }, string> = {
  name: "get-template",
  execute: async (input) => {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        businessId: input.businessId,
        scenario: input.scenario as any,
        isActive: true,
      },
    });

    if (!template) {
      // Fallback template
      return "Hi [Name], sorry we missed your call! We'll get back to you soon. Reply with your issue and we'll prioritize you.";
    }

    return template.messageBody;
  },
};

// STEP 3: Personalize Message (Replace Variables)
const personalizeMessageStep: Step<
  { template: string; callerName: string; businessName: string },
  string
> = {
  name: "personalize-message",
  execute: async (input) => {
    let message = input.template;
    message = message.replace(/\[Name\]/g, input.callerName);
    message = message.replace(/\[Business\]/g, input.businessName);
    message = message.replace(/\[Time\]/g, new Date().toLocaleTimeString());
    return message;
  },
};

// STEP 4: Send SMS via Twilio
const sendSMSStep: Step<
  { callerPhone: string; message: string; missedCallId: string; templateName: string },
  { success: boolean; messageSid?: string }
> = {
  name: "send-sms",
  execute: async (input) => {
    const twilioService = new TwilioService();
    
    try {
      const result = await twilioService.sendSMS(
        input.callerPhone,
        input.message
      );

      // Log auto-response to database
      await prisma.autoResponse.create({
        data: {
          missedCallId: input.missedCallId,
          messageSent: input.message,
          templateUsed: input.templateName,
        },
      });

      return { success: true, messageSid: result.sid };
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return { success: false };
    }
  },
};

// MAIN WORKFLOW: Orchestrates all steps
export const missedCallWorkflow = new Workflow({
  name: "missed-call-auto-response",
  steps: [
    determineScenarioStep,
    getTemplateStep,
    personalizeMessageStep,
    sendSMSStep,
  ],
});

// Execute the workflow
export async function executeMissedCallWorkflow(input: MissedCallWorkflowInput) {
  try {
    // Step 1: Determine scenario
    const scenario = await determineScenarioStep.execute(input);

    // Step 2: Get template
    const business = await prisma.business.findUnique({
      where: { id: input.businessId },
    });

    if (!business) throw new Error("Business not found");

    const template = await getTemplateStep.execute({
      businessId: input.businessId,
      scenario,
    });

    // Step 3: Personalize message
    const personalizedMessage = await personalizeMessageStep.execute({
      template,
      callerName: input.callerName,
      businessName: business.name,
    });

    // Step 4: Send SMS
    const result = await sendSMSStep.execute({
      callerPhone: input.callerPhone,
      message: personalizedMessage,
      missedCallId: input.missedCallId,
      templateName: scenario,
    });

    return {
      success: result.success,
      scenario,
      messageSent: personalizedMessage,
    };
  } catch (error) {
    console.error("Workflow execution failed:", error);
    throw error;
  }
}