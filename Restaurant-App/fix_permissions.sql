-- ==============================================================================
-- 1-CLICK COMPLETE SETUP & PERMISSION FIX FOR SUPABASE (FAILSAFE)
-- Copy and paste this ENTIRE script into Supabase Dashboard -> SQL Editor and click RUN
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure all tables exist (CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY DEFAULT 'emp_' || gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen_staff', 'receptionist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY DEFAULT 'sup_' || gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  sku_count INT DEFAULT 12,
  vendor_status TEXT DEFAULT 'Active Vendor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY DEFAULT 'ing_' || gen_random_uuid(),
  ingredient TEXT NOT NULL,
  supplier TEXT,
  stock INT NOT NULL DEFAULT 0,
  level TEXT DEFAULT 'Normal',
  expiry_status TEXT DEFAULT 'Fresh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT 'cu_' || gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY DEFAULT 'cat_' || gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
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

CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY DEFAULT 'tbl_' || gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  location TEXT DEFAULT 'Main Dining',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
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

CREATE TABLE IF NOT EXISTS invoices (
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

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif_' || gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY DEFAULT 'po_' || gen_random_uuid(),
  supplier TEXT NOT NULL,
  items INT NOT NULL DEFAULT 1,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  date TEXT DEFAULT 'Today',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Grant full table, sequence, and function privileges to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 4. Enable RLS & Drop existing policies to prevent conflicts
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow anon all on orders" ON orders;
DROP POLICY IF EXISTS "Allow anon all on employees" ON employees;
DROP POLICY IF EXISTS "Allow anon all on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow anon all on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow anon all on customers" ON customers;
DROP POLICY IF EXISTS "Allow anon all on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow anon all on tables" ON tables;
DROP POLICY IF EXISTS "Allow anon all on ingredients" ON ingredients;
DROP POLICY IF EXISTS "Allow anon all on notifications" ON notifications;

-- 5. Create permissive policies for all tables
CREATE POLICY "Allow anon all on menu_items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on employees" ON employees FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on suppliers" ON suppliers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on purchase_orders" ON purchase_orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on customers" ON customers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on invoices" ON invoices FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on tables" ON tables FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on ingredients" ON ingredients FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on notifications" ON notifications FOR ALL TO public USING (true) WITH CHECK (true);
