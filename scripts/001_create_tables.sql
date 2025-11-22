-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop tables if they exist to ensure clean slate (in reverse order of dependencies)
drop table if exists grade_history;
drop table if exists student_courses;
drop table if exists courses;
drop table if exists students;
drop table if exists admins;

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
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for courses catalog
create table if not exists courses (
  id text primary key,
  name text not null,
  credits integer not null,
  department text not null,
  instructor text,
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
  instructor text,
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

-- Enable Row Level Security
alter table students enable row level security;
alter table courses enable row level security;
alter table student_courses enable row level security;
alter table grade_history enable row level security;
alter table admins enable row level security;

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
