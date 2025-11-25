import dotenv from "dotenv";
import {str,port,cleanEnv} from "envalid";
// import path from "path";

dotenv.config();

export const config = cleanEnv(process.env, {

    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    Api_Port: port({default: 5000}),
    Api_Url: str({default: 'http://localhost:5000'}),

    Frontend_Url: str({default: 'http://localhost:3000'}),
    

});