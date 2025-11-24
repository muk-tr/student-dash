-- Create detailed module tracking tables

-- Module categories table
CREATE TABLE IF NOT EXISTS module_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Modules table (each week/session)
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES module_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  has_quiz BOOLEAN DEFAULT FALSE,
  has_posts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Student module assessments
CREATE TABLE IF NOT EXISTS student_module_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  attendance SMALLINT DEFAULT 0 CHECK (attendance IN (0, 1)),
  mode TEXT CHECK (mode IN ('Z', 'P', 'SS', 'PGS')),
  participation SMALLINT DEFAULT 0 CHECK (participation BETWEEN 0 AND 4),
  submission SMALLINT DEFAULT 0 CHECK (submission BETWEEN 0 AND 4),
  post1 SMALLINT DEFAULT 0 CHECK (post1 BETWEEN 0 AND 4),
  post2 SMALLINT DEFAULT 0 CHECK (post2 BETWEEN 0 AND 4),
  quiz_score SMALLINT DEFAULT 0 CHECK (quiz_score IN (0, 1)),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, module_id, term)
);

-- Student special assessments (Strengths, Gifts, etc.)
CREATE TABLE IF NOT EXISTS student_special_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  top_five_talents TEXT,
  top_four_gifts TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed module categories
INSERT INTO module_categories (id, name, order_index) VALUES
('self_awareness', 'Self Awareness', 1),
('relating', 'Relating', 2),
('collaborating', 'Collaborating', 3),
('leading_others', 'Leading Others', 4),
('strengths', 'Strengths', 5),
('gifts', 'Gifts', 6),
('parish_guidelines', 'Parish Guidelines', 7),
('deanery_lalc', 'Deanery & LALC Guidelines', 8)
ON CONFLICT (id) DO NOTHING;

-- Seed modules
INSERT INTO modules (id, category_id, name, order_index, has_quiz, has_posts) VALUES
-- Self Awareness
('sa_week1', 'self_awareness', 'Developing Self Awareness', 1, FALSE, FALSE),
('sa_week2', 'self_awareness', 'Managing Personal Stress', 2, FALSE, FALSE),
('sa_week3', 'self_awareness', 'Solving Problems', 3, TRUE, FALSE),

-- Relating
('rel_week1', 'relating', 'Communicating Supportively', 1, FALSE, FALSE),
('rel_week2', 'relating', 'Gaining Credibility and Influence', 2, FALSE, FALSE),
('rel_week3', 'relating', 'Managing Conflicts', 3, TRUE, FALSE),

-- Collaborating
('col_week1', 'collaborating', 'Motivating', 1, FALSE, FALSE),
('col_week2', 'collaborating', 'Empowering', 2, FALSE, FALSE),
('col_week3', 'collaborating', 'Delegating', 3, TRUE, FALSE),

-- Leading Others
('lead_week1', 'leading_others', 'Teams and Groups', 1, FALSE, FALSE),
('lead_week2', 'leading_others', 'Meetings', 2, FALSE, FALSE),
('lead_week3', 'leading_others', 'Positive Change', 3, TRUE, FALSE),

-- Strengths
('str_week1', 'strengths', 'Strengths Week 1', 1, FALSE, TRUE),
('str_week2', 'strengths', 'Strengths Week 2', 2, FALSE, TRUE),
('str_week3', 'strengths', 'Strengths Week 3', 3, FALSE, TRUE),
('str_week4', 'strengths', 'Strengths Week 4', 4, FALSE, TRUE),
('str_capstone', 'strengths', 'Strengths CAPSTONE', 5, TRUE, FALSE),

-- Gifts
('gift_week1', 'gifts', 'Gifts Week 1', 1, FALSE, TRUE),
('gift_week2', 'gifts', 'Gifts Week 2', 2, FALSE, TRUE),
('gift_week3', 'gifts', 'Gifts Week 3', 3, FALSE, TRUE),
('gift_week4', 'gifts', 'Gifts Week 4', 4, FALSE, TRUE),
('gift_capstone', 'gifts', 'Gifts CAPSTONE', 5, TRUE, FALSE),

-- Parish Guidelines
('par_day1', 'parish_guidelines', 'Parish Guidelines Day 1', 1, FALSE, FALSE),
('par_day2', 'parish_guidelines', 'Parish Guidelines Day 2', 2, TRUE, FALSE),

-- Deanery & LALC
('dean_day1', 'deanery_lalc', 'Deanery & Archdiocesan Guidelines Day 1', 1, FALSE, FALSE),
('dean_day2', 'deanery_lalc', 'Deanery or Archdiocesan Guidelines Day 2', 2, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE module_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_module_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_special_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for module_categories" ON module_categories FOR SELECT USING (true);
CREATE POLICY "Public read access for modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public access for student_module_assessments" ON student_module_assessments FOR ALL USING (true);
CREATE POLICY "Public access for student_special_data" ON student_special_data FOR ALL USING (true);
