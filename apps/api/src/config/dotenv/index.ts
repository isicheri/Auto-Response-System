import dotenv from "dotenv";
import {str,port,cleanEnv} from "envalid";
import path from "path";

const pathArray = process.cwd()
  .split("\\")
  .filter(e => e !== "apps" && e !== "api");

const finalPath = path.join(...pathArray,".env");
dotenv.config({path: finalPath})

export const config = cleanEnv(process.env, {

    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    Api_Port: port({default: 5000}),
    Api_Url: str({default: 'http://localhost:5000'}),

    Frontend_Url: str({default: 'http://localhost:3000'}),
    
    TWILIO_ACCOUNT_SID: str(),
    TWILIO_AUTH_TOKEN: str(),
    VOICE_WEBHOOK_URL: str(),
    TWILIO_PHONE_NUMBER: str(),
    JWT_SECRET: str()

});