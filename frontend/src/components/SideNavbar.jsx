import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 60px; /* Height of the top navbar */
  bottom: 0;
  width: ${props => (props.isCollapsed ? '60px' : '240px')};
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
  overflow-x: hidden;
  z-index: 900;
  display: flex;
  flex-direction: column;
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  flex: 1;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => (props.isCollapsed ? '1rem 0' : '1rem')};
  justify-content: ${props => (props.isCollapsed ? 'center' : 'flex-start')};
  cursor: pointer;
  transition: background-color 0.2s;
  color: ${props => (props.isActive ? '#F98866' : '#666')};
  background-color: ${props => (props.isActive ? '#FFF1EB' : 'transparent')};
  border-left: ${props => (props.isActive ? '3px solid #F98866' : '3px solid transparent')};
  
  &:hover {
    background-color: ${props => (props.isActive ? '#FFF1EB' : '#f9f9f9')};
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => (props.isCollapsed ? '100%' : '24px')};
  margin-right: ${props => (props.isCollapsed ? '0' : '12px')};
`;

const NavText = styled.span`
  display: ${props => (props.isCollapsed ? 'none' : 'block')};
  white-space: nowrap;
  font-weight: ${props => (props.isActive ? '600' : '400')};
`;

const ToggleButton = styled.div`
  display: flex;
  justify-content: ${props => (props.isCollapsed ? 'center' : 'flex-end')};
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  color: #999;
  border-top: 1px solid #eee;
  
  &:hover {
    color: #F98866;
  }
`;

// Define navigation items for each role
const navigationItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin-dashboard' },
    { id: 'users', label: 'User Management', icon: '👥', path: '/admin-dashboard/users' },
    { id: 'colleges', label: 'Colleges', icon: '🏫', path: '/admin-dashboard/colleges' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/admin-dashboard/reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin-dashboard/settings' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/student-dashboard' },
    { id: 'profile', label: 'My Profile', icon: '👤', path: '/student-dashboard/profile' },
    { id: 'colleges', label: 'Browse Colleges', icon: '🏫', path: '/student-dashboard/colleges' },
    { id: 'applications', label: 'My Applications', icon: '📝', path: '/student-dashboard/applications' },
    { id: 'counseling', label: 'Counseling', icon: '💬', path: '/student-dashboard/counseling' },
  ],
  counselor: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/counselor-dashboard' },
    { id: 'students', label: 'My Students', icon: '👨‍🎓', path: '/counselor-dashboard/students' },
    { id: 'appointments', label: 'Appointments', icon: '📅', path: '/counselor-dashboard/appointments' },
    { id: 'resources', label: 'Resources', icon: '📚', path: '/counselor-dashboard/resources' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/counselor-dashboard/reports' },
  ],
  volunteer: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/volunteer-dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: '✅', path: '/volunteer-dashboard/tasks' },
    { id: 'schedule', label: 'Schedule', icon: '📅', path: '/volunteer-dashboard/schedule' },
    { id: 'students', label: 'Students', icon: '👨‍🎓', path: '/volunteer-dashboard/students' },
    { id: 'resources', label: 'Resources', icon: '📚', path: '/volunteer-dashboard/resources' },
  ],
};

const SideNavbar = ({ role = 'student' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the navigation items for the current role
  const items = navigationItems[role] || navigationItems.student;
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <NavItems>
        {items.map((item) => (
          <NavItem 
            key={item.id}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
          >
            <IconContainer isCollapsed={isCollapsed}>
              {item.icon}
            </IconContainer>
            <NavText isCollapsed={isCollapsed} isActive={location.pathname === item.path}>
              {item.label}
            </NavText>
          </NavItem>
        ))}
      </NavItems>
      
      <ToggleButton isCollapsed={isCollapsed} onClick={toggleCollapse}>
        {isCollapsed ? '→' : '←'}
      </ToggleButton>
    </SidebarContainer>
  );
};

export default SideNavbar;