import express, { Router } from "express";
import { user_controllers } from "../../controllers/user.js";
import { uploder } from "../../uploder.js";


/**
 * @Doc
 * All Endpoints
 *  ----------------------------------------------------------------------------
 * /user/profile
 *  - GET | POST | PATCH
 *  *   use GET to get user profile of currently logged in user
 *      if ?id=xyz is passed then puplic profile of that user is returned
 *  *   use POST to create a new user profile (signup)
 *  *   use PATCH to update user profile
 *  ----------------------------------------------------------------------------
 *
 * /user/profile_pics/<name_of_image.png|.jpg...>
 * /user/logout
 * /user/login
 * 
 */


// we will attach routes to this child_user_router
// so that all routes are under /user/
const child_user_router = Router();
export const user_router = Router().use('/user', child_user_router);


// here its GET /user/profile since 
// we nest this child_user_router insier user_router
child_user_router
    .route('/profile')
    .get(user_controllers.get_user_profile)
    .post(uploder.single('profile_pic'), user_controllers.create_user)
    .patch(uploder.single('profile_pic'), user_controllers.update_user_profile);


// serve ../dump/uploads/profile_pics/
child_user_router.use('/profile_pics', express.static('dump/uploads/profile_pics/'))


child_user_router.get('/logout', user_controllers.logout_user);
child_user_router.post('/login', user_controllers.login_user);



