export const createTablesSql = `
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop tables if they exist to ensure clean slate (in reverse order of dependencies)
drop table if exists grade_history;
drop table if exists student_courses;
drop table if exists courses;
drop table if exists students;
drop table if exists admins;
drop table if exists student_special_data;
drop table if exists modules;
drop table if exists module_categories;

-- Create a table for students
create table if not exists students (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  program text not null,
  year text not null,
  semester text not null,
  avatar text,
  parish text,
  deanery text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for courses catalog
create table if not exists courses (
  id text primary key,
  name text not null,
  credits integer not null,
  department text not null,
  mode text, -- Changed from instructor
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for student enrollments
create table if not exists student_courses (
  id uuid default uuid_generate_v4() primary key,
  student_id text references students(id) on delete cascade,
  course_id text not null,
  course_name text not null,
  credits integer not null,
  grade text default '-',
  gpa float default 0,
  status text default 'Registered',
  progress integer default 0,
  mode text, -- Changed from instructor
  semester text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, course_id)
);

-- Create a table for grade history
create table if not exists grade_history (
  id uuid default uuid_generate_v4() primary key,
  student_id text references students(id) on delete cascade,
  semester text not null,
  gpa float not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for admins
create table if not exists admins (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- Enable Row Level Security
alter table students enable row level security;
alter table courses enable row level security;
alter table student_courses enable row level security;
alter table grade_history enable row level security;
alter table admins enable row level security;
ALTER TABLE module_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_module_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_special_data ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Students: Public read for demo (or authenticated), Admin write
create policy "Public read access for students" on students for select using (true);
create policy "Public insert access for students" on students for insert with check (true);
create policy "Public update access for students" on students for update using (true);
create policy "Public delete access for students" on students for delete using (true);

-- Courses: Public read, Admin write
create policy "Public read access for courses" on courses for select using (true);
create policy "Public insert access for courses" on courses for insert with check (true);
create policy "Public update access for courses" on courses for update using (true);
create policy "Public delete access for courses" on courses for delete using (true);

-- Student Courses: Public read, Admin/Student write
create policy "Public read access for student_courses" on student_courses for select using (true);
create policy "Public insert access for student_courses" on student_courses for insert with check (true);
create policy "Public update access for student_courses" on student_courses for update using (true);
create policy "Public delete access for student_courses" on student_courses for delete using (true);

-- Grade History: Public read, Admin write
create policy "Public read access for grade_history" on grade_history for select using (true);
create policy "Public insert access for grade_history" on grade_history for insert with check (true);
create policy "Public update access for grade_history" on grade_history for update using (true);
create policy "Public delete access for grade_history" on grade_history for delete using (true);

-- Admins: Only admins can see admins
create policy "Public read access for admins" on admins for select using (true);
create policy "Public insert access for admins" on admins for insert with check (true);

-- Module Categories: Public access
CREATE POLICY "Public access for module_categories" ON module_categories FOR ALL USING (true);

-- Modules: Public access
CREATE POLICY "Public access for modules" ON modules FOR ALL USING (true);

-- Student Module Assessments: Public access
CREATE POLICY "Public access for student_module_assessments" ON student_module_assessments FOR ALL USING (true);

-- Student Special Data: Public access
CREATE POLICY "Public access for student_special_data" ON student_special_data FOR ALL USING (true);
`

