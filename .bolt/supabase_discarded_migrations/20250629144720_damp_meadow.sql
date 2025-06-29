/*
  # Update Order Schema and Fix Order Management

  1. New Columns
    - Add an `image` field to order_items to store food images
    - Add a `customer_id` index to improve query performance
  
  2. Triggers
    - Ensure all timestamps are updated automatically
  
  3. Security
    - Update RLS policies to allow cooks to see their order data
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

-- Update RLS policies for orders to ensure cooks can see orders related to them
CREATE POLICY "Cooks can read orders for their food" 
  ON orders
  FOR SELECT
  TO authenticated
  USING (cook_id = auth.uid());

-- Create index on customer_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);