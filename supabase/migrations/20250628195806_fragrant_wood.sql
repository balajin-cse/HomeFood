/*
  # Insert test cook profiles with proper UUIDs

  1. New Data
    - Cook profiles with valid UUIDs
    - Sample menu items for each cook
    
  2. Changes
    - Use proper UUID format for profile IDs
    - Link menu items to cook profiles correctly
*/

-- Insert test cook profiles with proper UUIDs
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
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'maria@homechef.app',
  'Maria Rodriguez',
  '+1-555-0101',
  true,
  'North Beach, SF',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'sarah@homechef.app',
  'Sarah Johnson',
  '+1-555-0102',
  true,
  'Mission District, SF',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'david@homechef.app',
  'David Chen',
  '+1-555-0103',
  true,
  'Chinatown, SF',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'kenji@homechef.app',
  'Kenji Tanaka',
  '+1-555-0104',
  true,
  'Japantown, SF',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'elena@homechef.app',
  'Elena Papadopoulos',
  '+1-555-0105',
  true,
  'Castro, SF',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'marcus@homechef.app',
  'Marcus Campbell',
  '+1-555-0106',
  true,
  'Oakland, CA',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  is_cook = EXCLUDED.is_cook,
  address = EXCLUDED.address,
  profile_image = EXCLUDED.profile_image,
  updated_at = now();

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
)
ON CONFLICT (id) DO NOTHING;