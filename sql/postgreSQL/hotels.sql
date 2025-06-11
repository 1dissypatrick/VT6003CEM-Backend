CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  availability JSONB NOT NULL,
  amenities JSONB NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  created_by INTEGER NOT NULL REFERENCES users(id)
);