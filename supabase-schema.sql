-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create briefs table (simplified)
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create drafts table (simplified)
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  blog_md TEXT NOT NULL,
  linkedin_txt TEXT NOT NULL,
  footnotes_md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger for drafts
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for briefs
CREATE POLICY "Users can view their own briefs" ON briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefs" ON briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefs" ON briefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefs" ON briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for drafts
CREATE POLICY "Users can view their own drafts" ON drafts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM briefs 
      WHERE briefs.id = drafts.brief_id 
      AND briefs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own drafts" ON drafts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM briefs 
      WHERE briefs.id = drafts.brief_id 
      AND briefs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own drafts" ON drafts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM briefs 
      WHERE briefs.id = drafts.brief_id 
      AND briefs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own drafts" ON drafts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM briefs 
      WHERE briefs.id = drafts.brief_id 
      AND briefs.user_id = auth.uid()
    )
  );
