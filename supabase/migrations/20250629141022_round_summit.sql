/*
  # Add order status update trigger

  1. New Functions
    - update_order_status_trigger: Function to handle timestamp updates for order status changes
    
  2. New Triggers
    - order_status_update_trigger: Trigger that runs on order status updates
    
  3. Changes
    - Adds automatic timestamp recording for status updates
    - Adds actual_delivery_time setting when status changes to 'delivered'
*/

-- Create a function to handle order status updates
CREATE OR REPLACE FUNCTION update_order_status() RETURNS TRIGGER AS $$
BEGIN
  -- Record the update time
  NEW.updated_at := now();
  
  -- If status changed to delivered, set the actual delivery time
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.actual_delivery_time := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for order status updates
DROP TRIGGER IF EXISTS order_status_update_trigger ON orders;
CREATE TRIGGER order_status_update_trigger
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_status();