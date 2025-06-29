/*
  # Fix Row Level Security (RLS) Policies

  1. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Ensure proper access control for all users

  2. Changes
    - Re-enables RLS on all tables
    - Creates comprehensive policies for each user role
*/

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent duplicates
DROP POLICY IF EXISTS "Anyone can read cook profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can read their own orders" ON orders;
DROP POLICY IF EXISTS "Cooks can read orders for their food" ON orders;
DROP POLICY IF EXISTS "Cooks can update orders for their food" ON orders;

DROP POLICY IF EXISTS "Customers can create order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can read order items for their orders" ON order_items;

DROP POLICY IF EXISTS "Anyone can read active menu items" ON menu_items;
DROP POLICY IF EXISTS "Cooks can manage their own menu items" ON menu_items;

-- Profile policies
CREATE POLICY "Anyone can read cook profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_cook = true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Order policies
CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can read their own orders"
ON orders FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Cooks can read orders for their food"
ON orders FOR SELECT
TO authenticated
USING (cook_id = auth.uid());

CREATE POLICY "Cooks can update orders for their food"
ON orders FOR UPDATE
TO authenticated
USING (cook_id = auth.uid());

-- Order items policies
CREATE POLICY "Customers can create order items for their orders"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

CREATE POLICY "Users can read order items for their orders"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR orders.cook_id = auth.uid())
  )
);

-- Menu items policies
CREATE POLICY "Anyone can read active menu items"
ON menu_items FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Cooks can manage their own menu items"
ON menu_items FOR ALL
TO authenticated
USING (cook_id = auth.uid())
WITH CHECK (cook_id = auth.uid());