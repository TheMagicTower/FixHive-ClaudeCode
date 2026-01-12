-- FixHive Supabase Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Errors table
CREATE TABLE IF NOT EXISTS errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  message_hash TEXT NOT NULL,
  language TEXT,
  framework TEXT,
  contributor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for errors
CREATE INDEX IF NOT EXISTS idx_errors_hash ON errors(message_hash);
CREATE INDEX IF NOT EXISTS idx_errors_language ON errors(language);
CREATE INDEX IF NOT EXISTS idx_errors_framework ON errors(framework);
CREATE INDEX IF NOT EXISTS idx_errors_created ON errors(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_errors_message_search
  ON errors USING gin(to_tsvector('english', message));

-- Solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_id UUID NOT NULL REFERENCES errors(id) ON DELETE CASCADE,
  resolution TEXT NOT NULL,
  resolution_code TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  contributor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for solutions
CREATE INDEX IF NOT EXISTS idx_solutions_error ON solutions(error_id);
CREATE INDEX IF NOT EXISTS idx_solutions_votes ON solutions(upvotes DESC);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_id UUID NOT NULL,
  helpful BOOLEAN NOT NULL,
  contributor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(knowledge_id, contributor_id)
);

-- Create index for votes
CREATE INDEX IF NOT EXISTS idx_votes_knowledge ON votes(knowledge_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_id UUID NOT NULL,
  reason TEXT,
  reporter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Create index for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Helper functions for vote counting
CREATE OR REPLACE FUNCTION increment_upvotes(solution_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE solutions SET upvotes = upvotes + 1 WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_upvotes(solution_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE solutions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_downvotes(solution_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE solutions SET downvotes = downvotes + 1 WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_downvotes(solution_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE solutions SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (using anon key)
CREATE POLICY "Allow read errors" ON errors FOR SELECT USING (true);
CREATE POLICY "Allow read solutions" ON solutions FOR SELECT USING (true);

-- Allow insert for authenticated/anon users
CREATE POLICY "Allow insert errors" ON errors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert solutions" ON solutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert reports" ON reports FOR INSERT WITH CHECK (true);

-- Allow update/delete own votes
CREATE POLICY "Allow update own votes" ON votes
  FOR UPDATE USING (contributor_id = current_setting('app.contributor_id', true));
CREATE POLICY "Allow delete own votes" ON votes
  FOR DELETE USING (contributor_id = current_setting('app.contributor_id', true));

-- Grant permissions
GRANT SELECT, INSERT ON errors TO anon;
GRANT SELECT, INSERT ON solutions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO anon;
GRANT INSERT ON reports TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION increment_upvotes TO anon;
GRANT EXECUTE ON FUNCTION decrement_upvotes TO anon;
GRANT EXECUTE ON FUNCTION increment_downvotes TO anon;
GRANT EXECUTE ON FUNCTION decrement_downvotes TO anon;
