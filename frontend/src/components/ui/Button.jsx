import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.variant === 'secondary' ? '#6c757d' : '#F98866'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#5a6268' : '#e26a2c'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export default Button;