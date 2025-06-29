/*
  # Confirm Sample Data Setup

  1. Checks
    - Verify cook profiles exist
    - Verify menu items exist
    - Ensure relationships are intact
    
  2. Notes
    - This is a safe migration that verifies data consistency
    - Serves as a final check after other migrations have run
*/

-- Verify profiles and handle any remaining conflicts
DO $$
DECLARE
  profile_count INT;
  menu_item_count INT;
BEGIN
  -- Check if sample profiles exist
  SELECT COUNT(*) INTO profile_count 
  FROM profiles 
  WHERE email IN (
    'maria@homechef.app',
    'sarah@homechef.app', 
    'david@homechef.app',
    'kenji@homechef.app',
    'elena@homechef.app',
    'marcus@homechef.app',
    'bala@example.com'
  );

  -- Check if sample menu items exist
  SELECT COUNT(*) INTO menu_item_count 
  FROM menu_items 
  WHERE cook_id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006'
  );

  -- Log the counts
  RAISE NOTICE 'Sample Profiles: %, Sample Menu Items: %', profile_count, menu_item_count;
END $$;

-- Verify all foreign key constraints are intact
DO $$
DECLARE
  missing_constraints TEXT := '';
BEGIN
  -- Check orders.customer_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'orders'::regclass 
    AND confrelid = 'profiles'::regclass
    AND conname = 'orders_customer_id_fkey'
  ) THEN
    missing_constraints := missing_constraints || 'orders_customer_id_fkey, ';
  END IF;

  -- Check orders.cook_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'orders'::regclass 
    AND confrelid = 'profiles'::regclass
    AND conname = 'orders_cook_id_fkey'
  ) THEN
    missing_constraints := missing_constraints || 'orders_cook_id_fkey, ';
  END IF;

  -- Check order_items.order_id -> orders.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'order_items'::regclass 
    AND confrelid = 'orders'::regclass
    AND conname = 'order_items_order_id_fkey'
  ) THEN
    missing_constraints := missing_constraints || 'order_items_order_id_fkey, ';
  END IF;

  -- Check menu_items.cook_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'menu_items'::regclass 
    AND confrelid = 'profiles'::regclass
    AND conname = 'menu_items_cook_id_fkey'
  ) THEN
    missing_constraints := missing_constraints || 'menu_items_cook_id_fkey, ';
  END IF;

  -- Log missing constraints if any
  IF length(missing_constraints) > 0 THEN
    RAISE NOTICE 'Missing constraints: %', missing_constraints;
  ELSE
    RAISE NOTICE 'All foreign key constraints are intact';
  END IF;
END $$;