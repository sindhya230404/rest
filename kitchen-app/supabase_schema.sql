-- ==============================================================================
-- RESTAURANT MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS SETUP
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ------------------------------------------------------------------------------
-- TABLE: employees
-- ------------------------------------------------------------------------------
CREATE TABLE employees (
  id TEXT PRIMARY KEY DEFAULT 'emp_' || gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen_staff', 'receptionist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: suppliers
-- ------------------------------------------------------------------------------
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY DEFAULT 'sup_' || gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  sku_count INT DEFAULT 12,
  vendor_status TEXT DEFAULT 'Active Vendor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: ingredients
-- ------------------------------------------------------------------------------
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY DEFAULT 'ing_' || gen_random_uuid(),
  ingredient TEXT NOT NULL,
  supplier TEXT,
  stock INT NOT NULL DEFAULT 0,
  level TEXT DEFAULT 'Normal',
  expiry_status TEXT DEFAULT 'Fresh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: customers
-- ------------------------------------------------------------------------------
CREATE TABLE customers (
  id TEXT PRIMARY KEY DEFAULT 'cu_' || gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: menu_categories
-- ------------------------------------------------------------------------------
CREATE TABLE menu_categories (
  id TEXT PRIMARY KEY DEFAULT 'cat_' || gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT
);

-- ------------------------------------------------------------------------------
-- TABLE: menu_items
-- ------------------------------------------------------------------------------
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY DEFAULT 'item_' || gen_random_uuid(),
  category_id TEXT REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  preparation_time INT DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: tables
-- ------------------------------------------------------------------------------
CREATE TABLE tables (
  id TEXT PRIMARY KEY DEFAULT 'tbl_' || gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  location TEXT DEFAULT 'Main Dining',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: orders
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT 'ord_' || gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  table_number INT,
  item JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  payment TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment IN ('paid', 'unpaid', 'refunded', 'pending')),
  order_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: invoices
-- ------------------------------------------------------------------------------
CREATE TABLE invoices (
  id TEXT PRIMARY KEY DEFAULT 'inv_' || gen_random_uuid(),
  transition TEXT,
  invoice TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'Cash',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: activities
-- ------------------------------------------------------------------------------
CREATE TABLE activities (
  id TEXT PRIMARY KEY DEFAULT 'act_' || gen_random_uuid(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif_' || gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: purchase_orders
-- ------------------------------------------------------------------------------
CREATE TABLE purchase_orders (
  id TEXT PRIMARY KEY DEFAULT 'po_' || gen_random_uuid(),
  supplier TEXT NOT NULL,
  items INT NOT NULL DEFAULT 1,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  date TEXT DEFAULT 'Today',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Permissive read/write policies for authenticated and anon clients (allows operational testing & role flexibility)
CREATE POLICY "Allow public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public write employees" ON employees FOR ALL USING (true);

CREATE POLICY "Allow public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public write suppliers" ON suppliers FOR ALL USING (true);

CREATE POLICY "Allow public read purchase_orders" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public write purchase_orders" ON purchase_orders FOR ALL USING (true);

CREATE POLICY "Allow public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public write ingredients" ON ingredients FOR ALL USING (true);

CREATE POLICY "Allow public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public write customers" ON customers FOR ALL USING (true);

CREATE POLICY "Allow public read menu_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow public write menu_categories" ON menu_categories FOR ALL USING (true);

CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public write menu_items" ON menu_items FOR ALL USING (true);

CREATE POLICY "Allow public read tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow public write tables" ON tables FOR ALL USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public write orders" ON orders FOR ALL USING (true);

CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write invoices" ON invoices FOR ALL USING (true);

CREATE POLICY "Allow public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public write activities" ON activities FOR ALL USING (true);

CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public write notifications" ON notifications FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- SUPABASE REALTIME PUBLICATION
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- ------------------------------------------------------------------------------
-- SEED INITIAL DATA
-- ------------------------------------------------------------------------------

INSERT INTO employees (id, name, email, phone, role, address) VALUES
  ('emp_1', 'Elena Rostova', 'elena@savory.com', '+1 415 555 0101', 'owner', '123 Main St, San Francisco, CA'),
  ('emp_2', 'Marcus Vance', 'marcus@savory.com', '+1 415 555 0102', 'manager', '456 Market St, San Francisco, CA'),
  ('emp_3', 'Sophia Lin', 'sophia@savory.com', '+1 415 555 0103', 'cashier', '789 Mission St, San Francisco, CA'),
  ('emp_4', 'Chef Antoine Dubois', 'antoine@savory.com', '+1 415 555 0104', 'kitchen_staff', '101 Howard St, San Francisco, CA'),
  ('emp_5', 'Carlos Gomez', 'carlos@savory.com', '+1 415 555 0105', 'waiter', '202 Folsom St, San Francisco, CA');

INSERT INTO customers (id, name, email, phone, address) VALUES
  ('cu_1', 'Amelia Chen', 'amelia@example.com', '+1 415 555 0123', '742 Evergreen Terrace'),
  ('cu_2', 'Jonah Patel', 'jonah@example.com', '+1 415 555 0141', '1088 Ocean Ave'),
  ('cu_3', 'Priya Sharma', 'priya@example.com', '+1 415 555 0187', '55 California St'),
  ('cu_4', 'Diego Alvarez', 'diego@example.com', '+1 415 555 0192', '321 Valencia St'),
  ('cu_5', 'Nora Kim', 'nora@example.com', '+1 415 555 0155', '888 Brannan St'),
  ('cu_6', 'Lucas Wright', 'lucas@example.com', '+1 415 555 0166', '404 Geary St');

INSERT INTO suppliers (id, name, phone, email, address) VALUES
  ('sup_1', 'Golden Gate Produce Co.', '+1 415 555 0190', 'orders@ggproduce.com', 'San Francisco Wholesale Market'),
  ('sup_2', 'Pacific Seafood Distributors', '+1 415 555 0191', 'sales@pacseafood.com', 'Pier 45, San Francisco'),
  ('sup_3', 'Artisanal Meats & Butchery', '+1 510 555 0192', 'info@artisanalmeats.com', 'Oakland, CA'),
  ('sup_4', 'Napa Valley Dairy & Cheese', '+1 707 555 0193', 'orders@napadairy.com', 'Napa, CA');

INSERT INTO ingredients (id, ingredient, supplier, stock, level, expiry_status) VALUES
  ('ing_1', 'Wagyu Beef Ribeye', 'Artisanal Meats & Butchery', 18, 'Normal', 'Fresh'),
  ('ing_2', 'Atlantic Salmon Fillet', 'Pacific Seafood Distributors', 24, 'Normal', 'Fresh'),
  ('ing_3', 'Truffle Butter', 'Napa Valley Dairy & Cheese', 5, 'Low Stock', 'Expiring Soon'),
  ('ing_4', 'Heirloom Tomatoes', 'Golden Gate Produce Co.', 42, 'Normal', 'Fresh'),
  ('ing_5', 'Wild Mushrooms', 'Golden Gate Produce Co.', 8, 'Low Stock', 'Fresh'),
  ('ing_6', 'Heavy Cream', 'Napa Valley Dairy & Cheese', 15, 'Normal', 'Fresh');

INSERT INTO menu_categories (id, name, icon) VALUES
  ('cat_1', 'Starters', 'Utensils'),
  ('cat_2', 'Mains', 'Beef'),
  ('cat_3', 'Desserts', 'Cake'),
  ('cat_4', 'Beverages', 'Wine');

INSERT INTO menu_items (id, category_id, name, description, image, price, available, preparation_time) VALUES
  ('item_1', 'cat_1', 'Truffle Arancini', 'Crispy risotto balls with black truffle and mozzarella', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop', 16.50, true, 12),
  ('item_2', 'cat_2', 'Pan-Seared Salmon', 'Atlantic salmon with asparagus and lemon butter sauce', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop', 34.00, true, 20),
  ('item_3', 'cat_2', 'Wagyu Ribeye Steak', '10oz Wagyu with garlic butter and rosemary fries', 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop', 58.00, true, 25),
  ('item_4', 'cat_3', 'Chocolate Lava Cake', 'Warm molten chocolate cake with vanilla bean ice cream', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop', 14.00, true, 15);

INSERT INTO tables (id, table_number, capacity, status, location) VALUES
  ('tbl_1', 1, 2, 'occupied', 'Main Dining'),
  ('tbl_2', 2, 2, 'available', 'Main Dining'),
  ('tbl_3', 3, 4, 'occupied', 'Main Dining'),
  ('tbl_4', 4, 4, 'available', 'Main Dining'),
  ('tbl_5', 5, 6, 'reserved', 'VIP Lounge'),
  ('tbl_6', 6, 8, 'available', 'Patio');

INSERT INTO orders (id, order_id, customer, table_number, item, total, status, payment, order_time) VALUES
  ('ord_101', 'ORD-101', 'Amelia Chen', 3, '[{"name": "Wagyu Ribeye Steak", "qty": 2, "price": 58.0}, {"name": "Chocolate Lava Cake", "qty": 1, "price": 14.0}]'::jsonb, 130.00, 'preparing', 'unpaid', NOW() - INTERVAL '15 minutes'),
  ('ord_102', 'ORD-102', 'Jonah Patel', 1, '[{"name": "Pan-Seared Salmon", "qty": 1, "price": 34.0}, {"name": "Truffle Arancini", "qty": 1, "price": 16.5}]'::jsonb, 50.50, 'ready', 'unpaid', NOW() - INTERVAL '25 minutes'),
  ('ord_103', 'ORD-103', 'Priya Sharma', 5, '[{"name": "Truffle Arancini", "qty": 2, "price": 16.5}]'::jsonb, 33.00, 'completed', 'paid', NOW() - INTERVAL '45 minutes');

INSERT INTO invoices (id, transition, invoice, customer, method, date, amount, status) VALUES
  ('inv_1', 'TR-9001', 'INV-2026-001', 'Amelia Chen', 'Credit Card', NOW() - INTERVAL '2 hours', 130.00, 'unpaid'),
  ('inv_2', 'TR-9002', 'INV-2026-002', 'Priya Sharma', 'Cash', NOW() - INTERVAL '1 hour', 33.00, 'paid');

INSERT INTO notifications (id, title, message, type, read) VALUES
  ('notif_1', 'Low Stock Alert', 'Truffle Butter is below threshold (5 units remaining).', 'warning', false),
  ('notif_2', 'Order Ready', 'Table 1 (ORD-102) is ready for pickup.', 'info', false);

INSERT INTO activities (id, "user", action, description) VALUES
  ('act_1', 'Elena Rostova', 'Updated Menu', 'Changed Wagyu Ribeye price to $58.00'),
  ('act_2', 'Carlos Gomez', 'Created Order', 'Created order ORD-101 for Table 3');
