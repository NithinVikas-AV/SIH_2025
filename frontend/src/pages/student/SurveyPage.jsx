import React, { useState, useEffect } from 'react';
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

const SurveyContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SurveyTypeButton = styled.button`
  background: #F98866;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0.5rem;

  &:hover {
    background: #e26a2c;
  }
`;

const SurveyTypeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
`;

const QuestionCard = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const QuestionText = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionButton = styled.button`
  background: ${props => props.selected ? '#F98866' : '#f8f9fa'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 1px solid ${props => props.selected ? '#F98866' : '#ddd'};
  padding: 0.75rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${props => props.selected ? '#e26a2c' : '#e9ecef'};
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const NavButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ResultTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
`;

const ResultText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const SurveyPage = () => {
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [selectedSurveyType, setSelectedSurveyType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchSurveyTypes();
  }, []);

  const fetchSurveyTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/surveys/types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurveyTypes(response.data);
    } catch (error) {
      console.error('Error fetching survey types:', error);
    }
  };

  const fetchQuestions = async (surveyType) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/surveys/questions/${surveyType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
      setCurrentQuestionIndex(0);
      setResponses({});
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyTypeSelect = (surveyType) => {
    setSelectedSurveyType(surveyType);
    fetchQuestions(surveyType);
  };

  const handleOptionSelect = (questionId, optionValue) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submissionData = {
        user_id: userId,
        survey_type: selectedSurveyType,
        responses: questions.map(q => ({
          question_id: q.question_id,
          selected_option: responses[q.question_id] || 0
        }))
      };

      const response = await axios.post(`${API_URL}/api/surveys/submit`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSurvey = () => {
    setSelectedSurveyType(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses({});
    setResult(null);
  };

  if (result) {
    return (
      <Container>
        <ResultContainer>
          <ResultTitle>Survey Completed</ResultTitle>
          <ResultText>Thank you for completing the {selectedSurveyType} survey.</ResultText>
          {result.total !== undefined && (
            <ResultText>Your total score: {result.total}</ResultText>
          )}
          <ResultText>Severity level: {result.severity_level}</ResultText>
          {result.flagged_for_followup && (
            <ResultText style={{ color: '#dc3545', fontWeight: 'bold' }}>
              This response has been flagged for follow-up.
            </ResultText>
          )}
          <SubmitButton onClick={resetSurvey}>Take Another Survey</SubmitButton>
        </ResultContainer>
      </Container>
    );
  }

  if (selectedSurveyType && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allAnswered = questions.every(q => responses[q.question_id] !== undefined);

    return (
      <Container>
        <Header>
          <Title>{selectedSurveyType} Assessment</Title>
          <Subtitle>Question {currentQuestionIndex + 1} of {questions.length}</Subtitle>
        </Header>

        <SurveyContainer>
          <QuestionCard>
            <QuestionText>{currentQuestion.question_text}</QuestionText>
            <OptionsContainer>
              {Object.entries(currentQuestion.options).map(([text, value]) => (
                <OptionButton
                  key={value}
                  selected={responses[currentQuestion.question_id] === value}
                  onClick={() => handleOptionSelect(currentQuestion.question_id, value)}
                >
                  {value}: {text}
                </OptionButton>
              ))}
            </OptionsContainer>
          </QuestionCard>

          <NavigationButtons>
            <NavButton onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </NavButton>
            {isLastQuestion ? (
              <SubmitButton onClick={handleSubmit} disabled={!allAnswered || loading}>
                {loading ? 'Submitting...' : 'Submit Survey'}
              </SubmitButton>
            ) : (
              <NavButton onClick={handleNext} disabled={responses[currentQuestion.question_id] === undefined}>
                Next
              </NavButton>
            )}
          </NavigationButtons>
        </SurveyContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Mental Health Assessments</Title>
        <Subtitle>Choose a survey to begin your assessment</Subtitle>
      </Header>

      <SurveyTypeContainer>
        {surveyTypes.map(type => (
          <SurveyTypeButton key={type} onClick={() => handleSurveyTypeSelect(type)}>
            {type}
          </SurveyTypeButton>
        ))}
      </SurveyTypeContainer>
    </Container>
  );
};

export default SurveyPage;
