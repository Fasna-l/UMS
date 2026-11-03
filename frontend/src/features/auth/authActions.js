const loginAction = (user, token) => {
    return {
        type: "LOGIN",
        payload: {
            user,
            token,
        },
    };
};

const logoutAction = () => {
    return {
        type: "LOGOUT",
    };
};

// Update user profile in Redux
const updateProfileAction = (user) => {
    return {
        type: "UPDATE_PROFILE",
        payload: user,
    };
};

export {
    loginAction,
    logoutAction,
    updateProfileAction,
};