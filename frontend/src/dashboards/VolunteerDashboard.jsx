import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import VolunteerDashboardHome from '../pages/volunteer/VolunteerDashboardHome';
import VolunteerChatListPage from '../pages/volunteer/chat/VolunteerChatListPage';
import VolunteerChatRoomPage from '../pages/volunteer/chat/VolunteerChatRoomPage';
import TasksPage from '../pages/volunteer/TasksPage';
import SchedulePage from '../pages/volunteer/SchedulePage';
import StudentsPage from '../pages/volunteer/StudentsPage';
import ResourcesPage from '../pages/volunteer/ResourcesPage';

const VolunteerDashboard = () => {
  return (
    <DashboardLayout role="volunteer">
      <Routes>
        <Route path="/" element={<VolunteerDashboardHome />} />
        <Route path="chat" element={<VolunteerChatListPage />} />
        <Route path="chat/:studentId" element={<VolunteerChatRoomPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        {/* Fallback to home */}
        <Route path="*" element={<VolunteerDashboardHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;