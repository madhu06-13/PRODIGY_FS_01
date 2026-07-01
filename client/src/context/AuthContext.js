import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

/* =====================
   Reducer
===================== */
const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };

        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false
            };

        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            };

        default:
            return state;
    }
};

/* =====================
   Provider
===================== */
export const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    /* =====================
       Set Token Helper
    ===================== */
    const setAuthToken = token => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    /* =====================
       Load User
    ===================== */
    const loadUser = async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        }

        try {
            const res = await axios.get(
                'http://localhost:5000/api/auth/user'
            );

            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    /* =====================
       Register
    ===================== */
    const register = async formData => {
        try {
            await axios.post(
                'http://localhost:5000/api/auth/register',
                formData
            );

        
            dispatch({
                type: 'LOGOUT',
            
            });

           
        } catch (err) {
            throw err.response.data;
        }
    };

    /* =====================
       Login
    ===================== */
    const login = async formData => {
        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                formData
            );

            // IMPORTANT: set token immediately
            setAuthToken(res.data.token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });

            loadUser();
        } catch (err) {
            throw err.response.data;
        }
    };

    /* =====================
       Logout
    ===================== */
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
        setAuthToken(null);
    };

    /* =====================
       On App Load
    ===================== */
    useEffect(() => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
            loadUser();
        } else {
            dispatch({ type: 'AUTH_ERROR' });
        }
        // eslint-disable-next-line
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
