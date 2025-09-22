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

const ProgressBar = styled.div`
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  background-color: #F98866;
  border-radius: 4px;
`;

const StudentDashboard = () => {
  return (
    <DashboardLayout role="student">
      <h1>Student Dashboard</h1>
      <p>Welcome to your student dashboard. Track your applications and connect with counselors.</p>
      
      <DashboardContainer>
        <Card>
          <CardTitle>My Applications</CardTitle>
          <CardContent>
            <p>You have 3 applications in progress.</p>
            <ProgressBar>
              <Progress percent={60} />
            </ProgressBar>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardContent>
            <p>Next counseling session: Tomorrow, 3:00 PM</p>
            <p>Topic: College Selection Strategy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Recommended Colleges</CardTitle>
          <CardContent>
            <p>Based on your profile, we've found 5 colleges that match your interests.</p>
            <p>Click to explore your matches.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Tasks</CardTitle>
          <CardContent>
            <p>You have 2 pending tasks to complete.</p>
            <ul>
              <li>Upload transcript</li>
              <li>Complete personal statement</li>
            </ul>
          </CardContent>
        </Card>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default StudentDashboard;