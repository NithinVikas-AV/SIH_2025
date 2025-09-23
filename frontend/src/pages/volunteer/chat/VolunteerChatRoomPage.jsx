import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ChatWindow from '../../../components/ChatWindow';

const ChatLayout = styled.div`
  display: flex;
  height: calc(100vh - 120px);
`;

const SideNavbar = styled.div`
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 1rem;
`;

const StudentCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #FFE5DC;
  color: #E26A2C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const StudentRole = styled.div`
  font-size: 14px;
  color: #888;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const ChatTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const VolunteerChatRoomPage = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/${studentId}`);
        const data = await res.json();
        setStudent(data.user);
      } catch (e) {
        console.error('Failed to load student', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found.</p>;

  const initials = `${(student.first_name||'')[0]||''}${(student.last_name||'')[0]||''}`.toUpperCase();

  return (
    <ChatLayout>
      <SideNavbar>
        <StudentCard>
          <Avatar>{initials || 'S'}</Avatar>
          <StudentInfo>
            <StudentName>{student.first_name} {student.last_name}</StudentName>
            <StudentRole>Student</StudentRole>
          </StudentInfo>
        </StudentCard>
      </SideNavbar>
      <ChatArea>
        <ChatHeader>
          <ChatTitle>Chat with {student.first_name} {student.last_name}</ChatTitle>
        </ChatHeader>
        <ChatWindow peerUserId={studentId} />
      </ChatArea>
    </ChatLayout>
  );
};

export default VolunteerChatRoomPage;