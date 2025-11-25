import React from 'react';
import styled from 'styled-components';
import DashboardLayout from '../components/DashboardLayout';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
`;

const CardContent = styled.div`
  color: #666;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #F98866;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #999;
`;

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can manage users, colleges, and view reports.</p>
      
      <DashboardContainer>
        <Card>
          <CardTitle>Total Users</CardTitle>
          <CardContent>
            <StatNumber>1,245</StatNumber>
            <StatLabel>Active users in the system</StatLabel>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Colleges</CardTitle>
          <CardContent>
            <StatNumber>87</StatNumber>
            <StatLabel>Registered colleges</StatLabel>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Applications</CardTitle>
          <CardContent>
            <StatNumber>532</StatNumber>
            <StatLabel>Pending applications</StatLabel>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Counselors</CardTitle>
          <CardContent>
            <StatNumber>42</StatNumber>
            <StatLabel>Active counselors</StatLabel>
          </CardContent>
        </Card>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default AdminDashboard;