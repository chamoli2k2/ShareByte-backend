import { compare, hash } from "bcrypt";
import { constants } from "../constants.js";
import { User } from "../models/User.js";
import { delete_file, jwt_sign, jwt_verify } from "../utils.js";
import { unlinkSync } from "node:fs";

//-[Helpers]------------------------------------------------------
// returns data that should be displayed publicly
// accepts user_data from User model
function _extract_public_profile_data(user_data) {
    return {
        id: user_data.id,
        name: user_data.name,
        phone: user_data.phone,
        photo: user_data.photo,
        bio: user_data.bio,
    };
}
// returns data for user to store in private cookie
// accepts user_data from User model
function _extract_private_profile_data(user_data) {
    return {
        id: user_data.id,
        bio: user_data.bio,
        phone: user_data.phone,
        password: user_data.password,
        name: user_data.name,
        photo: user_data.photo,
        location_lat: user_data.location_lat,
        location_long: user_data.location_long,
    };
}
//-----------------------------------------------------------------
//---[utils for checking user inputs]------------------------------

function _is_vlaid_user_name(name) {
    if (!name) return false;
    return name.trim().length > 2;
}

function _is_valid_user_phone_no(phone) {
    if (!phone) return false;
    return (phone.trim().length >= 10 || phone.trim().length <= 13);
}

//---------------------------------------------------------------
const create_user = async (req, res) => {
    const photo = req.file ? req.file.filename.split('/').pop() : null;
    const { name, phone, password, bio, location_lat, location_long } = req.body;
    console.log(req.body);
    //----[User Input Validation]------------------------------------------
    // name
    if (!_is_vlaid_user_name(name)) {
        if (req.file) delete_file(req.file.path);
        return res.status(400).json({
            data: {
                message: `name is too short`,
            },
            status: constants.messages.status.warning,
        });
    }
    // phone 
    if (!_is_valid_user_phone_no(phone)) {
        if (req.file) delete_file(req.file.path);

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
        if (req.file) delete_file(req.file.path);
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
                data: _extract_public_profile_data(user_data),
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

const update_user_profile = async (req, res) => {

    const jwt = req.cookies[constants.cookie_keys.jwt_token];
    try {
        const jwt_details = jwt_verify(jwt);
        const id = jwt_details.id;
        const { name, bio, phone, password, location_lat, location_long } = req.body;

        // photo is undefined if no pic is uploaded
        // else its pic's name
        const photo = req.file ? req.file.filename.split('/').pop() : undefined;

        const hashed_password = password ? await hash(password, 10) : undefined;
        const new_data = {
            // if anything is not valid then take previous value from jwt
            name: _is_vlaid_user_name(name) ? name : jwt_details.name,
            bio,
            phone: _is_valid_user_phone_no(phone) ? phone : jwt_details.phone,
            photo,
            password: hashed_password,
            location_lat,
            location_long,
        };

        const user = await User.findByPk(id);
        const updated_data = await user.update(new_data);

        res.cookie(constants.cookie_keys.jwt_token, jwt_sign(
            _extract_private_profile_data(updated_data.dataValues)
        ), constants.cookie_settings);

        res.status(200).json({
            data: _extract_private_profile_data(updated_data.dataValues),
            status: constants.messages.status.success,
        })
        try {

            if (photo) { // delete old pic
                unlinkSync("dump/uploads/profile_pics/" + jwt_details.photo); //-- delete old dp file
            }
        } catch (file_err) {
            console.log('file_err', file_err);
        }

    } catch (error) {

        console.log(error);

        res.status(500).json({
            data: {
                message:
                    constants.messages.user_not_logged_in,
            },
            status: constants.messages.status.error,
        })

    }

}

const logout_user = (req, res) => {
    res.cookie(constants.cookie_keys.jwt_token, "", { ...constants.cookie_settings, maxAge: -1 });

    res.status(200).json({
        data: {
            message: constants.messages.user_logged_out_successfully,
        },
        status: constants.messages.status.success,
    });
}

const login_user = async (req, res) => {
    const { phone, password } = req.body;
    try {
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

        console.log(user.photo);
        // set cookie
        res.cookie(constants.cookie_keys.jwt_token, jwt_sign(
            _extract_private_profile_data(user)
        ), constants.cookie_settings);

        res.status(200).json({
            data: _extract_public_profile_data(user),
            status: constants.messages.status.success,
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: {
                message: constants.messages.internal_server_error,
            },
            status: constants.messages.status.error,
        })

    }
}

export const user_controllers = {
    login_user,
    logout_user,
    create_user,
    get_user_profile,
    update_user_profile,
};