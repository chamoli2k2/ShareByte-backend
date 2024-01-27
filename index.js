import cors from "cors";
import { db } from "./db.js";
import express from "express";
import { config } from "dotenv";
import { uploder } from "./uploder.js";

config(); //---- Load .env file into node's process.env

//----[Express Things]-----------------------------------------------
const app = express();
app.use(cors());
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
    // return 'Hello World';
    res.send('ok');
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