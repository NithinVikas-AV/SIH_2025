import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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

const PeerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PeerItem = styled.div`
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
  background: #E6F4FF;
  color: #1E6BB8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 12px;
`;

const PeerInfo = styled.div`
  flex: 1;
`;

const PeerName = styled.div`
  font-weight: 600;
  color: #333;
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

function PeerChatListPage() {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const currentUserId = localStorage.getItem('userId');
  const socket = useSocket(currentUserId);

  useEffect(() => {
    // optional notifications
    if (!socket) return;
    const handler = (notification) => {
      console.log('New message from:', notification.senderId);
    };
    socket.on('new-message-notification', handler);
    return () => socket.off('new-message-notification', handler);
  }, [socket]);

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/volunteers`);
        const data = await res.json();
        const list = (data.volunteers || []).map(v => ({
          id: String(v.id ?? v.user_id ?? v._id ?? ''),
          first_name: v.first_name || v.firstName || 'Peer',
          last_name: v.last_name || v.lastName || '',
        })).filter(p => p.id && p.id !== currentUserId);
        setPeers(list);
      } catch (e) {
        console.error('Failed to load peers', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPeers();
  }, [currentUserId]);

  const handlePeerClick = (peer) => setSelectedPeer(peer);

  if (loading) return <p>Loading peers...</p>;

  return (
    <ChatLayout>
      <SideNavbar>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Peers</h3>
        <PeerList>
          {peers.length === 0 ? (
            <div style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              No peers available.
            </div>
          ) : (
            peers.map(peer => {
              const initials = `${(peer.first_name||'')[0]||''}${(peer.last_name||'')[0]||''}`.toUpperCase();
              return (
                <PeerItem
                  key={peer.id}
                  isActive={selectedPeer?.id === peer.id}
                  onClick={() => handlePeerClick(peer)}
                >
                  <Avatar>{initials || 'P'}</Avatar>
                  <PeerInfo>
                    <PeerName>{peer.first_name} {peer.last_name}</PeerName>
                  </PeerInfo>
                </PeerItem>
              );
            })
          )}
        </PeerList>
      </SideNavbar>
      <ChatArea>
        {selectedPeer ? (
          <>
            <ChatHeader>
              <ChatTitle>Chat with {selectedPeer.first_name} {selectedPeer.last_name}</ChatTitle>
            </ChatHeader>
            <ChatWindow peerUserId={selectedPeer.id} />
          </>
        ) : (
          <div style={{ padding: '2rem', color: '#666' }}>Select a peer from the sidebar to start chatting.</div>
        )}
      </ChatArea>
    </ChatLayout>
  );
}

export default PeerChatListPage;


