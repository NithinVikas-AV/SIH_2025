import React from 'react';
import styled from 'styled-components';

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

const VolunteerDashboardHome = () => {
  return (
    <div>
      <h1>Volunteer Dashboard</h1>
      <p>Welcome to your volunteer dashboard. Help students and manage your activities.</p>

      <DashboardContainer>
        <Card>
          <CardTitle>Active Chats</CardTitle>
          <CardContent>
            <p>You have 5 active conversations with students.</p>
            <ProgressBar>
              <Progress percent={70} />
            </ProgressBar>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Today's Tasks</CardTitle>
          <CardContent>
            <p>Next task: Respond to student inquiry</p>
            <p>Scheduled for: 2:00 PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Weekly Stats</CardTitle>
          <CardContent>
            <p>Students helped this week: 12</p>
            <p>Average response time: 2 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Available Resources</CardTitle>
          <CardContent>
            <p>Access counseling guides and support materials.</p>
            <p>Click to explore the resource library.</p>
          </CardContent>
        </Card>
      </DashboardContainer>
    </div>
  );
};

export default VolunteerDashboardHome;