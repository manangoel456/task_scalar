import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

useEffect(() => {
    // Add this console.log to see if the component is reacting to the state change
    console.log('Login state changed. isAuthenticated is now:', isAuthenticated);

    if (isAuthenticated) {
      navigate('/boards');
    }
  }, [isAuthenticated, navigate]);

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    // This function runs when the form is submitted
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="auth-form">
      <h1>Login</h1>
      <p>Sign In to Your Account</p>
      {/* Check this line below */}
      <form onSubmit={onSubmit}> 
        <input 
          type="email" 
          name="email" 
          value={email} 
          onChange={onChange} 
          placeholder="Email Address" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          value={password} 
          onChange={onChange} 
          placeholder="Password" 
          minLength="6"
          required 
        />
        {/* And check this line below */}
        <button type="submit">Login</button> 
      </form>
      <p>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;