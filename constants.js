export const constants = {
    cookie_keys: {
        jwt_token: '_utn', // used as key of jwt cookie
    },
    messages: { // used as common message to send in response
        user_not_found: 'user not found',
        user_logged_out_successfully: 'user logged out successfully',
        user_created_successfully: 'user created successfully',
        phone_must_be_unique: 'phone must be unique',
        phone_number_already_registered: 'phone number already registered',
        wrong_phone_number_or_password: 'wrong phone number or password',
        user_logged_in: 'user logged in',
        user_not_logged_in:'user not logged in',
        something_went_wrong: 'something went wrong',
        
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