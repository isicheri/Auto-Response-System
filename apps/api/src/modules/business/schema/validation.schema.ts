import {z} from "zod";


export const BusinessSchema = z.object({
    name: z.string(),
    twilioNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
    phone: z.string().startsWith("+").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
});

export type BusinessDto = z.infer<typeof BusinessSchema>;