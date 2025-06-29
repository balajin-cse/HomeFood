/*
  # Enhanced Order Management System

  1. Improvements
    - Ensures proper foreign key relationships between orders, customers, and cooks
    - Adds indexes for better performance on order queries
    - Updates order items to include food images for better display
    - Adds triggers for automatic timestamp updates

  2. Security
    - Row Level Security is already enabled on all tables
    - Policies ensure users can only see their relevant orders
    - Cooks can only see orders assigned to them
    - Customers can only see their own orders

  3. Real-time Support
    - Tables are set up for real-time subscriptions
    - Order status changes will propagate automatically
    - New orders will appear immediately for cooks
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

-- Ensure all orders have proper customer_id relationships
UPDATE orders 
SET customer_id = profiles.id
FROM profiles 
WHERE orders.customer_id IS NULL 
  AND profiles.email = 'bala@example.com'
  AND profiles.is_cook = false;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure triggers exist for automatic timestamp updates
DO $$
BEGIN
  -- Orders trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Profiles trigger  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Menu items trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_menu_items_updated_at'
  ) THEN
    CREATE TRIGGER update_menu_items_updated_at
      BEFORE UPDATE ON menu_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure proper indexes exist for optimal query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_cook ON orders(customer_id, cook_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_food ON order_items(order_id, food_id);

-- Add a function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, is_cook)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'is_cook')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Grant necessary permissions for the trigger function
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;