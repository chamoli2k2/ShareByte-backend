import { compare, hash } from "bcrypt";
import { constants } from "../constants.js";
import { User } from "../models/User.js";
import { delete_file, jwt_sign, jwt_verify } from "../utils.js";





/// utils for creating user

const create_user = async (req, res) => {
    const photo = req.file ? req.file.filename.split('/').pop() : null;
    const { type, name, phone, password, bio, location_lat, location_long } = req.body;

    //----[User Input Validation]------------------------------------------
    // type
    if (!(Object.values(constants.user.types).includes(type))) {
        delete_file(req.file.path);
        return res.status(400).json({
            data: {
                message: `type of user must be in ${constants.user.types.join(',')}`
            },
            status: constants.messages.status.warning,
        })
    }
    // name
    if (name.trim().length <= 2) {
        delete_file(req.file.path);
        return res.status(400).json({
            data: {
                message: `name is too short`,
            },
            status: constants.messages.status.warning,
        });
    }
    // phone 
    if (phone.trim().length < 10 || phone.trim().length > 13) {
        delete_file(req.file.path);
        return res.status(400).json({
            data: {
                message: `invalid phone number`,
            },
            status: constants.messages.status.warning,
        });
    }
    //-------------------------------------------------------------------
    // Everything is ok till now
    // We just need to see if phone number is unique yet in 
    // proceeding lines

    const hashed_password = await hash(password, 10);
    try {
        const result = await User.create({
            photo,
            type,
            name,
            phone,
            password: hashed_password,
            bio,
            location_lat,
            location_long
        }, { logging: false });


        res.status(200).json({
            data: {
                message: constants.messages.user_created_successfully,
            },
            status: constants.messages.status.success,
        })
    } catch (err) {
        delete_file(req.file.path);
        // if phone's unique integrity is broken
        if (err.errors[0].message == constants.messages.phone_must_be_unique) {
            res.status(400).json({
                data: {
                    message: constants.messages.phone_number_already_registered,
                },
                status: constants.messages.status.error,
            });
        } else {
            // ? something else
            const message = err.errors[0].message;
            res.status(400).json({
                data: {
                    message,
                },
                status: constants.messages.status.error,
            });
        }
    }
}


const get_user_profile = async (req, res) => {
    const { query } = req;
    // if id field is present in query param then we fetch 
    // user data of given id else we return user data of 
    // currently logged in user

    if (query?.id) {

        const user_data = await User.findByPk(query.id);

        if (!user_data) {

            return res.status(404).json({
                data: {
                    message: constants.messages.user_not_found,
                },
                status: constants.messages.status.error,
            });

        } else {
            return res.status(200).json({
                data: {
                    id: user_data.id,
                    type: user_data.type,
                    name: user_data.name,
                    phone: user_data.phone,
                    photo: user_data.photo,
                    bio: user_data.bio,
                },
                status: constants.messages.status.success,
            });
        }
    }


    // NOTE : we dont use database here
    // instead we return object from jwt
    const jwt = req.cookies[constants.cookie_keys.jwt_token];
    try {
        const jwt_details = jwt_verify(jwt);
        
        res.status(200).json({
            data: {
                ...jwt_details
            },
            status: constants.messages.status.success,
        })
    } catch (error) {
        res.status(400).json({
            data: {
                message:
                    constants.messages.something_went_wrong,
            },
            status: constants.messages.status.error,
        })

    }
}

const update_user_profile = (req, res) => {
    console.log('updating user profile');
}

const logout_user = (req, res) => {
    res.cookie(constants.cookie_keys.jwt_token, "");
    res.status(200).json({
        data: {
            message: constants.messages.user_logged_out_successfully,
        },
        status: constants.messages.status.success,
    });
}

const login_user = async (req, res) => {
    const { phone, password } = req.body;

    const user = (await User.findOne({
        where: { phone }
    }))?.dataValues;

    if (!user || !(await compare(password, user.password))) {
        return res.status(400).json({
            data: {
                message: constants.messages.wrong_phone_number_or_password,
            },
            status: constants.messages.status.error,
        })
    }


    // set cookie
    res.cookie(constants.cookie_keys.jwt_token, jwt_sign({
        id: user.id,
        type: user.type,
        bio: user.bio,
        phone: user.phone,
        password: user.password,
        name: user.name,
        photo: user.photo,
        location_lat: user.location_lat,
        location_long: user.location_long,
    }));

    res.status(200).json({
        data: {
            message: constants.messages.user_logged_in,
        },
        status: constants.messages.status.success,
    })
}

export const user_controllers = {
    login_user,
    logout_user,
    create_user,
    get_user_profile,
    update_user_profile,
};