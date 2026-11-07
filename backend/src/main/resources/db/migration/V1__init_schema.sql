-- ==============================================================================
-- Flyway Migration: V1__init_schema.sql
-- Description: MysteryStay Baseline Schema and Infrastructure Verification
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    component_name VARCHAR(100) NOT NULL UNIQUE,
    component_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO app_metadata (component_name, component_version, status)
VALUES ('mysterystay-core', '1.0.0-PHASE1', 'OPERATIONAL')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
