import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 10px;
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #F98866;
  margin: 0;
`;

const QuoteContainer = styled.div`
  text-align: center;
  max-width: 500px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Quote = styled.p`
  font-style: italic;
  color: #666;
  margin: 0;
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const ProfileCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F98866;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: 180px;
  overflow: hidden;
  display: ${props => (props.isOpen ? 'block' : 'none')};
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

// Array of motivational quotes
const motivationalQuotes = [
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Your time is limited, don't waste it living someone else's life.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "The best way to predict the future is to create it.",
  "You are never too old to set another goal or to dream a new dream.",
  "The only limit to our realization of tomorrow is our doubts of today."
];

const TopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    // Set a random quote when component mounts
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    // Change quote every 30 seconds
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[newIndex]);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    navigate('/login');
  };

  const handleViewProfile = () => {
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Navigate to profile page (you'll need to create this)
    navigate('/profile');
  };

  const handleLogoClick = () => {
    // Navigate to the appropriate dashboard based on user role
    const role = localStorage.getItem('userRole');
    if (role) {
      if (role.includes('admin')) navigate('/admin-dashboard');
      else if (role.includes('student')) navigate('/student-dashboard');
      else if (role.includes('counselor')) navigate('/counselor-dashboard');
      else if (role.includes('volunteer')) navigate('/volunteer-dashboard');
      else navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <NavbarContainer>
      <LogoContainer onClick={handleLogoClick}>
        {/* Replace with your actual logo */}
        <LogoText>nambik.AI</LogoText>
      </LogoContainer>
      
      <QuoteContainer>
        <Quote>"{quote}"</Quote>
      </QuoteContainer>
      
      <ProfileContainer>
        <ProfileCircle onClick={toggleDropdown}>
          {userInitial}
        </ProfileCircle>
        
        <DropdownMenu isOpen={isDropdownOpen}>
          <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </DropdownMenu>
      </ProfileContainer>
    </NavbarContainer>
  );
};

export default TopNavbar;