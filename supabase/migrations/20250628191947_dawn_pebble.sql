/*
  # Enhanced User Profile Creation

  This migration updates the handle_new_user function to properly handle
  test users and create profiles with appropriate default data.

  The test users need to be created through Supabase Auth API, not directly
  in the database, to maintain referential integrity.

  Test Users to Create via Auth API:
  1. Customer: bala@example.com (password: pass123)
  2. Cook: ck-cookname@homefood.app (password: cookpass)
*/

-- Update the handle_new_user function to handle test users and provide better defaults
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
  -- Extract user data from metadata or provide defaults based on email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN 'Bala'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN 'Cook Name'
      WHEN NEW.email LIKE 'ck-%@homefood.app' THEN split_part(split_part(NEW.email, 'ck-', 2), '@', 1)
      ELSE split_part(NEW.email, '@', 1)
    END
  );
  
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.email = 'bala@example.com' THEN '+1234567890'
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN '+1234567891'
      WHEN NEW.email LIKE 'ck-%@homefood.app' THEN '+1234567892'
      ELSE NULL
    END
  );
  
  user_is_cook := COALESCE(
    (NEW.raw_user_meta_data->>'is_cook')::boolean,
    CASE 
      WHEN NEW.email = 'ck-cookname@homefood.app' THEN true
      WHEN NEW.email LIKE 'ck-%@homefood.app' THEN true
      ELSE false
    END
  );

  -- Set address based on user type
  user_address := CASE 
    WHEN NEW.email = 'bala@example.com' THEN '123 Main Street, San Francisco, CA 94102'
    WHEN NEW.email = 'ck-cookname@homefood.app' THEN '456 Chef Street, San Francisco, CA 94103'
    WHEN user_is_cook THEN 'Chef Location, San Francisco, CA'
    ELSE NULL
  END;

  -- Set profile image based on user type
  user_profile_image := CASE 
    WHEN user_is_cook THEN 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    ELSE 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
  END;

  -- Insert or update profile
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

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();