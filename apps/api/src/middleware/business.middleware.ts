import express from "express";
import jwt from "jsonwebtoken";
import { config } from "src/config/dotenv";
import HttpError from "src/config/handlers/httperror";

declare global {
namespace Express {
    interface Request {
        business?: {
            businessId?: string;
        }
    }
}
}


interface JwtPayload {
    businessId: string;
}


export const businessMiddleware = (req:express.Request,res: express.Response,next: express.NextFunction) => {
    try {
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new HttpError('Unauthorized',401,"No token provided", null);
        }

        const token = authHeader.split(' ')[1];
        if(!token) throw new HttpError('Unauthorized',401,"No token provided", null);
        const verifyToken = jwt.verify(token,config.JWT_SECRET) as JwtPayload;

    if(!verifyToken.businessId) throw new HttpError('Unauthorized',401,"Invalid token", null);
    req.business = {
        businessId: verifyToken.businessId
    }
    next();
    } catch (error) {
    next(error)        
    }
}