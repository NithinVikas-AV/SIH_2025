-- Database setup for nambik.AI survey system

-- Create survey_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS survey_questions (
    question_id SERIAL PRIMARY KEY,
    survey_type VARCHAR(10) NOT NULL,
    question_order SMALLINT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    CONSTRAINT survey_questions_survey_type_check CHECK (survey_type IN ('PHQ-9', 'GAD-7'))
);

-- Create survey_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS survey_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    survey_type VARCHAR(10) NOT NULL,
    total INTEGER NOT NULL,
    severity_level VARCHAR(50),
    flagged_for_followup BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- Sample data for GAD-7 survey (Generalized Anxiety Disorder 7-item scale)
-- Insert GAD-7 questions if they don't exist
INSERT INTO survey_questions (survey_type, question_order, question_text, options) VALUES
('GAD-7', 1, 'Feeling nervous, anxious, or on edge', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 2, 'Not being able to stop or control worrying', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 3, 'Worrying too much about different things', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 4, 'Trouble relaxing', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 5, 'Being so restless that it is hard to sit still', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 6, 'Becoming easily annoyed or irritable', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('GAD-7', 7, 'Feeling afraid as if something awful might happen', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}')
ON CONFLICT (question_id) DO NOTHING;

-- Sample data for PHQ-9 survey (Patient Health Questionnaire 9-item scale)
-- Insert PHQ-9 questions if they don't exist
INSERT INTO survey_questions (survey_type, question_order, question_text, options) VALUES
('PHQ-9', 1, 'Little interest or pleasure in doing things', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 2, 'Feeling down, depressed, or hopeless', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 3, 'Trouble falling or staying asleep, or sleeping too much', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 4, 'Feeling tired or having little energy', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 5, 'Poor appetite or overeating', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 6, 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 7, 'Trouble concentrating on things, such as reading the newspaper or watching television', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 8, 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}'),
('PHQ-9', 9, 'Thoughts that you would be better off dead, or of hurting yourself', '{"Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3}')
ON CONFLICT (question_id) DO NOTHING;