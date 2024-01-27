import { constants } from "../constants.js";
import { Post } from "../models/Post.js";
import { jwt_verify } from "../utils.js";
import { unlinkSync } from "node:fs";



//-[Helper Functions]-------------------------------------------------
// returns post data provides post id only if 
// user is creator of the post
async function _get_post_if_user_can_edit(user_id, post_id) {
    try {
        const post = (await Post.findByPk(post_id));

        if (post && post.dataValues && (post.dataValues.user_id == user_id)) {
            return post;
        }

        return null;

    } catch (err) {
        return null;
    }
}

//--------------------------------------------------------------------


//-[Controller Methods]-----------------------------------------------

const get_post = async (req, res) => {
    const { query } = req;

    if (query && query.id) {
        const post = (await Post.findByPk(query.id))?.dataValues;

        if (post) {
            // return post's info if its found
            res.status(200).json({
                data: {
                    ...post
                },
                status: constants.messages.status.success,
            });
        } else {
            // if no post is found with this id
            res.status(400).json({
                data: {
                    message: constants.messages.no_post_found,
                },
                status: constants.messages.status.warning,
            });
        }
    } else {
        // if query.id is not defined i.e not passed from user input
        res.status(400).json({
            data: {
                message: constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }
}

const create_post = async (req, res) => {
    const jwt = req.cookies[constants.cookie_keys.jwt_token];

    try {
        // if no file is uploaded
        if (!req.files || req.files.length <= 0) {
            return res.status(400).json({
                data: {
                    message:
                        constants.messages.a_field_is_missing,
                },
                status: constants.messages.status.error,
            })

        }

        const jwt_details = jwt_verify(jwt);
        const user_id = jwt_details.id;
        const { title, description, location_lat, location_long } = req.body;
        const images = req.files.map(file => file.filename.split('/').pop());
        console.log(req.files);
        console.log(
            { user_id, title, images, description, location_lat, location_long }
        );

        const post = (await Post.create({
            user_id,
            title,
            images,
            description,
            location_lat,
            location_long
        })).dataValues;


        res.status(200).json({
            data: post,
            status: constants.messages.status.success,
        });
    } catch (err) {
        res.status(400).json({
            data: {
                message:
                    constants.messages.user_not_logged_in,
            },
            status: constants.messages.status.error,
        })
    }
}




const edit_post = async (req, res) => {
    // check if user is loggged in
    const { query } = req;

    if (!query || !query.id) {
        return res.status(400).json({
            data: {
                message:
                    constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }

    const jwt = req.cookies[constants.cookie_keys.jwt_token];

    try {
        // see if user id logged in
        const jwt_details = jwt_verify(jwt);
        const user_id = jwt_details.id;
        const query_post_id = query.id;

        const post = await _get_post_if_user_can_edit(user_id, query_post_id);
        if (post) {
            const post_data = post.dataValues;
            const old_images = [...(post_data.images)];

            const { title, description, location_lat, location_long } = req.body;
            const images = (req.files && (req.files.length > 0)) ?
                req.files.map(file => file.filename.split('/').pop()) : undefined;

            const new_post_data = (await post.update({
                title,
                description,
                location_lat,
                location_long,
                images
            })).dataValues;

            res.status(200).json({
                data: new_post_data,
                status: constants.messages.status.success,
            })


            // delete old images if new images are uploaded
            if (images && images.length > 0) {
                old_images.map(image_name => {
                    const file_path = 'dump/uploads/imagess/' + image_name;
                    try {
                        unlinkSync(file_path);
                        console.log(`deleted old image ${file_path}`);
                    } catch (err) {
                        console.log(`failed deleting ${file_path}`)
                    }
                });
            }

        } else {
            res.status(400).json({
                data: {
                    message:
                        constants.messages.user_has_no_permissions_to_perform_this_action,
                },
                status: constants.messages.status.error,
            })
        }




    } catch (err) {
        res.status(400).json({
            data: {
                message:
                    constants.messages.user_not_logged_in,
            },
            status: constants.messages.status.error,
        })
    }
}

// adds current logged in user as hungry for a post
const add_me_as_needy = async (req, res) => {
    const { query } = req;

    if (query && query.post_id) {
        const jwt = req.cookies[constants.cookie_keys.jwt_token];
        try {
            const jwt_details = jwt_verify(jwt);
            const post = await Post.findByPk(query.post_id);
            const hungry = post.dataValues.needys_user_id ?? [];

            if (hungry.includes(jwt_details.id) || (post.dataValues.user_id == jwt_details.id)) {
                // (post.dataValues.user_id == jwt_details.id) says that 
                // user who have created the post cant be needy
                res.status(200).json({
                    data: post.dataValues,
                    status: constants.messages.status.success,
                })
            } else {
                const updated_post_data = (await post.update({
                    needys_user_id: [...hungry, jwt_details.id],
                })).dataValues;

                res.status(200).json({
                    data: updated_post_data,
                    status: constants.messages.status.success,
                })
            }

        } catch (err) {
            return res.status(400).json({
                data: {
                    message:
                        constants.messages.user_not_logged_in,
                },
                status: constants.messages.status.error,
            })
        }
    } else {
        return res.status(400).json({
            data: {
                message:
                    constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }
}

// removes current logged in user from hungry for a post
const remove_me_from_needy = async (req, res) => {
    const { query } = req;

    if (query && query.post_id) {
        const jwt = req.cookies[constants.cookie_keys.jwt_token];
        try {
            const jwt_details = jwt_verify(jwt);
            const post = await Post.findByPk(query.post_id);
            const hungry = post.dataValues.needys_user_id ?? [];
            if (!hungry.includes(jwt_details.id)) {
                res.status(200).json({
                    data: post.dataValues,
                    status: constants.messages.status.success,
                })
            } else {
                const updated_post_data = (await post.update({
                    needys_user_id: hungry.filter(hid => hid != jwt_details.id),
                })).dataValues;

                res.status(200).json({
                    data: updated_post_data,
                    status: constants.messages.status.success,
                })
            }

        } catch (err) {

            return res.status(400).json({
                data: {
                    message:
                        constants.messages.user_not_logged_in,
                },
                status: constants.messages.status.error,
            })
        }
    } else {
        return res.status(400).json({
            data: {
                message:
                    constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }
}





// adds current logged in user as helper for a post
const add_me_as_helper = async (req, res) => {
    const { query } = req;

    if (query && query.post_id) {
        const jwt = req.cookies[constants.cookie_keys.jwt_token];
        try {
            const jwt_details = jwt_verify(jwt);
            const post = await Post.findByPk(query.post_id);
            const helpers = post.dataValues.helpers_user_id ?? [];

            if (helpers.includes(jwt_details.id) || (post.dataValues.user_id == jwt_details.id)) {
                // (post.dataValues.user_id == jwt_details.id) says that 
                // user who have created the post cant be helper
                res.status(200).json({
                    data: post.dataValues,
                    status: constants.messages.status.success,
                })
            } else {
                const updated_post_data = (await post.update({
                    helpers_user_id: [...helpers, jwt_details.id],
                })).dataValues;

                res.status(200).json({
                    data: updated_post_data,
                    status: constants.messages.status.success,
                })
            }

        } catch (err) {
            return res.status(400).json({
                data: {
                    message:
                        constants.messages.user_not_logged_in,
                },
                status: constants.messages.status.error,
            })
        }
    } else {
        return res.status(400).json({
            data: {
                message:
                    constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }
}

// removes current logged in user from helper for a post
const remove_me_from_helper = async (req, res) => {
    const { query } = req;

    if (query && query.post_id) {
        const jwt = req.cookies[constants.cookie_keys.jwt_token];
        try {
            const jwt_details = jwt_verify(jwt);
            const post = await Post.findByPk(query.post_id);
            const helpers = post.dataValues.helpers_user_id ?? [];
            if (!helpers.includes(jwt_details.id)) {
                res.status(200).json({
                    data: post.dataValues,
                    status: constants.messages.status.success,
                })
            } else {
                const updated_post_data = (await post.update({
                    helpers_user_id: helpers.filter(hid => hid != jwt_details.id),
                })).dataValues;

                res.status(200).json({
                    data: updated_post_data,
                    status: constants.messages.status.success,
                })
            }

        } catch (err) {

            return res.status(400).json({
                data: {
                    message:
                        constants.messages.user_not_logged_in,
                },
                status: constants.messages.status.error,
            })
        }
    } else {
        return res.status(400).json({
            data: {
                message:
                    constants.messages.a_field_is_missing,
            },
            status: constants.messages.status.error,
        })
    }
}

//--------------------------------------------------------------------

export const post_controller = {
    get_post,
    create_post,
    edit_post,
    add_me_as_needy,
    remove_me_from_needy,
    add_me_as_helper,
    remove_me_from_helper,
};