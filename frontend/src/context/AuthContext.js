import React, { createContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return { ...state, isAuthenticated: true, token: action.payload.token, loading: false };
    case 'USER_LOADED':
      return { ...state, isAuthenticated: true, user: action.payload, loading: false };
    case 'LOAD_INVITATIONS':
      return { ...state, invitations: action.payload };
    case 'TRIGGER_REFRESH':
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, token: null, isAuthenticated: false, loading: false, user: null, invitations: [] };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    invitations: [],
    refreshTrigger: 0,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const fetchInvitations = async () => {
    if (localStorage.token) {
        try {
            const res = await api.get('/invitations');
            dispatch({ type: 'LOAD_INVITATIONS', payload: res.data });
        } catch (err) {
            console.error("Could not fetch invitations");
        }
    }
  };

  const acceptInvitation = async (invitationId) => {
    try {
        await api.post(`/invitations/${invitationId}/accept`);
        fetchInvitations();
        dispatch({ type: 'TRIGGER_REFRESH' });
    } catch (err) {
        console.error("Failed to accept invitation", err);
    }
  };

  const loadUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          dispatch({ type: 'AUTH_ERROR' });
        } else {
          dispatch({ type: 'USER_LOADED', payload: decoded.user });
        }
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if(state.isAuthenticated) {
        fetchInvitations();
    }
  }, [state.isAuthenticated]);

  const login = async (formData) => {
    try {
      const res = await api.post('/users/login', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    } catch (err) {
      console.error('Login failed!', err);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };
  
  const register = async (formData) => {
    try {
      const res = await api.post('/users/register', formData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, fetchInvitations, acceptInvitation }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;