import React from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  color: #333;
`;

const Placeholder = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  color: #666;
`;

function PeerChatRoomPage() {
  const { volunteerId } = useParams();

  return (
    <Container>
      <Header>
        <Title>Peer Chat Room</Title>
        <Link to="/student-dashboard/peer-chat">← Back to Chats</Link>
      </Header>
      <Placeholder>
        <p>Chat room with volunteer: <strong>{volunteerId}</strong></p>
        <p>This is a placeholder component. Implement real-time chat here.</p>
      </Placeholder>
    </Container>
  );
}

export default PeerChatRoomPage;


