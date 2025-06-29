/*
  # Sample data for HomeFood application

  1. Sample Data
    - 6 diverse cook profiles with different cuisines
    - 18 menu items across all meal types
    - 1 test customer profile
  
  2. Conflict Prevention
    - Delete existing sample data by email and ID
    - Use UPSERT for safe insertions
    - Handle all potential duplicates
*/

-- Clear any existing sample data first to prevent conflicts
-- Delete by both email and ID to ensure complete cleanup
DELETE FROM menu_items WHERE cook_id IN (
  SELECT id FROM profiles WHERE email IN (
    'maria@homechef.app',
    'sarah@homechef.app', 
    'david@homechef.app',
    'kenji@homechef.app',
    'elena@homechef.app',
    'marcus@homechef.app',
    'bala@example.com'
  )
);

DELETE FROM profiles WHERE email IN (
  'maria@homechef.app',
  'sarah@homechef.app', 
  'david@homechef.app',
  'kenji@homechef.app',
  'elena@homechef.app',
  'marcus@homechef.app',
  'bala@example.com'
) OR id IN (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  '550e8400-e29b-41d4-a716-446655440010'::uuid
);

-- Insert sample cook profiles using UPSERT to handle any remaining conflicts
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
-- Maria Rodriguez - Italian Cook
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
-- Sarah Johnson - Healthy/Vegan Cook
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
-- David Chen - Asian Fusion Cook
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
-- Kenji Tanaka - Japanese Cook
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
-- Elena Papadopoulos - Greek/Mediterranean Cook
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
-- Marcus Campbell - Caribbean Cook
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
),
-- Test Customer
(
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  'bala@example.com',
  'Bala',
  '+1-555-0200',
  false,
  'Downtown SF',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
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
  updated_at = now()
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  is_cook = EXCLUDED.is_cook,
  address = EXCLUDED.address,
  profile_image = EXCLUDED.profile_image,
  updated_at = now();

-- Insert sample menu items for each cook
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
-- Maria Rodriguez (Italian) - Items
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Homemade Pasta Carbonara',
  'Fresh pasta with creamy carbonara sauce, pancetta, and fresh herbs made with traditional Italian techniques',
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
  'Traditional wood-fired pizza with fresh mozzarella, basil, and San Marzano tomato sauce',
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
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Osso Buco Milanese',
  'Slow-braised veal shanks with risotto and gremolata, a classic Northern Italian dish',
  28.99,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  2,
  ARRAY['Italian', 'Braised', 'Traditional'],
  true,
  now(),
  now()
),
-- Sarah Johnson (Healthy/Vegan) - Items
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
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Green Goddess Smoothie Bowl',
  'Spinach, mango, and coconut smoothie bowl topped with granola and fresh fruit',
  11.99,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'breakfast',
  8,
  ARRAY['Healthy', 'Vegan', 'Raw'],
  true,
  now(),
  now()
),
-- David Chen (Asian Fusion) - Items
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Miso Glazed Salmon',
  'Pan-seared salmon with miso glaze, served with steamed rice and seasonal vegetables',
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
  'Spicy Sichuan chicken with peanuts, vegetables, and chili peppers in traditional sauce',
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
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Dan Dan Noodles',
  'Hand-pulled noodles with spicy sesame sauce, ground pork, and preserved vegetables',
  15.99,
  'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
  'lunch',
  3,
  ARRAY['Asian Fusion', 'Noodles', 'Spicy'],
  true,
  now(),
  now()
),
-- Kenji Tanaka (Japanese) - Items
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
  'Traditional bento box with teriyaki chicken, rice, pickled vegetables, and miso soup',
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
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'Chirashi Bowl',
  'Fresh assorted sashimi over sushi rice with traditional accompaniments',
  24.99,
  'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  2,
  ARRAY['Japanese', 'Sashimi', 'Raw'],
  true,
  now(),
  now()
),
-- Elena Papadopoulos (Greek/Mediterranean) - Items
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Greek Moussaka',
  'Traditional layered casserole with eggplant, spiced meat sauce, and creamy béchamel',
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
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Lamb Souvlaki Platter',
  'Grilled lamb skewers with tzatziki, pita, Greek salad, and lemon potatoes',
  21.99,
  'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  3,
  ARRAY['Greek', 'Grilled', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Spanakopita',
  'Flaky phyllo pastry filled with spinach, feta cheese, and fresh herbs',
  13.99,
  'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400',
  'lunch',
  4,
  ARRAY['Greek', 'Vegetarian', 'Pastry'],
  true,
  now(),
  now()
),
-- Marcus Campbell (Caribbean) - Items
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'Jerk Chicken with Rice and Peas',
  'Authentic Caribbean jerk chicken with coconut rice, kidney beans, and plantains',
  16.99,
  'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  4,
  ARRAY['Caribbean', 'Spicy', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'Curry Goat with Roti',
  'Tender goat curry served with freshly made roti bread and mango chutney',
  19.99,
  'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400',
  'dinner',
  3,
  ARRAY['Caribbean', 'Curry', 'Traditional'],
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  'Ackee and Saltfish',
  'Jamaica''s national dish with ackee fruit, salted cod, and traditional seasonings',
  17.99,
  'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
  'breakfast',
  2,
  ARRAY['Caribbean', 'Traditional', 'Seafood'],
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;