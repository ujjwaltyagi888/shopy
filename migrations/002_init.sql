-- warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- inventory_reservations
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  consumed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

-- inventory_movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  change INT NOT NULL,
  reason TEXT,
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory
  ADD COLUMN warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  DROP COLUMN location_name;
