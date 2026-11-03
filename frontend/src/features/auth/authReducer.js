const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
};

function authReducer(state = initialState, action) {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
            };

        case "UPDATE_PROFILE":
            return {
                ...state,
                user: action.payload,
            };

        case "LOGOUT":
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
            };

        default:
            return state;
    }
}

export default authReducer;
/*
const initialState = {
    user:null,
    token:null,
    isAuthenticated:false
}
*/

/*
!! localStorage.getItem("token") => 
It converts the token value into a boolean:
- Token exists → true
- Token doesn't exist → false
*/
