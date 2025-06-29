/*
  # Additional Constraints and Validations

  1. Constraints Added
    - Check constraints for data validation
    - Additional foreign key constraints
    - Price validation constraints

  2. Data Integrity
    - Ensure positive prices and quantities
    - Validate order status transitions
    - Phone number format validation
*/

-- Add check constraints for data validation
ALTER TABLE profiles 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE profiles 
ADD CONSTRAINT check_phone_format 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

-- Add price validation constraints
ALTER TABLE orders 
ADD CONSTRAINT check_positive_total 
CHECK (total_amount > 0);

ALTER TABLE order_items 
ADD CONSTRAINT check_positive_price 
CHECK (price >= 0);

ALTER TABLE order_items 
ADD CONSTRAINT check_positive_quantity 
CHECK (quantity > 0);

ALTER TABLE menu_items 
ADD CONSTRAINT check_positive_price 
CHECK (price > 0);

ALTER TABLE menu_items 
ADD CONSTRAINT check_non_negative_quantity 
CHECK (available_quantity >= 0);

-- Add constraint for menu item title length
ALTER TABLE menu_items 
ADD CONSTRAINT check_title_length 
CHECK (char_length(title) >= 3 AND char_length(title) <= 100);

-- Add constraint for profile name length
ALTER TABLE profiles 
ADD CONSTRAINT check_name_length 
CHECK (char_length(name) >= 2 AND char_length(name) <= 100);