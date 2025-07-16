-- users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    deleted_at DATETIME DEFAULT NULL
);

-- user_tokens table (for authentication tokens or sessions)
CREATE TABLE user_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- customer table
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50),
    fname VARCHAR(255),
    lname VARCHAR(255),
    addressline VARCHAR(255),
    town VARCHAR(255),
    zipcode VARCHAR(20),
    phone VARCHAR(50),
    image_path VARCHAR(255),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- item table
CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    sell_price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255)
);

-- product_images table (for multiple images per item)
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);

-- stock table
CREATE TABLE stock (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    quantity INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);

-- orderinfo table
CREATE TABLE orderinfo (
    orderinfo_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    date_placed DATETIME,
    date_shipped DATETIME,
    status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- orderline table
CREATE TABLE orderline (
    orderline_id INT AUTO_INCREMENT PRIMARY KEY,
    orderinfo_id INT,
    item_id INT,
    quantity INT NOT NULL,
    FOREIGN KEY (orderinfo_id) REFERENCES orderinfo(orderinfo_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);


-- Insert sample data into users
INSERT INTO users (name, password, email, role) VALUES
('John Doe', 'hashed_password_1', 'john@example.com', 'user'),
('Jane Smith', 'hashed_password_2', 'jane@example.com', 'admin');

-- Insert sample data into user_tokens
INSERT INTO user_tokens (user_id, token, created_at, expires_at) VALUES
(1, 'token_abc123', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY)),
(2, 'token_def456', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY));

-- Insert sample data into customer
INSERT INTO customer (title, fname, lname, addressline, town, zipcode, phone, image_path, user_id) VALUES
('Mr.', 'John', 'Doe', '123 Main St', 'Anytown', '12345', '555-1234', '/images/john.jpg', 1),
('Ms.', 'Jane', 'Smith', '456 Oak Ave', 'Othertown', '67890', '555-5678', '/images/jane.jpg', 2);

-- Insert sample data into item
INSERT INTO item (description, cost_price, sell_price, image) VALUES
('Running Shoes', 50.00, 75.00, '/images/running_shoes.jpg'),
('Casual Sneakers', 40.00, 60.00, '/images/casual_sneakers.jpg');

-- Insert sample data into product_images
INSERT INTO product_images (item_id, image_path) VALUES
(1, '/images/running_shoes_1.jpg'),
(1, '/images/running_shoes_2.jpg'),
(2, '/images/casual_sneakers_1.jpg');

-- Insert sample data into stock
INSERT INTO stock (item_id, quantity) VALUES
(1, 100),
(2, 150);

-- Insert sample data into orderinfo
INSERT INTO orderinfo (customer_id, date_placed, date_shipped, status) VALUES
(1, NOW(), NULL, 'Pending'),
(2, NOW(), NOW(), 'Shipped');

-- Insert sample data into orderline
INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES
(1, 1, 2),
(1, 2, 1),
(2, 2, 3);
