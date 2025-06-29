/*
  # Check and Fix Database Constraints

  1. Foreign Key Constraints
    - Ensure all relationships are properly defined
    - Add appropriate ON DELETE actions
    
  2. Unique Constraints
    - Confirm email uniqueness on profiles
    - Ensure tracking_number uniqueness on orders
    
  3. Changes
    - Adds any missing constraints
    - Fixes existing constraint issues
*/

-- Check and ensure tracking number constraint on orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_tracking_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_tracking_number_key UNIQUE (tracking_number);
  END IF;
END $$;

-- Check and ensure email constraint on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Check and ensure foreign key constraints
DO $$
BEGIN
  -- orders.customer_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES profiles(id)
    ON DELETE SET NULL;
  END IF;

  -- orders.cook_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_cook_id_fkey'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_cook_id_fkey
    FOREIGN KEY (cook_id) REFERENCES profiles(id)
    ON DELETE SET NULL;
  END IF;

  -- order_items.order_id -> orders.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE;
  END IF;

  -- menu_items.cook_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'menu_items_cook_id_fkey'
  ) THEN
    ALTER TABLE menu_items
    ADD CONSTRAINT menu_items_cook_id_fkey
    FOREIGN KEY (cook_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;

END $$;