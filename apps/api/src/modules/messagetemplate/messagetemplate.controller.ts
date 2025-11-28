import express from "express";

import { MessageTemplateService } from "./messagetemplate.service";
import { ListMessageTemplateQuerySchema, MessageTemplateSchema, UpdateMessageTemplateSchema } from "./schema/messagetemplate.validaton";
import HttpError from "src/config/handlers/httperror";
import { format } from "path";
import formatZodValidationError from "src/config/handlers/formatvalidationerrror";



interface IMessageTemplateController {

    create: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>;
    list: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>;
    get: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>;
    update: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>;
    delete: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>; 
    send: (req:express.Request,res:express.Response,next:express.NextFunction) => Promise<express.Response | void>;

}


export const MessageTemplateController = (messageTemplateService: MessageTemplateService): IMessageTemplateController => {


    return {
        create: async (req,res,next) => {
            try {
            const parsed = await MessageTemplateSchema.safeParseAsync(req.body)
           if(!parsed.success) {
             throw new HttpError("Invalid request body",400,"Invalid request body",formatZodValidationError(parsed))
           }
           const messageTemplate = await messageTemplateService.create(parsed.data)
           return res.status(201).json({
            success: true,
            data: messageTemplate
           })
            } catch (error) {
                next(error)
            }
        },

        list: async (req,res,next) => {
            try {
                const parsed = await ListMessageTemplateQuerySchema.safeParseAsync(req.query)
            if(!parsed.success) {
                throw new HttpError("Invalid query parameters",400,"Invalid query parameters",formatZodValidationError(parsed))
            }
            const businessId = req.business?.businessId;
            if(!businessId) {
                throw new HttpError("Business not found",404,"Business not found",null)
            }
            const {page,limit,scenario,search} = parsed.data;
  
            const templates = await messageTemplateService.list({page,limit,scenario,search},businessId)
            return res.status(200).json({
                success: true,
                data: templates
            })
            } catch (error) {
                next(error)
            }
        },

        get: async (req,res,next) => {
            try {
                const businessId = req.business?.businessId;
                const templateId = req.params.id;
                if(!businessId) {
                    throw new HttpError("Business not found",404,"Business not found",null)
                }
                if(!templateId) {
                    throw new HttpError("Template not found",404,"Template not found",null)
                }
                const template = await messageTemplateService.get(templateId,businessId)
                return res.status(200).json({
                    success: true,
                    data: template
                })
            } catch (error) {
                next(error);
            }
        },

        update: async (req,res,next) => {
            try {
                const businessId = req.business?.businessId;
                const templateId = req.params.id;
                const parsed = await UpdateMessageTemplateSchema.safeParseAsync(req.body)


                if(!businessId) {
                throw new HttpError("Business not found",404,"Business not found",null)
                }

                if(!templateId) {
                    throw new HttpError("Template not found",404,"Template not found",null);
                }

                if(!parsed.success) {
                     throw new HttpError("Invalid ",400,"Invalid body parameters",formatZodValidationError(parsed))
                }

                const template = messageTemplateService.update(templateId,req.body,businessId);

             return res.status(200).json({
                success: true,
                data: template
            })
            } catch (error) {
                next(error)
            }
        },

        delete: async (req,res,next) => {
            try {
                const businessId = req.business?.businessId;
                const templateId = req.params.id;
               if(!templateId || !businessId) {
                throw new HttpError("Template not found or business not found",404,"Not found",null)
               }
               const deleted = await messageTemplateService.delete(templateId,businessId)
               return res.status(200).json({
                success: true,
                data: deleted
               })

            } catch (error) {
                next(error)
            }
        },

        
        send: async (req,res,next) => {}
    }
}