export const seedDataSql = `
-- Seed Admin Data
insert into admins (username, password_hash)
values ('admin', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.') -- Hash for 'admin123'
on conflict (username) do nothing;

-- Seed Courses Catalog
insert into courses (id, name, credits, department, mode) values -- Changed instructor to mode
('CS301', 'Data Structures & Algorithms', 4, 'Computer Science', 'Physical'),
('CS302', 'Database Systems', 3, 'Computer Science', 'Online'),
('CS401', 'Machine Learning', 4, 'Computer Science', 'Physical'),
('CS402', 'Software Engineering', 3, 'Computer Science', 'Self study'),
('MATH301', 'Statistics', 3, 'Mathematics', 'Online'),
('IT201', 'Network Fundamentals', 3, 'Information Technology', 'Physical'),
('IT202', 'Web Development', 4, 'Information Technology', 'Online'),
('IT301', 'Cybersecurity', 3, 'Information Technology', 'Physical'),
('IT302', 'Cloud Computing', 3, 'Information Technology', 'Self study'),
('DS401', 'Advanced Machine Learning', 4, 'Data Science', 'Physical'),
('DS402', 'Big Data Analytics', 3, 'Data Science', 'Online'),
('DS403', 'Deep Learning', 4, 'Data Science', 'Physical'),
('DS404', 'Data Visualization', 3, 'Data Science', 'Self study'),
('SE101', 'Introduction to Programming', 4, 'Software Engineering', 'Physical'),
('SE102', 'Software Design Principles', 3, 'Software Engineering', 'Online'),
('MATH101', 'Calculus I', 4, 'Mathematics', 'Physical'),
('ENG101', 'Technical Writing', 3, 'English', 'Self study')
on conflict (id) do nothing;

-- Seed Students
insert into students (id, name, email, password_hash, program, year, semester, avatar, parish, deanery, phone) values
('ST001', 'John Smith', 'john.smith@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Computer Science', '2025', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Mary', 'North Deanery', '555-0101'),
('ST002', 'Emily Johnson', 'emily.johnson@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Information Technology', '2026', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Joseph', 'South Deanery', '555-0102'),
('ST003', 'Michael Brown', 'michael.brown@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Data Science', '2025', '1Qtr', '/placeholder.svg?height=100&width=100', 'Holy Trinity', 'East Deanery', '555-0103'),
('ST004', 'Sarah Davis', 'sarah.davis@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Software Engineering', '2027', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Peter', 'West Deanery', '555-0104')
on conflict (id) do update set 
  parish = EXCLUDED.parish,
  deanery = EXCLUDED.deanery,
  phone = EXCLUDED.phone;

-- Seed Student Courses
insert into student_courses (student_id, course_id, course_name, credits, grade, gpa, status, progress, mode, semester) values -- Changed instructor to mode
('ST001', 'CS301', 'Data Structures & Algorithms', 4, 'A', 4.0, 'Completed', 100, 'Physical', '2Qtr'),
('ST001', 'CS302', 'Database Systems', 3, 'A-', 3.7, 'Completed', 100, 'Online', '2Qtr'),
('ST001', 'CS401', 'Machine Learning', 4, 'B+', 3.3, 'In Progress', 75, 'Physical', '1Qtr'),
('ST001', 'CS402', 'Software Engineering', 3, '-', 0, 'Registered', 25, 'Self study', '1Qtr'),
('ST001', 'MATH301', 'Statistics', 3, 'A', 4.0, 'Completed', 100, 'Online', '2Qtr'),

('ST002', 'IT201', 'Network Fundamentals', 3, 'A', 4.0, 'Completed', 100, 'Physical', '2Qtr'),
('ST002', 'IT202', 'Web Development', 4, 'A-', 3.7, 'Completed', 100, 'Online', '2Qtr'),
('ST002', 'IT301', 'Cybersecurity', 3, 'B+', 3.3, 'In Progress', 60, 'Physical', '1Qtr'),
('ST002', 'IT302', 'Cloud Computing', 3, '-', 0, 'Registered', 15, 'Self study', '1Qtr'),

('ST003', 'DS401', 'Advanced Machine Learning', 4, 'A', 4.0, 'Completed', 100, 'Physical', '2Qtr'),
('ST003', 'DS402', 'Big Data Analytics', 3, 'A', 4.0, 'Completed', 100, 'Online', '2Qtr'),
('ST003', 'DS403', 'Deep Learning', 4, 'A-', 3.7, 'In Progress', 80, 'Physical', '1Qtr'),
('ST003', 'DS404', 'Data Visualization', 3, '-', 0, 'Registered', 30, 'Self study', '1Qtr'),

('ST004', 'SE101', 'Introduction to Programming', 4, 'A-', 3.7, 'Completed', 100, 'Physical', '2Qtr'),
('ST004', 'SE102', 'Software Design Principles', 3, 'B+', 3.3, 'In Progress', 70, 'Online', '1Qtr'),
('ST004', 'MATH101', 'Calculus I', 4, '-', 0, 'Registered', 40, 'Physical', '1Qtr'),
('ST004', 'ENG101', 'Technical Writing', 3, '-', 0, 'Registered', 20, 'Self study', '1Qtr')
on conflict do nothing;

-- Seed Grade History
insert into grade_history (student_id, semester, gpa) values
('ST001', '1Qtr', 3.4), ('ST001', '2Qtr', 3.8), ('ST001', '3Qtr', 3.5),
('ST002', '1Qtr', 3.6), ('ST002', '2Qtr', 3.85), ('ST002', '3Qtr', 3.3),
('ST003', '1Qtr', 3.8), ('ST003', '2Qtr', 3.9), ('ST003', '3Qtr', 3.95), ('ST003', '4Qtr', 4.0),
('ST004', '2Qtr', 3.7), ('ST004', '1Qtr', 3.5)
on conflict do nothing;

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
('sa_week1', 'self_awareness', 'Developing Self Awareness', 1, FALSE, FALSE),
('sa_week2', 'self_awareness', 'Managing Personal Stress', 2, FALSE, FALSE),
('sa_week3', 'self_awareness', 'Solving Problems', 3, TRUE, FALSE),
('rel_week1', 'relating', 'Communicating Supportively', 1, FALSE, FALSE),
('rel_week2', 'relating', 'Gaining Credibility and Influence', 2, FALSE, FALSE),
('rel_week3', 'relating', 'Managing Conflicts', 3, TRUE, FALSE),
('col_week1', 'collaborating', 'Motivating', 1, FALSE, FALSE),
('col_week2', 'collaborating', 'Empowering', 2, FALSE, FALSE),
('col_week3', 'collaborating', 'Delegating', 3, TRUE, FALSE),
('lead_week1', 'leading_others', 'Teams and Groups', 1, FALSE, FALSE),
('lead_week2', 'leading_others', 'Meetings', 2, FALSE, FALSE),
('lead_week3', 'leading_others', 'Positive Change', 3, TRUE, FALSE),
('str_week1', 'strengths', 'Strengths Week 1', 1, FALSE, TRUE),
('str_week2', 'strengths', 'Strengths Week 2', 2, FALSE, TRUE),
('str_week3', 'strengths', 'Strengths Week 3', 3, FALSE, TRUE),
('str_week4', 'strengths', 'Strengths Week 4', 4, FALSE, TRUE),
('str_capstone', 'strengths', 'Strengths CAPSTONE', 5, TRUE, FALSE),
('gift_week1', 'gifts', 'Gifts Week 1', 1, FALSE, TRUE),
('gift_week2', 'gifts', 'Gifts Week 2', 2, FALSE, TRUE),
('gift_week3', 'gifts', 'Gifts Week 3', 3, FALSE, TRUE),
('gift_week4', 'gifts', 'Gifts Week 4', 4, FALSE, TRUE),
('gift_capstone', 'gifts', 'Gifts CAPSTONE', 5, TRUE, FALSE),
('par_day1', 'parish_guidelines', 'Parish Guidelines Day 1', 1, FALSE, FALSE),
('par_day2', 'parish_guidelines', 'Parish Guidelines Day 2', 2, TRUE, FALSE),
('dean_day1', 'deanery_lalc', 'Deanery & Archdiocesan Guidelines Day 1', 1, FALSE, FALSE),
('dean_day2', 'deanery_lalc', 'Deanery or Archdiocesan Guidelines Day 2', 2, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
`
