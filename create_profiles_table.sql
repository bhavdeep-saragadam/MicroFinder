-- Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION set_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_updated_at();

-- Create Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own profile
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Policy to allow users to update their own profile
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Policy to allow users to insert their own profile
CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid()); 