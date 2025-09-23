import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import CounselorAppointmentsPage from '../pages/counselor/AppointmentsPage';

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

const CounselorDashboard = () => {
  return (
    <DashboardLayout role="counselor">
      <h1>Counselor Dashboard</h1>
      <p>Welcome to your counselor dashboard. Manage your students and appointments.</p>
      
      <DashboardContainer>
        <Card>
          <CardTitle>My Students</CardTitle>
          <CardContent>
            <p>You are currently counseling 15 students.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Today's Appointments</CardTitle>
          <CardContent>
            <p>You have 3 appointments scheduled for today.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Resources</CardTitle>
          <CardContent>
            <p>Access counseling resources and materials.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Performance</CardTitle>
          <CardContent>
            <p>View your counseling performance metrics.</p>
          </CardContent>
        </Card>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default CounselorDashboard;