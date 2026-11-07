-- ==============================================================================
-- Flyway Migration: V3__hotel_and_amenity_schema.sql
-- Description: Hotel and Amenity Schema with Baseline Seed
-- ==============================================================================

CREATE TABLE IF NOT EXISTS amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_key VARCHAR(50),
    description VARCHAR(255),
    is_mystery_clue BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    manager_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    brand_chain VARCHAR(100),
    star_rating INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone_area VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotels_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hotels_manager ON hotels(manager_id);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_zone ON hotels(zone_area);
CREATE INDEX idx_hotels_verified ON hotels(is_verified);

CREATE TABLE IF NOT EXISTS hotel_amenities (
    hotel_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT fk_ha_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_ha_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-seed baseline amenities
INSERT INTO amenities (name, icon_key, description, is_mystery_clue) VALUES
('Free High-Speed WiFi', 'wifi', 'Complimentary ultra-fast wireless internet access throughout the property', TRUE),
('Rooftop Infinity Pool', 'waves', 'Panoramic temperature-controlled outdoor swimming pool', TRUE),
('Luxury Wellness Spa', 'sparkles', 'Full-service wellness center offering massages and hydrotherapy', TRUE),
('24/7 Fitness Center', 'dumbbell', 'State-of-the-art cardiovascular and strength training equipment', TRUE),
('Valet Parking', 'car', 'Complimentary on-site secured valet parking', TRUE),
('Fine Dining Restaurant', 'utensils', 'Award-winning in-house culinary dining experience', TRUE),
('Cocktail Lounge & Bar', 'wine', 'Craft cocktails and curated international wine selection', TRUE),
('Airport Shuttle Service', 'plane', 'Scheduled round-trip transportation to international airport', TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);
