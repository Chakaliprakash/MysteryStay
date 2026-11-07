-- V8: Add payment method and UPI fields to payments table
ALTER TABLE payments ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY';
ALTER TABLE payments ADD COLUMN upi_vpa VARCHAR(100) NULL;
ALTER TABLE payments ADD COLUMN upi_transaction_id VARCHAR(100) NULL;
CREATE INDEX idx_payments_method ON payments (payment_method);
