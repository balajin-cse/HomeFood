/*
  # Add Database Indexes for Performance

  1. Indexes Added
    - profiles: email index for faster lookups
    - orders: customer_id, cook_id, status indexes
    - order_items: order_id index for joins
    - menu_items: cook_id, meal_type, is_active indexes

  2. Performance Optimizations
    - Compound indexes for common query patterns
    - Partial indexes where appropriate
*/

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_cook ON profiles(is_cook) WHERE is_cook = true;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_cook_id ON orders(cook_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_food_id ON order_items(food_id);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_cook_id ON menu_items(cook_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_meal_type ON menu_items(meal_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON menu_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON menu_items(created_at DESC);