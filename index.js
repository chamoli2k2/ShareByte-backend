import cors from "cors";
import { db } from "./db.js";
import express, { json } from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { user_router } from "./routers/user.js";
import { User } from "./models/User.js";
import { Post } from "./models/Post.js";
import { post_router } from "./routers/post.js";

config(); //---- Load .env file into node's process.env

//----[Express Things]-----------------------------------------------
const app = express();

//----[Middlewares]----------------------------------------
app.use(cors());
app.use(cookieParser());
app.use(json());

app.use((req, res) => {
    // just log incomming requests
    console.log("🔵", req.method, req.url);
    req.next();
})
//--------------------------------------------------------
//-[Routers]----------------------------------------------

app.use(user_router);
app.use(post_router);



// TODO : delete these (these are only for test and debug purpose)
app.get('/all_users', async (req, res) => {
    const users = await User.findAll();
    res.status(200).json({ users });
})

app.get('/all_posts', async (req, res) => {
    const posts = await Post.findAll();
    res.status(200).json({ posts });
})

app.get('/reset_users', async (req, res) => {
    await User.sync({ force: true });
    res.status(200).json({
        message: 'reset',
    })
});

app.get('/reset_posts', async (req, res) => {
    await Post.sync({ force: true });
    res.status(200).json({
        message: 'reset',
    })
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'ok' });
})

//--------------------------------------------------------

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