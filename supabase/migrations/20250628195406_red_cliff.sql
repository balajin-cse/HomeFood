/*
  # Create test cook profiles for order functionality

  1. New Profiles
    - Insert test cook profiles with specific IDs that match the app's mock data
    - Each profile has `is_cook = true` to enable cooking functionality
    - Profiles include all required fields for the application

  2. Security
    - Profiles will be accessible through existing RLS policies
    - Cook profiles are readable by anyone (for browsing cooks)
    - Individual cooks can manage their own profiles
*/

-- Insert test cook profiles that match the app's mock data
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
  'ck-maria',
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
  'ck-sarah',
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
  'ck-david',
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
  'ck-kenji',
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
  'ck-elena',
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
  'ck-marcus',
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
  'ck-maria',
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
  'ck-maria',
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
  'ck-sarah',
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
  'ck-david',
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
  'ck-kenji',
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