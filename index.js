import cors from "cors";
import { db } from "./db.js";
import express from "express";
import { config } from "dotenv";
import { uploder } from "./uploder.js";
import { jwt_sign, jwt_verify } from "./utils.js";
import cookieParser from "cookie-parser";
import { constants } from "./constants.js";

config(); //---- Load .env file into node's process.env

//----[Express Things]-----------------------------------------------
const app = express();

//----[Middlewares]----------------------------------------
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRETE));
//--------------------------------------------------------

app.use((req, res) => {
    console.log(req.method, req.url);
    req.next();
})

app.post('/upload', uploder.single('image'), (req, res) => {
    if (!req.file || !req.file.fieldname) return res.end('not ok');
    console.log(req.file, req.body);
    res.end('ok');
})

app.get('/', (req, res) => {
    // // const jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfbmFtZSI6ImhlbGxvIiwiZW1haWwiOiJ3b3JsZCJ9LCJpYXQiOjE3MDU1Nzg2Njd9.mKDJ56V-CbWME6NcQ7R0ecyuC-X4x38S3dfHQrsdxEw";
    // // res.cookie(constants.cookie_keys.jwt_token, jwt_token, { signed: true });
    // // const jwt_token = req.signedCookies[constants.cookie_keys.jwt_token];
    // // console.log("cookies[jwt_token]", req.cookies[constants.cookie_keys.jwt_token]);
    // // console.log("sc", req.signedCookies);
    // // res.cookie(constants.cookie_keys.jwt_token, jwt_token);
    // // const jwt_token = jwt_sign({ data: { user_name: 'hello', email: 'world' } });
    // // console.log('jwt_token', jwt_token);
    // // const verify = jwt_verify(jwt_token)
    // // const verify = jwt_verify(jwt_token)
    // // console.log('verify', verify);

    res.status(200).json({ message: 'ok' });
})

//--------------------------------------------------------------------

//----[ Instantiate Everything ]--------------------------------------
console.log("👨‍🚀 Connecting to Database....");
await db.authenticate({ logging: false });
db.sync({ logging: false });
console.log("✅ Connected to Database.");

console.log("🚀 Spinning up express server....");
app.listen(process.env.PORT, () => {
    console.log(`✅ Server started at port ${process.env.PORT}`);
})
//--------------------------------------------------------------------