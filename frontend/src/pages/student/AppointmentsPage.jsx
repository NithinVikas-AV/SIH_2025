import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const Form = styled.form`
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #F98866;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #F98866;
  }
`;

const SubmitButton = styled.button`
  background: #F98866;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #e26a2c;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  background: ${props => props.$error ? '#fdecea' : '#d4edda'};
  color: ${props => props.$error ? '#a8071a' : '#155724'};
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.$error ? '#f5c6cb' : '#c3e6cb'};
`;

function AppointmentsPage() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    counselor: '',
    mode: 'online',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001');
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/counselors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCounselors(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Failed to load counselors');
      }
    };
    fetchCounselors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      setSlots([]);
      if (!formData.counselor || !formData.date) return;
      try {
        const { data } = await axios.get(`${API_URL}/api/counselors/${formData.counselor}/availability`, {
          params: { date: formData.date },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Failed to load availability');
      }
    };
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.counselor, formData.date]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const canSubmit = useMemo(() => {
    return Boolean(formData.counselor && formData.date && formData.time && formData.mode);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const startTimeIso = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      await axios.post(`${API_URL}/api/appointments`, {
        counselor_user_id: formData.counselor,
        start_time: startTimeIso,
        mode: formData.mode,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitted(true);
      setFormData({ date: '', time: '', counselor: '', mode: 'online' });
      setSlots([]);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container>
        <Message>
          <h3>Appointment Booked Successfully!</h3>
          <p>Your appointment has been scheduled.</p>
          <SubmitButton onClick={() => setSubmitted(false)}>Book Another Appointment</SubmitButton>
        </Message>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Book an Appointment</Title>
        <Subtitle>Schedule a counseling session with our counselors</Subtitle>
      </Header>

      {error && (
        <Message $error>{error}</Message>
      )}

      <Form onSubmit={handleSubmit}>

        <FormGroup>
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="counselor">Counselor</Label>
          <Select
            id="counselor"
            name="counselor"
            value={formData.counselor}
            onChange={handleChange}
            required
          >
            <option value="">Select counselor</option>
            {counselors.map(c => (
              <option key={c.user_id} value={c.user_id}>
                {c.name} {c.specialization && c.specialization.length ? `- ${c.specialization.join(', ')}` : ''}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="time">Available Time</Label>
          <Select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            disabled={!formData.counselor || !formData.date}
            required
          >
            <option value="">Select a time</option>
            {slots.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="mode">Mode</Label>
          <Select id="mode" name="mode" value={formData.mode} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="in-person">In-person</option>
          </Select>
        </FormGroup>

        <SubmitButton type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </SubmitButton>
      </Form>
    </Container>
  );
}

export default AppointmentsPage;


