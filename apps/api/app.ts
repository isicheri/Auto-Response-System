import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./src/config/dotenv";
import HttpError from "./src/config/handlers/httperror";
import indexRouter from "./src/routes";


const app:express.Express = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req: express.Request, res:express.Response, next:express.NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use("/api/v1",indexRouter);

app.use((error: HttpError,req: express.Request, res:express.Response, _next:express.NextFunction) => {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();
    res.status(error.status).json({
        success: false,
        method: method,
        url: url,
        timestamp: timestamp,
    error: {
        name: error.name,
        message: error.message || 'Internal server error',
        status: error.status,
        stack: (config.NODE_ENV === 'development' && { stack: error.stack }) || undefined,
        errorobj: error.errorobj
    }
    })
})
    
app.listen(config.Api_Port, () => console.log(`Server running on port ${config.Api_Port}`));

export default app;