/*
  # Orders System Setup

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `tracking_number` (text, unique)
      - `customer_id` (uuid, references profiles)
      - `cook_id` (uuid, references profiles)
      - `status` (enum)
      - `total_amount` (decimal)
      - `delivery_address` (text)
      - `delivery_instructions` (text)
      - `estimated_delivery_time` (text)
      - `actual_delivery_time` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `food_id` (text)
      - `food_title` (text)
      - `food_description` (text)
      - `food_image` (text)
      - `price` (decimal)
      - `quantity` (integer)
      - `special_instructions` (text)

    - `menu_items`
      - `id` (uuid, primary key)
      - `cook_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `price` (decimal)
      - `image` (text)
      - `meal_type` (enum)
      - `available_quantity` (integer)
      - `tags` (text array)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for customers, cooks, and public access
*/

-- Create order status enum
CREATE TYPE order_status AS ENUM (
  'confirmed',
  'preparing',
  'ready',
  'picked_up', 
  'delivered',
  'cancelled'
);

-- Create meal type enum
CREATE TYPE meal_type AS ENUM (
  'breakfast',
  'lunch', 
  'dinner'
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cook_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status order_status DEFAULT 'confirmed',
  total_amount decimal(10,2) NOT NULL,
  delivery_address text NOT NULL,
  delivery_instructions text,
  estimated_delivery_time text,
  actual_delivery_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  food_id text NOT NULL,
  food_title text NOT NULL,
  food_description text,
  food_image text,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image text,
  meal_type meal_type DEFAULT 'lunch',
  available_quantity integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Customers can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Cooks can read orders for their food"
  ON orders
  FOR SELECT
  TO authenticated
  USING (cook_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Cooks can update orders for their food"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (cook_id = auth.uid());

-- Policies for order_items
CREATE POLICY "Users can read order items for their orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR orders.cook_id = auth.uid())
    )
  );

CREATE POLICY "Customers can create order items for their orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- Policies for menu_items
CREATE POLICY "Anyone can read active menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Cooks can manage their own menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (cook_id = auth.uid())
  WITH CHECK (cook_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text AS $$
DECLARE
  tracking_num text;
BEGIN
  tracking_num := 'HF' || EXTRACT(epoch FROM now())::bigint::text;
  RETURN tracking_num;
END;
$$ LANGUAGE plpgsql;