/*
  # Initial Database Schema Setup

  1. Tables Created
    - `profiles` - User profile information
    - `orders` - Order management
    - `order_items` - Individual items within orders  
    - `menu_items` - Menu items created by cooks

  2. Enums Created
    - `order_status` - Order status tracking
    - `meal_type` - Meal categorization

  3. Security
    - Row Level Security enabled on all tables
    - Appropriate policies for data access
*/

-- Create enum for order status
CREATE TYPE order_status AS ENUM (
  'confirmed',
  'preparing', 
  'ready',
  'picked_up',
  'delivered',
  'cancelled'
);

-- Create enum for meal types
CREATE TYPE meal_type AS ENUM (
  'breakfast',
  'lunch', 
  'dinner'
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  is_cook boolean DEFAULT false,
  address text,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cook_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status order_status DEFAULT 'confirmed',
  total_amount numeric(10,2) NOT NULL,
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
  price numeric(10,2) NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  special_instructions text
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image text,
  meal_type meal_type DEFAULT 'lunch',
  available_quantity integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read cook profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_cook = true);

-- Orders policies
CREATE POLICY "Customers can read their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Cooks can read orders for their food"
  ON orders FOR SELECT
  TO authenticated
  USING (cook_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Cooks can update orders for their food"
  ON orders FOR UPDATE
  TO authenticated
  USING (cook_id = auth.uid());

-- Order items policies
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    name,
    phone,
    is_cook,
    profile_image
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'is_cook')::boolean, false),
    CASE 
      WHEN COALESCE((NEW.raw_user_meta_data->>'is_cook')::boolean, false) = true 
      THEN 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      ELSE 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();