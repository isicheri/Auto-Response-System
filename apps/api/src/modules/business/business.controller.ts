import express from "express";
import { BusinessService } from "./business.service";

interface iBusinessController {
    login: (req: express.Request,res: express.Response,next: express.NextFunction) => Promise<express.Response | void>;
    currentBusiness:  (req: express.Request,res: express.Response,next: express.NextFunction) => Promise<express.Response | void>;
}


export const BusinessController = (businessService: BusinessService): iBusinessController => {

    return {
        login: async (req,res,next) => {
            try {
                const businessId = req.body.businessId;
                if(!businessId) {
                    throw new Error("Business not found")
                }
            
                const token = await businessService.login(businessId)
                return res.status(200).json({
                    success: true,
                    data: token
                })
            } catch (error) {
                next(error)
            }
        },

        currentBusiness: async (req, res, next) => {
            try {
                const businessId = req.business?.businessId;
                if(!businessId) {
                    throw new Error("Business not found")
                }
                const business = businessService.currentBusiness(businessId)
                return res.status(200).json({
                    success: true,
                    data: business
                })
            } catch (error) {
                next(error)
            }
        },
}
}