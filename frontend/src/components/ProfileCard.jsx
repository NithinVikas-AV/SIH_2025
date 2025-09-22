import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: rgba(253, 250, 247, 0.85);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06);
  display: flex;
  gap: 24px;
  align-items: center;
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  min-width: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg,#F98866,#FFB88C);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 28px;
  overflow: hidden;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
`;

const Sub = styled.p`
  margin: 4px 0 0 0;
  color: #666;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  background: #fff;
  border: 1px solid #eee;
  padding: 6px 10px;
  border-radius: 8px;
  color: #555;
  font-weight: 600;
`;

const PlaceholderImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

const ProfileCard = ({
  firstName = '',
  lastName = '',
  email = '',
  preferredLang = 'en',
  college = '',
  avatarUrl = ''
}) => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  return (
    <Card>
      <Avatar>
        {avatarUrl ? <PlaceholderImg src={avatarUrl} alt={fullName || 'User avatar'} /> : initials(fullName || email)}
      </Avatar>

      <Info>
        <Name>{fullName || email || 'User'}</Name>
        <Sub>{email}</Sub>

        <Row>
          <Badge>Lang: {preferredLang || 'en'}</Badge>
          {college && <Badge>{college}</Badge>}
        </Row>
      </Info>
    </Card>
  );
};

export default ProfileCard;
