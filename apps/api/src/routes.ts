import express from "express";
import missedCallRouter from "./modules/missedcall/missedcall.route";
import messageTemplateRouter from "./modules/messagetemplate/messagetemplate.route";
import businessRouter from "./modules/business/business.route";


const indexRouter: express.Router = express.Router();

// Health check endpoint
indexRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Missed Call Auto-Response API",
  });
});

// Missed call routes
indexRouter.use("/missed-calls", missedCallRouter);
indexRouter.use("/templates",messageTemplateRouter);
indexRouter.use("/business",businessRouter);

export default indexRouter;