export const constants = {
    cookie_keys: {
        jwt_token: '_utn', // used as key of jwt cookie
        profile_public_info: 'profile_json',
    },
    cookie_settings: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days expiration time
        httpOnly: true,
        domain: process.env.CLIENT_DOMAIN,
        sameSite: 'NONE',
    },
    messages: { // used as common message to send in response
        user_not_found: 'user not found',
        user_logged_out_successfully: 'user logged out successfully',
        user_created_successfully: 'user created successfully',
        phone_must_be_unique: 'phone must be unique',
        phone_number_already_registered: 'phone number already registered',
        wrong_phone_number_or_password: 'wrong phone number or password',
        user_logged_in: 'user logged in',
        user_not_logged_in: 'user not logged in',
        something_went_wrong: 'something went wrong',
        a_field_is_missing: 'a field is missing',
        no_post_found: 'no post found',
        internal_server_error: 'internal server error',
        user_has_no_permissions_to_perform_this_action: 'user has no permissions to perform this action',
        deleted_successfully: 'deleted successfully',

        status: { // used to set status field in response
            error: 'error',
            warning: 'warning',
            success: 'success',
        }
    },
    user: {
        types: {
            needy: 'needy',
            feeder: 'feeder',
        }
    }
};

Object.freeze(constants);