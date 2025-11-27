import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./src/config/dotenv";
import HttpError from "./src/config/handlers/httperror";
import indexRouter from "./src/routes";

const app: express.Express = express();

// Security & parsing middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", indexRouter);

// 404 handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = new HttpError("Route not found", 404, "Not Found",null);
  next(error);
});

// Global error handler
app.use(
  (
    error: HttpError,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();

    // Log error in development
    if (config.NODE_ENV === "development") {
      console.error("❌ Error:", error);
    }

    res.status(error.status || 500).json({
      success: false,
      method,
      url,
      timestamp,
      error: {
        name: error.name,
        message: error.message || "Internal server error",
        status: error.status,
        stack: config.NODE_ENV === "development" ? error.stack : undefined,
        errorobj: error.errorobj,
      },
    });
  }
);

// Start server
app.listen(config.Api_Port, () => {
  console.log(`
🚀 Server running on port ${config.Api_Port}
📍 Health check: http://localhost:${config.Api_Port}/api/v1/health
📞 Voice webhook: http://localhost:${config.Api_Port}/api/v1/missed-calls/webhook/voice
💬 SMS webhook: http://localhost:${config.Api_Port}/api/v1/missed-calls/webhook/sms-reply
  `);
});

export default app;