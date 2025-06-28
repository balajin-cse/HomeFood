/*
  # Create Test Users and Enhanced User Handler

  1. New Features
    - Insert test profiles for demo users
    - Enhanced handle_new_user function for test accounts
    - Proper error handling and fallbacks

  2. Test Users
    - Customer: bala@example.com (Bala)
    - Cook: ck-cookname@homefood.app (Cook Name)

  3. Security
    - Uses ON CONFLICT to handle existing profiles
    - Enhanced error handling in trigger function
*/

-- Insert test profiles for demo users
-- Note: The actual auth users need to be created through Supabase Auth API
-- This migration ensures profiles exist when the auth users are created

-- Customer profile
INSERT INTO profiles (
  id,
  email,
  name,
  phone,
  is_cook,
  address,
  profile_image,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'bala@example.com',
  'Bala',
  '+1234567890',
  false,
  '123 Main Street, San Francisco, CA 94102',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  is_cook = EXCLUDED.is_cook,
  address = EXCLUDED.address,
  updated_at = now();

-- Cook profile
INSERT INTO profiles (
  id,
  email,
  name,
  phone,
  is_cook,
  address,
  profile_image,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'ck-cookname@homefood.app',
  'Cook Name',
  '+1234567891',
  true,
  '456 Chef Street, San Francisco, CA 94103',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  is_cook = EXCLUDED.is_cook,
  address = EXCLUDED.address,
  updated_at = now();

-- Update the handle_new_user function to handle test users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_name text;
  user_phone text;
  user_is_cook boolean;
BEGIN
  -- Extract user data from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN 'Bala'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN 'Cook Name'
      ELSE split_part(NEW.email, '@', 1)
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
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN true
      ELSE false
    END
  );

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    is_cook,
    address,
    profile_image
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    user_is_cook,
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN '123 Main Street, San Francisco, CA 94102'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN '456 Chef Street, San Francisco, CA 94103'
      ELSE NULL
    END,
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    is_cook = EXCLUDED.is_cook,
    address = EXCLUDED.address,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating/updating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;