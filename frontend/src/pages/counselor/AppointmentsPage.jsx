import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Th = styled.th`
  text-align: left;
  background: #f7f7f7;
  color: #555;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 12px 14px;
  border-bottom: 1px solid #f1f1f1;
  color: #444;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 0.85rem;
  background: ${props => props.$variant === 'online' ? '#e8f5ff' : '#fff7e6'};
  color: ${props => props.$variant === 'online' ? '#0077cc' : '#b35a00'};
`;

const Empty = styled.div`
  padding: 2rem;
  text-align: center;
  color: #777;
`;

const Filters = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const CounselorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_URL}/api/appointments/my-schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = iso => {
    const d = new Date(iso);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const filtered = appointments.filter(a => {
    if (!dateFilter) return true;
    try {
      return new Date(a.start_time).toISOString().slice(0, 10) === dateFilter;
    } catch {
      return true;
    }
  });

  return (
    <Container>
      <Header>
        <Title>My Appointments</Title>
        <Filters>
          <DateInput
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </Filters>
      </Header>

      {error && <Empty>{error}</Empty>}
      {loading ? (
        <Empty>Loading…</Empty>
      ) : filtered.length === 0 ? (
        <Empty>No appointments found.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Student</Th>
              <Th>Mode</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const { date, time } = formatDateTime(a.start_time);
              return (
                <tr key={a.id}>
                  <Td>{date}</Td>
                  <Td>{time}</Td>
                  <Td>{a.student_name || '—'}</Td>
                  <Td>
                    <Badge $variant={a.mode}>{a.mode}</Badge>
                  </Td>
                  <Td>{a.status}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CounselorAppointmentsPage;


