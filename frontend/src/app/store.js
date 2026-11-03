import {createStore} from "redux";
import authReducer from "../features/auth/authReducer";

const store = createStore(authReducer);

export default store;