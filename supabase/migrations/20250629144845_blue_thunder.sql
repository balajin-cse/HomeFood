/*
  # Fix Order Management System

  1. Database Changes
    - Add food_image column to order_items table if it doesn't exist
    - Create/update function for updating timestamps
    - Update RLS policies for proper cook access to orders
    - Add index for better query performance

  2. Security
    - Ensure cooks can read orders assigned to them
    - Maintain existing customer access policies
*/

-- Add food_image column to order_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'food_image'
  ) THEN
    ALTER TABLE order_items ADD COLUMN food_image text;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update RLS policies for orders - drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Cooks can read orders for their food" ON orders;

CREATE POLICY "Cooks can read orders for their food" 
  ON orders
  FOR SELECT
  TO authenticated
  USING (cook_id = auth.uid());

-- Create index on customer_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);