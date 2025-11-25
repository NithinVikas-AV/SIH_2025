import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import ChatWindow from '../../../components/ChatWindow';
import { useSocket } from '../../../hooks/useSocket';

const ChatLayout = styled.div`
  display: flex;
  height: calc(100vh - 120px);
`;

const SideNavbar = styled.div`
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 1rem;
  overflow-y: auto;
`;

const StudentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StudentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isActive ? '#FFF1EB' : 'transparent'};
  border-left: ${props => props.isActive ? '3px solid #F98866' : '3px solid transparent'};

  &:hover {
    background-color: ${props => props.isActive ? '#FFF1EB' : '#f1f3f4'};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFE5DC;
  color: #E26A2C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 12px;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: #333;
`;

const LastMessage = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
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

const PlaceholderArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const PlaceholderText = styled.div`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const VolunteerChatListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const currentUserId = localStorage.getItem('userId');
  const socket = useSocket(currentUserId);

  useEffect(() => {
    if (!socket) return;
    socket.on("new-message-notification", (notification) => {
      // Show a toast or update a notification bell
      console.log("New message from:", notification.senderId);
      setNotifications(prev => [...prev, notification]);
    });
    return () => socket.off("new-message-notification");
  }, [socket]);

  useEffect(() => {
    if (!currentUserId) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId)
    );

    const unsub = onSnapshot(chatsQuery, async (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort chats by lastMessage.timestamp descending (most recent first)
      chats.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp?.toDate?.() || new Date(0);
        const bTime = b.lastMessage?.timestamp?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      // For each chat, get the other participant
      const studentPromises = chats.map(async (chat) => {
        const otherUserId = chat.participants.find(id => id !== currentUserId);

        // Fetch user details from API
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/${otherUserId}`);
          const data = await res.json();
          return {
            id: otherUserId,
            first_name: data.user?.first_name || 'Unknown',
            last_name: data.user?.last_name || 'Student',
            lastMessage: chat.lastMessage?.text || 'No messages yet',
            lastMessageTime: chat.lastMessage?.timestamp?.toDate() || new Date(0)
          };
        } catch (e) {
          console.error('Failed to fetch user details', e);
          return {
            id: otherUserId,
            first_name: 'Unknown',
            last_name: 'Student',
            lastMessage: chat.lastMessage?.text || 'No messages yet',
            lastMessageTime: chat.lastMessage?.timestamp?.toDate() || new Date(0)
          };
        }
      });

      const studentsWithDetails = await Promise.all(studentPromises);
      setStudents(studentsWithDetails);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUserId]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  if (loading) return <p>Loading chats...</p>;

  return (
    <ChatLayout>
      <SideNavbar>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>My Chats</h3>
        <StudentsList>
          {students.length === 0 ? (
            <div style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              No active chats yet. Chats will appear here when students message you.
            </div>
          ) : (
            students.map(student => {
              const initials = `${(student.first_name||'')[0]||''}${(student.last_name||'')[0]||''}`.toUpperCase();
              return (
                <StudentItem
                  key={student.id}
                  isActive={selectedStudent?.id === student.id}
                  onClick={() => handleStudentClick(student)}
                >
                  <Avatar>{initials || 'S'}</Avatar>
                  <StudentInfo>
                    <StudentName>{student.first_name} {student.last_name}</StudentName>
                    <LastMessage>{student.lastMessage}</LastMessage>
                  </StudentInfo>
                </StudentItem>
              );
            })
          )}
        </StudentsList>
      </SideNavbar>
      <ChatArea>
        {selectedStudent ? (
          <>
            <ChatHeader>
              <ChatTitle>Chat with {selectedStudent.first_name} {selectedStudent.last_name}</ChatTitle>
            </ChatHeader>
            <ChatWindow peerUserId={selectedStudent.id} />
          </>
        ) : (
          <PlaceholderArea>
            <PlaceholderText>Select a student from the sidebar to start chatting.</PlaceholderText>
            <p style={{ color: '#999', fontSize: '0.9rem' }}>
              Help students with their questions and concerns.
            </p>
          </PlaceholderArea>
        )}
      </ChatArea>
    </ChatLayout>
  );
};

export default VolunteerChatListPage;