/*
  # Sample Users and Menu Items Setup

  1. New Data
    - Sample cook users with auth accounts
    - Sample customer user for testing
    - Menu items for each cook
    
  2. Security
    - Proper auth.users integration
    - Maintains all existing RLS policies
*/

-- Create a function to safely create sample users and profiles
CREATE OR REPLACE FUNCTION create_sample_cook(
  user_id uuid,
  user_email text,
  user_name text,
  user_phone text,
  user_address text,
  user_image text
) RETURNS void AS $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if user already exists by email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = user_email;

  -- Only insert into auth.users if user doesn't exist
  IF existing_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      user_email,
      crypt('cookpass', gen_salt('bf')), -- Default password: cookpass
      now(),
      null,
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name', user_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    existing_user_id := user_id;
  END IF;

  -- Insert or update the profile using the existing or new user ID
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
    existing_user_id,
    user_email,
    user_name,
    user_phone,
    true,
    user_address,
    user_image,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    is_cook = EXCLUDED.is_cook,
    address = EXCLUDED.address,
    profile_image = EXCLUDED.profile_image,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample cook users and profiles
SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'maria@homechef.app',
  'Maria Rodriguez',
  '+1-555-0101',
  'North Beach, SF',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'sarah@homechef.app',
  'Sarah Johnson',
  '+1-555-0102',
  'Mission District, SF',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'david@homechef.app',
  'David Chen',
  '+1-555-0103',
  'Chinatown, SF',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'kenji@homechef.app',
  'Kenji Tanaka',
  '+1-555-0104',
  'Japantown, SF',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'elena@homechef.app',
  'Elena Papadopoulos',
  '+1-555-0105',
  'Castro, SF',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

SELECT create_sample_cook(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'marcus@homechef.app',
  'Marcus Campbell',
  '+1-555-0106',
  'Oakland, CA',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
);

-- Create a regular customer user for testing with different password
-- First, check if we need to create a customer user function
CREATE OR REPLACE FUNCTION create_sample_customer(
  user_id uuid,
  user_email text,
  user_name text,
  user_phone text,
  user_address text,
  user_image text,
  user_password text
) RETURNS void AS $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if user already exists by email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = user_email;

  -- Only insert into auth.users if user doesn't exist
  IF existing_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      null,
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name', user_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    existing_user_id := user_id;
  END IF;

  -- Insert or update the profile using the existing or new user ID
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
    existing_user_id,
    user_email,
    user_name,
    user_phone,
    false, -- Customer, not a cook
    user_address,
    user_image,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    is_cook = false, -- Ensure it's set to customer
    address = EXCLUDED.address,
    profile_image = EXCLUDED.profile_image,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the customer user
SELECT create_sample_customer(
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  'bala@example.com',
  'Bala',
  '+1-555-0200',
  'Downtown SF',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'pass123'
);

-- Insert some sample menu items for the cooks
INSERT INTO menu_items (
  cook_id,
  title,
  description,
  price,
  image,
  meal_type,
  available_quantity,
  tags,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Homemade Pasta Carbonara',
  'Fresh pasta with creamy carbonara sauce, pancetta, and fresh herbs',
  16.99,
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
  'lunch',
  5,
  ARRAY['Italian', 'Pasta', 'Comfort Food'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Margherita Pizza',
  'Traditional wood-fired pizza with fresh mozzarella, basil, and tomato sauce',
  14.99,
  'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  3,
  ARRAY['Italian', 'Pizza', 'Vegetarian'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Quinoa Buddha Bowl',
  'Nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing',
  13.99,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'lunch',
  4,
  ARRAY['Healthy', 'Vegan', 'Gluten-Free'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Fresh Avocado Toast',
  'Artisan sourdough topped with smashed avocado, cherry tomatoes, and microgreens',
  12.50,
  'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400',
  'breakfast',
  6,
  ARRAY['Healthy', 'Vegetarian', 'Fresh'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Miso Glazed Salmon',
  'Pan-seared salmon with miso glaze, served with steamed rice and vegetables',
  22.99,
  'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  2,
  ARRAY['Asian Fusion', 'Seafood', 'Gourmet'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Kung Pao Chicken',
  'Spicy Sichuan chicken with peanuts, vegetables, and chili peppers',
  17.99,
  'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  4,
  ARRAY['Asian Fusion', 'Spicy', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'Authentic Tonkotsu Ramen',
  'Rich pork bone broth with handmade noodles, chashu pork, and soft-boiled egg',
  18.99,
  'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  3,
  ARRAY['Japanese', 'Ramen', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'Chicken Teriyaki Bento',
  'Traditional bento box with teriyaki chicken, rice, and assorted sides',
  15.99,
  'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
  'lunch',
  5,
  ARRAY['Japanese', 'Bento', 'Complete Meal'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Greek Moussaka',
  'Traditional layered casserole with eggplant, meat sauce, and béchamel',
  19.99,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  3,
  ARRAY['Greek', 'Mediterranean', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'Jerk Chicken with Rice and Peas',
  'Authentic Caribbean jerk chicken with coconut rice and kidney beans',
  16.99,
  'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  4,
  ARRAY['Caribbean', 'Spicy', 'Traditional'],
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Clean up the helper functions
DROP FUNCTION IF EXISTS create_sample_cook(uuid, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_sample_customer(uuid, text, text, text, text, text, text);