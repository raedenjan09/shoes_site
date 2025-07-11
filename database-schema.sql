-- Shoes Site Database Schema
-- This file contains all the necessary tables for the shoes e-commerce application

-- Create database
CREATE DATABASE IF NOT EXISTS shoes_site_db;
USE shoes_site_db;

-- Users table - stores user authentication information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- MIGRATION: Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Update sample admin user to have role 'admin'
UPDATE users SET role = 'admin' WHERE email = 'admin@shoessite.com';

-- Customer table - stores customer profile information
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(10),
    fname VARCHAR(255),
    lname VARCHAR(255),
    addressline VARCHAR(255),
    town VARCHAR(255),
    zipcode VARCHAR(20),
    phone VARCHAR(20),
    image_path VARCHAR(500),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_customer (user_id)
);

-- Item table - stores product information
CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    sell_price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock table - stores inventory information
CREATE TABLE stock (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(item_id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_stock (item_id)
);

-- OrderInfo table - stores order header information
CREATE TABLE orderinfo (
    orderinfo_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    date_placed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_shipped TIMESTAMP NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);

-- OrderLine table - stores order line items
CREATE TABLE orderline (
    orderline_id INT AUTO_INCREMENT PRIMARY KEY,
    orderinfo_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderinfo_id) REFERENCES orderinfo(orderinfo_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES item(item_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_customer_user_id ON customer(user_id);
CREATE INDEX idx_item_description ON item(description);
CREATE INDEX idx_stock_item_id ON stock(item_id);
CREATE INDEX idx_orderinfo_customer_id ON orderinfo(customer_id);
CREATE INDEX idx_orderinfo_date_placed ON orderinfo(date_placed);
CREATE INDEX idx_orderline_orderinfo_id ON orderline(orderinfo_id);
CREATE INDEX idx_orderline_item_id ON orderline(item_id);

-- Insert sample data for testing

-- Sample users
INSERT INTO users (name, email, password) VALUES
('John Doe', 'john@example.com', '$2b$10$example_hashed_password_1'),
('Jane Smith', 'jane@example.com', '$2b$10$example_hashed_password_2'),
('Admin User', 'admin@shoessite.com', '$2b$10$example_hashed_password_3');

-- Sample customers
INSERT INTO customer (title, fname, lname, addressline, town, zipcode, phone, user_id) VALUES
('Mr.', 'John', 'Doe', '123 Main Street', 'Manila', '1000', '+63 912 345 6789', 1),
('Ms.', 'Jane', 'Smith', '456 Oak Avenue', 'Quezon City', '1100', '+63 923 456 7890', 2),
('Mr.', 'Admin', 'User', '789 Admin Road', 'Makati', '1200', '+63 934 567 8901', 3);

-- Sample items
INSERT INTO item (description, cost_price, sell_price, image) VALUES
('Nike Air Max 270', 2500.00, 3500.00, '/images/nike-air-max-270.jpg'),
('Adidas Ultraboost 21', 3000.00, 4200.00, '/images/adidas-ultraboost-21.jpg'),
('Puma RS-X', 1800.00, 2800.00, '/images/puma-rs-x.jpg'),
('Converse Chuck Taylor', 1200.00, 1800.00, '/images/converse-chuck-taylor.jpg'),
('Vans Old Skool', 1500.00, 2200.00, '/images/vans-old-skool.jpg'),
('New Balance 574', 2000.00, 3000.00, '/images/new-balance-574.jpg');

-- Sample stock
INSERT INTO stock (item_id, quantity) VALUES
(1, 50),
(2, 30),
(3, 45),
(4, 60),
(5, 40),
(6, 35);

-- Sample orders
INSERT INTO orderinfo (customer_id, date_placed, date_shipped, status) VALUES
(1, '2024-01-15 10:30:00', '2024-01-16 14:20:00', 'shipped'),
(2, '2024-01-20 15:45:00', NULL, 'processing'),
(1, '2024-02-01 09:15:00', NULL, 'pending');

-- Sample order lines
INSERT INTO orderline (orderinfo_id, item_id, quantity, unit_price) VALUES
(1, 1, 2, 3500.00),
(1, 3, 1, 2800.00),
(2, 2, 1, 4200.00),
(2, 4, 2, 1800.00),
(3, 5, 1, 2200.00),
(3, 6, 1, 3000.00);

-- Create a view for item details with stock
CREATE VIEW item_with_stock AS
SELECT 
    i.item_id,
    i.description,
    i.cost_price,
    i.sell_price,
    i.image,
    COALESCE(s.quantity, 0) as quantity,
    i.created_at,
    i.updated_at
FROM item i
LEFT JOIN stock s ON i.item_id = s.item_id;

-- Create a view for order details
CREATE VIEW order_details AS
SELECT 
    oi.orderinfo_id,
    oi.customer_id,
    CONCAT(c.fname, ' ', c.lname) as customer_name,
    c.email,
    oi.date_placed,
    oi.date_shipped,
    oi.status,
    ol.orderline_id,
    ol.item_id,
    i.description as item_description,
    ol.quantity,
    ol.unit_price,
    (ol.quantity * ol.unit_price) as line_total
FROM orderinfo oi
JOIN customer c ON oi.customer_id = c.customer_id
JOIN orderline ol ON oi.orderinfo_id = ol.orderinfo_id
JOIN item i ON ol.item_id = i.item_id;

-- Create a view for sales summary
CREATE VIEW sales_summary AS
SELECT 
    DATE_FORMAT(oi.date_placed, '%Y-%m') as month,
    COUNT(DISTINCT oi.orderinfo_id) as total_orders,
    SUM(ol.quantity) as total_items_sold,
    SUM(ol.quantity * ol.unit_price) as total_revenue
FROM orderinfo oi
JOIN orderline ol ON oi.orderinfo_id = ol.orderinfo_id
WHERE oi.status != 'cancelled'
GROUP BY DATE_FORMAT(oi.date_placed, '%Y-%m')
ORDER BY month DESC; 