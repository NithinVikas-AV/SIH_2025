import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useSocket } from '../hooks/useSocket';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const Bubble = styled.div`
  max-width: 70%;
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${p => (p.$own ? '#FEECE6' : '#F5F5F5')};
  align-self: ${p => (p.$own ? 'flex-end' : 'flex-start')};
`;

const Composer = styled.form`
  display: flex;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid #eee;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
`;

const SendButton = styled.button`
  padding: 10px 16px;
  background: #F98866;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

// Messages stored in collection 'messages' with fields:
// { chatId, senderId, receiverId, text, createdAt }
// chatId = sorted pair `${minId}_${maxId}` based on user ids

function buildChatId(userIdA, userIdB) {
  const a = String(userIdA);
  const b = String(userIdB);
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

const ChatWindow = ({ peerUserId }) => {
  const currentUserId = localStorage.getItem('userId');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const socket = useSocket(currentUserId);

  const chatId = useMemo(() => {
    if (!currentUserId || !peerUserId) return null;
    return buildChatId(currentUserId, peerUserId);
  }, [currentUserId, peerUserId]);

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(docs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !currentUserId || !peerUserId || !chatId) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: peerUserId,
      text: trimmed,
      createdAt: new Date(),
      chatId: chatId,
    };

    // Send via socket for instant delivery
    socket.emit("send-message", messageData);

    // Save to Firestore for persistence
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Update the lastMessage in the parent chat document
    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      participants: [currentUserId, peerUserId].sort(),
      lastMessage: { text: trimmed, timestamp: serverTimestamp() },
    }, { merge: true });

    setText('');
  };

  return (
    <Container>
      <Messages>
        {messages.map(m => (
          <Bubble key={m.id} $own={String(m.senderId) === String(currentUserId)}>
            {m.text}
          </Bubble>
        ))}
        <div ref={bottomRef} />
      </Messages>
      <Composer onSubmit={sendMessage}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <SendButton type="submit">Send</SendButton>
      </Composer>
    </Container>
  );
};

export default ChatWindow;





