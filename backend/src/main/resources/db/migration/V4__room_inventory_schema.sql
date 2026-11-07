-- ==============================================================================
-- Flyway Migration: V4__room_inventory_schema.sql
-- Description: Room Types and Daily Room Inventory Calendar Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS room_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    max_adults INT NOT NULL DEFAULT 2,
    max_children INT NOT NULL DEFAULT 1,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_types_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_room_types_hotel ON room_types(hotel_id);

CREATE TABLE IF NOT EXISTS room_inventories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type_id BIGINT NOT NULL,
    inventory_date DATE NOT NULL,
    total_rooms INT NOT NULL,
    booked_rooms INT NOT NULL DEFAULT 0,
    available_rooms INT NOT NULL,
    price_override DECIMAL(10,2),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_inv_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    CONSTRAINT uq_room_date UNIQUE (room_type_id, inventory_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_room_inv_date ON room_inventories(inventory_date);
