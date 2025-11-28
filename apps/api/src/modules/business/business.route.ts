import express from "express";
import { responseHandler } from "src/config/handlers/responseHandler";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { businessMiddleware } from "src/middleware/business.middleware";

const businessRouter: express.Router = express.Router();
const businessService = new BusinessService();
const businessController = BusinessController(businessService);


businessRouter.post("/login",responseHandler(businessController.login))
businessRouter.get("/current",businessMiddleware,responseHandler(businessController.currentBusiness))

export default businessRouter;