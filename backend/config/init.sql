-- Drop tables if they exist
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Add comments
COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON COLUMN users.id IS 'Primary key';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.email IS 'Unique email for account recovery';
COMMENT ON COLUMN users.password IS 'Hashed password';




CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    image_type VARCHAR(20) DEFAULT 'product', -- 'product', 'label', 'usage', 'certificate'
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    sub_category_id INTEGER REFERENCES sub_categories(id),
    
    -- Product Names (Multi-language)
    name_en VARCHAR(200) NOT NULL,
    name_hi VARCHAR(200),
    name_mr VARCHAR(200),
   
    
    -- Basic Info
    description TEXT
    technical_name VARCHAR(200), -- Chemical/scientific name
    brand VARCHAR(100),
    manufacturer VARCHAR(150),
    
    -- Pricing
    mrp DECIMAL(10, 2) NOT NULL, -- Maximum Retail Price
    selling_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) GENERATED ALWAYS AS 
        (CASE WHEN mrp > 0 THEN ((mrp - selling_price) * 100 / mrp) ELSE 0 END) STORED,
    
    -- Packaging
    pack_size VARCHAR(50) NOT NULL, -- '100ml', '1kg', '500gm'
    pack_type VARCHAR(50), -- 'bottle', 'pouch', 'bag'
    unit_per_pack INTEGER DEFAULT 1,
    
    -- Stock & SKU
    sku VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    minimum_order_quantity INTEGER DEFAULT 1,
    
 
    
    -- Crop Associations
    recommended_crops INTEGER[] DEFAULT '{}', -- Array of crop IDs
    
    -- Media
    primary_image_url VARCHAR(500),
    images JSONB, -- Array of image objects
    video_url VARCHAR(500),
    
 
    
    -- Ratings & Reviews
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
 
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'out_of_stock'
    is_prescription_required BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE sub_categories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100),
    name_mr VARCHAR(100),
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, slug)
);



CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100), -- Hindi name
    name_mr VARCHAR(100), -- Marathi name
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP



    CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  UNIQUE (country, state, city)
);

CREATE TABLE vendor_cities (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE
);

=









Super Admin Location Management 

-- Table to store country/state/city combinations
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  UNIQUE (country, state, city)
);

-- Table to store vendors (assuming vendor_profiles already exists)
-- This table links vendors to cities they operate in
CREATE TABLE vendor_cities (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE (vendor_id, city_id)  -- prevent duplicate links
);
