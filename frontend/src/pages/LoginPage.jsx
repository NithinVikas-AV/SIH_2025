// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

// --- Styled Components for the Login Page ---

const PageContainer = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(120deg, #fff1eb 0%, #ace0f9 100%);
  overflow: hidden;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  
  /* 1. Use rgba for a semi-transparent background */
  background: rgba(253, 250, 247, 0.35); /* Mild cream at 85% opacity */
  
  /* 2. Add the backdrop-filter for the frosted glass effect */
  -webkit-backdrop-filter: blur(10px); /* For Safari */
  backdrop-filter: blur(10px);
  
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
  padding: 40px;
  
  /* Add a border to make the edges of the glass more defined */
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const FormContent = styled.div`
  width: 100%;
  text-align: left;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #F98866;
  text-align: center; /* <-- Add this line */
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 12px 12px 45px;
  background: #f7f7f7;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  color: #333;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    background: #fff;
    border-color: #F98866;
    box-shadow: 0 0 0 3px rgba(249, 136, 102, 0.2);
  }
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 25px;
`;

const ForgotPasswordLink = styled.a`
  font-size: 0.9rem;
  font-weight: 500;
  color: #F98866;
  text-decoration: none;
  transition: color 0.3s;
  &:hover { color: #E06C4D; }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #F98866;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  &:hover {
    background-color: #E06C4D;
    transform: translateY(-2px);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
  color: #aaa;
  span { padding: 0 10px; font-size: 0.9rem; }
  &::before, &::after { content: ''; flex: 1; border-bottom: 1px solid #ddd; }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  &:hover { background: #f9f9f9; }
`;

const SignUpLink = styled.p`
  margin-top: 25px;
  text-align: center;
  color: #666;
  a {
    color: #F98866;
    font-weight: 700;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

// --- Icon Components ---

const EmailIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> );
const PasswordIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> );
const GoogleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.638,44,30.938,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );

// --- The Main Component ---

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Use the react-oauth hook with redirect flow
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Google login successful, redirecting to callback handler');
      // This won't be called in redirect mode, as we'll be redirected to the callback URL
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      setError('Google Sign-In failed. Please try again.');
    },
    flow: 'auth-code',
    scope: 'email profile',
    ux_mode: 'redirect',
    redirect_uri: `${window.location.origin}/auth/google/callback`,
    state: 'nambik-auth-state', // Add state parameter for security
    // The server will handle the code exchange
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    console.log('Login button clicked', { email, password: password ? '***' : '' });

    try {
      // Call your backend API using environment variable
      console.log(`Sending POST to server ${API_URL}/api/auth/login`);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // Handle successful login
      console.log('Received response from login:', response.data);
  const { token, user } = response.data;
  // Store the token and a normalized (lowercase) role to avoid casing/variant mismatches
  localStorage.setItem('authToken', token);
  localStorage.setItem('userRole', (user.role || '').toLowerCase());
  localStorage.setItem('userName', user.firstName || 'User');
  localStorage.setItem('userEmail', email); // Store the email for profile updates
  if (user.id) {
    localStorage.setItem('userId', String(user.id));
  }

      // Map backend role names to client routes (handle variants like 'college_admin')
      const role = (user.role || '').toLowerCase();
      let redirectPath = '/';

      if (role.includes('admin')) redirectPath = '/admin-dashboard';
      else if (role.includes('student')) redirectPath = '/student-dashboard';
      else if (role.includes('counselor')) redirectPath = '/counselor-dashboard';
      else if (role.includes('volunteer')) redirectPath = '/volunteer-dashboard';

      console.log('Redirecting after login to:', redirectPath, 'for role:', user.role);
      navigate(redirectPath);

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleButtonClick = () => {
    // Use the loginWithGoogle function from useGoogleLogin hook
    loginWithGoogle();
  };

  return (
    <PageContainer>
      <LoginCard>
        <FormContent>
          <Title>Login</Title>
          <Subtitle> </Subtitle>
          
          <form onSubmit={handleLogin}>
            <InputGroup>
              <InputIcon><EmailIcon /></InputIcon>
              <InputField
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
            
            <InputGroup>
              <InputIcon><PasswordIcon /></InputIcon>
              <InputField
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>

            {error && (
              <p style={{ color: 'crimson', marginBottom: 12 }}>{error}</p>
            )}

            <PrimaryButton type="submit">Sign In</PrimaryButton>
          </form>

          <Divider><span>OR</span></Divider>

          <SecondaryButton type="button" onClick={handleGoogleButtonClick}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </SecondaryButton>
          
        </FormContent>
      </LoginCard>
    </PageContainer>
  );
}

export default LoginPage;