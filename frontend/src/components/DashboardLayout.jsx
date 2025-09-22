import React, { useState } from 'react';
import styled from 'styled-components';
import TopNavbar from './TopNavbar';
import SideNavbar from './SideNavbar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin-top: 60px; /* Height of the top navbar */
  margin-left: ${props => (props.sidebarCollapsed ? '60px' : '240px')};
  padding: 2rem;
  transition: margin-left 0.3s ease;
  flex: 1;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
`;

const DashboardLayout = ({ children, role }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Function to handle sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  
  return (
    <LayoutContainer>
      <TopNavbar />
      <SideNavbar 
        role={role} 
        onCollapse={handleSidebarCollapse}
      />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;