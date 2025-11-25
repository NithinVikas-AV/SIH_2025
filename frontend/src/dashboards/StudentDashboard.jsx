import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentDashboardHome from '../pages/student/StudentDashboardHome';
import AIChatPage from '../pages/student/ai/AIChatPage';
import PeerChatListPage from '../pages/student/peer/PeerChatListPage';
import PeerChatRoomPage from '../pages/student/peer/PeerChatRoomPage';
import AppointmentsPage from '../pages/student/AppointmentsPage';
import SurveyPage from '../pages/student/SurveyPage';

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
      <Routes>
        <Route path="/" element={<StudentDashboardHome />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="peer-chat" element={<PeerChatListPage />} />
        <Route path="peer-chat/:volunteerId" element={<PeerChatRoomPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="survey" element={<SurveyPage />} />
        {/* Fallback to home */}
        <Route path="*" element={<StudentDashboardHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;