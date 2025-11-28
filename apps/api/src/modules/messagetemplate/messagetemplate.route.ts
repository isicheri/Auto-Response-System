import express from "express";
import { MessageTemplateService } from "./messagetemplate.service";
import { responseHandler } from "src/config/handlers/responseHandler";
import { MessageTemplateController } from "./messagetemplate.controller";
import { businessMiddleware } from "src/middleware/business.middleware";

const messageTemplateRouter:express.Router = express.Router();
const messageTemplateService = new MessageTemplateService();
const messageTemplateController = MessageTemplateController(messageTemplateService);

messageTemplateRouter.use(businessMiddleware);

messageTemplateRouter.post(
  "/create",
  responseHandler(messageTemplateController.create)
);

messageTemplateRouter.get(
  "/list",
  responseHandler(messageTemplateController.list)
);

messageTemplateRouter.get(
  "/:id",
  responseHandler(messageTemplateController.get)
);

messageTemplateRouter.patch(
  "/:id",
  responseHandler(messageTemplateController.update)
);

messageTemplateRouter.delete(
  "/:id",
  responseHandler(messageTemplateController.delete)
);

// messageTemplateRouter.post(
//   "/:id/send",
//   responseHandler(messageTemplateController.send)
// );


export default messageTemplateRouter;