// src/pages/GoogleCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(120deg, #fff1eb 0%, #ace0f9 100%);
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #F98866;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.h2`
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  margin-top: 20px;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin-top: 10px;
  text-align: center;
  max-width: 80%;
`;

function GoogleCallback() {
  const [status, setStatus] = useState('Processing your login...');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // Get the authorization code and state from URL search params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          setError('No authorization code found in the callback URL');
          setStatus('Login failed');
          return;
        }
        
        // Verify state parameter to prevent CSRF attacks
        if (state !== 'nambik-auth-state') {
          console.warn('State parameter mismatch, possible CSRF attack');
          // Continue anyway for now, but log the warning
        }

        // Send the code and state to your backend
        const response = await axios.post(`${API_URL}/api/auth/google/callback`, {
          code,
          state,
          redirect_uri: `${window.location.origin}/auth/google/callback`
        });

  const { token, user } = response.data;

  // Store authentication data and normalize role
  localStorage.setItem('authToken', token);
  localStorage.setItem('userRole', (user.role || '').toLowerCase());
  localStorage.setItem('userName', user.firstName || 'User');
  if (user.id) {
    localStorage.setItem('userId', String(user.id));
  }

        // Redirect based on user role
        setStatus('Login successful! Redirecting...');
        
        const role = (user.role || '').toLowerCase();
        let redirectPath = '/';
        
        if (role.includes('admin')) redirectPath = '/admin-dashboard';
        else if (role.includes('student')) redirectPath = '/student-dashboard';
        else if (role.includes('counselor')) redirectPath = '/counselor-dashboard';
        else if (role.includes('volunteer')) redirectPath = '/volunteer-dashboard';

        // Short delay before redirect to show success message
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
        
      } catch (err) {
        console.error('Error processing Google callback:', err);
        setError(err.response?.data?.message || 'Failed to process Google login. Please try again.');
        setStatus('Login failed');
      }
    };

    processGoogleCallback();
  }, [location, navigate, API_URL]);

  return (
    <LoadingContainer>
      {!error && <Spinner />}
      <Message>{status}</Message>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LoadingContainer>
  );
}

export default GoogleCallback;