-- merchants
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT UNIQUE NOT NULL,
  shopify_access_token TEXT,
  business_name TEXT,
  contact_email TEXT,
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- products (your master catalogue)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hsn_code TEXT,
  gst_rate INT,
  price_paise BIGINT NOT NULL,
  weight_grams INT,
  dimensions JSONB,
  images JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- idempotency for webhook dedupe
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  warehouse_id UUID, -- Optional: links to a 'warehouses' table
  location_name TEXT, -- Or just a simple text location
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- merchant_listings (mapping your product → merchant's Shopify listing)
CREATE TABLE IF NOT EXISTS merchant_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  product_id UUID REFERENCES products(id),
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  retail_price_paise BIGINT NOT NULL,
  inventory_policy TEXT DEFAULT 'tracked',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (merchant_id, product_id)
);

-- orders (from Shopify)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,
  customer JSONB,
  shipping_address JSONB,
  billing_address JSONB,
  cod BOOLEAN DEFAULT FALSE,
  total_paise BIGINT,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (merchant_id, shopify_order_id)
);

-- order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  merchant_listing_id UUID REFERENCES merchant_listings(id),
  quantity INT NOT NULL,
  unit_price_paise BIGINT NOT NULL
);

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT,
  awb TEXT,
  label_url TEXT,
  tracking_url TEXT,
  status TEXT,
  rto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, awb)
);
