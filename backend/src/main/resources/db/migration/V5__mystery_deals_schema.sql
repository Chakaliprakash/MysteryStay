-- ==============================================================================
-- Flyway Migration: V5__mystery_deals_schema.sql
-- Description: Mystery Deals Schema with Identity Masking Constraints
-- ==============================================================================

CREATE TABLE IF NOT EXISTS mystery_deals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type_id BIGINT NOT NULL,
    mystery_title VARCHAR(150) NOT NULL,
    description_clues TEXT NOT NULL,
    discount_percent INT NOT NULL,
    mystery_price DECIMAL(10,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deals_room_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    CONSTRAINT chk_discount_range CHECK (discount_percent >= 10 AND discount_percent <= 80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_deals_active ON mystery_deals(is_active);
CREATE INDEX idx_deals_dates ON mystery_deals(valid_from, valid_to);
