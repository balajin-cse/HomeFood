/*
  # Complete Authentication Setup

  1. Tables
    - Ensures profiles table exists with proper structure
    - Links to auth.users via foreign key

  2. Functions
    - handle_new_user: Automatically creates profile when user signs up
    - Handles test users and provides sensible defaults

  3. Security
    - Enable RLS on profiles table
    - Add policies for profile access
    - Secure function with SECURITY DEFINER

  4. Triggers
    - Automatically create profile when user is created in auth.users
*/

-- Ensure profiles table exists with all required columns
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  is_cook boolean DEFAULT false,
  address text,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read cook profiles" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Public read access to cook profiles (for discovery)
CREATE POLICY "Anyone can read cook profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_cook = true);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create or replace the handle_new_user function with comprehensive user handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_name text;
  user_phone text;
  user_is_cook boolean;
  user_address text;
  user_profile_image text;
BEGIN
  -- Extract user data from metadata or provide defaults
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN 'Bala'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN 'Cook Name'
      WHEN NEW.email LIKE 'ck-%@homefood.app' THEN 
        INITCAP(REPLACE(split_part(split_part(NEW.email, 'ck-', 2), '@', 1), '-', ' '))
      ELSE INITCAP(split_part(NEW.email, '@', 1))
    END
  );
  
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN '+1234567890'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN '+1234567891'
      ELSE NULL
    END
  );
  
  user_is_cook := COALESCE(
    (NEW.raw_user_meta_data->>'is_cook')::boolean,
    CASE 
      WHEN NEW.email LIKE 'ck-%@homefood.app' THEN true
      ELSE false
    END
  );

  -- Set address based on user type
  user_address := CASE 
    WHEN NEW.email = 'bala@example.com' THEN '123 Main Street, San Francisco, CA 94102'
    WHEN NEW.email = 'ck-cookname@homefood.app' THEN '456 Chef Street, San Francisco, CA 94103'
    WHEN user_is_cook THEN '789 Kitchen Lane, San Francisco, CA 94104'
    ELSE NULL
  END;

  -- Set profile image based on user type
  user_profile_image := CASE 
    WHEN user_is_cook THEN 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    ELSE 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
  END;

  -- Insert profile (will succeed or fail gracefully)
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    is_cook,
    address,
    profile_image,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    user_is_cook,
    user_address,
    user_profile_image,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    is_cook = EXCLUDED.is_cook,
    address = EXCLUDED.address,
    profile_image = EXCLUDED.profile_image,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating/updating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;