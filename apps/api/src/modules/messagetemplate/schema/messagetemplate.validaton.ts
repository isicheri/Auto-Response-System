import { z } from "zod";

export const MessageTemplateSchema = z.object({
 businessId: z.string().uuid(),
  name: z.string(),
  scenario: z.enum(["standard", "afterHours", "emergency"]),
  messageBody: z.string(),
  isActive: z.boolean().default(true),
});



export const ListMessageTemplateQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),  // ← z            
  limit: z.coerce.number().min(1).max(100).default(20),
  scenario: z.enum(["standard", "afterHours", "emergency"]).optional(), 
  search: z.string().optional()
});


export const UpdateMessageTemplateSchema = z.object({
  name: z.string(),
  scenario: z.enum(["standard", "afterHours", "emergency"]),
  messageBody: z.string(),
  isActive: z.boolean().default(true),
});



export type MessageTemplateDto = z.infer<typeof MessageTemplateSchema>;
export type ListMessageTemplateQueryDto = z.infer<typeof ListMessageTemplateQuerySchema>;
export type UpdateMessageTemplateDto = z.infer<typeof UpdateMessageTemplateSchema>;