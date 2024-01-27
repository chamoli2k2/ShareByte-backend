import express, { Router } from "express";
import { uploder } from "../uploder.js";
import { post_controller } from "../controllers/post.js";

const post_child_router = Router();
export const post_router = Router().use('/post', post_child_router);

post_child_router
    .route('/')
    .get(post_controller.get_post)
    .post(
        uploder.array('images'),
        post_controller.create_post
    )
    .patch(
        uploder.array('images'),
        post_controller.edit_post
    );
post_child_router
    .route('/add_me_as_needy')
    .get(post_controller.add_me_as_needy)
    .delete(post_controller.remove_me_from_needy);

post_child_router
    .route('/add_me_as_helper')
    .get(post_controller.add_me_as_helper)
    .delete(post_controller.remove_me_from_helper);

post_child_router.use('/images', express.static('dump/uploads/imagess/'));