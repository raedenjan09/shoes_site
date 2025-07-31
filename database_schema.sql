-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 31, 2025 at 08:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shoes_site_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `fname` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `addressline` varchar(255) DEFAULT NULL,
  `town` varchar(255) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `title`, `fname`, `lname`, `addressline`, `town`, `zipcode`, `phone`, `image_path`, `user_id`) VALUES
(1, 'Mr.', 'John', 'Doe', '123 Main St', 'Anytown', '12345', '555-1234', '/images/john.jpg', 1),
(2, 'Ms.', 'Jane', 'Smith', '456 Oak Ave', 'Othertown', '67890', '555-5678', '/images/jane.jpg', 2),
(3, 'mr', 'raeden jan', 'duque', '43A UKRAINE ST. PINAGBUKLOD NEW LOWER BICUTAN TAGUIG CITY', 'taguig', '1632', '09927274737', '/images/fa91638f-c080-4a6e-9ae2-dedbca570d9a-1753754308732-775798807.jpg', 3),
(4, 'mr', 'raeden', 'duque', '43A UKRAINE ST. PINAGBUKLOD NEW LOWER BICUTAN TAGUIG CITY', 'taguig', '1632', '09927274737', '/images/resolution_2-1753754361981-522052876.png', 4);

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `item_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  `sell_price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`item_id`, `description`, `cost_price`, `sell_price`, `image`) VALUES
(1, 'Running Shoes', 50.00, 75.00, '/images/running_shoes.jpg'),
(2, 'Casual Sneakers', 40.00, 60.00, '/images/0e04ab56-e61f-42a8-8f13-ab05c98e36e4-1753754504165-845744086.jpg'),
(3, 'Nike Air Max 299', 900.00, 4000.00, '/images/0e04ab56-e61f-42a8-8f13-ab05c98e36e4-1753757030446-306128189.jpg'),
(4, 'Nike Air Max 299', 900.00, 4000.00, '/images/0e04ab56-e61f-42a8-8f13-ab05c98e36e4-1753757031719-672482586.jpg'),
(5, 'New Balance 670', 3000.00, 5000.00, '/images/ChatGPT Image Jul 22, 2025, 11_29_11 PM-1753935265570-277279387.png');

-- --------------------------------------------------------

--
-- Table structure for table `orderinfo`
--

CREATE TABLE `orderinfo` (
  `orderinfo_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `date_placed` datetime DEFAULT NULL,
  `date_shipped` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderinfo`
--

INSERT INTO `orderinfo` (`orderinfo_id`, `customer_id`, `date_placed`, `date_shipped`, `status`) VALUES
(1, 1, '2025-07-29 09:57:21', '2025-07-31 11:41:34', 'delivered'),
(2, 2, '2025-07-29 09:57:21', '2025-07-31 11:20:42', 'delivered'),
(3, 3, '2025-07-31 11:05:18', '2025-07-31 11:18:06', 'delivered'),
(4, 3, '2025-07-31 11:29:04', '2025-07-31 11:45:33', 'delivered'),
(5, 3, '2025-07-31 11:52:15', NULL, 'processing'),
(6, 3, '2025-07-31 12:00:50', NULL, 'shipped'),
(7, 3, '2025-07-31 12:09:41', '2025-07-31 12:41:14', 'delivered'),
(8, 3, '2025-07-31 12:39:50', '2025-07-31 13:06:54', 'delivered'),
(9, 3, '2025-07-31 13:28:55', NULL, 'shipped'),
(10, 3, '2025-07-31 13:32:17', '2025-07-31 13:53:27', 'delivered'),
(11, 3, '2025-07-31 13:58:53', NULL, 'processing');

-- --------------------------------------------------------

--
-- Table structure for table `orderline`
--

CREATE TABLE `orderline` (
  `orderline_id` int(11) NOT NULL,
  `orderinfo_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderline`
--

INSERT INTO `orderline` (`orderline_id`, `orderinfo_id`, `item_id`, `quantity`) VALUES
(1, 1, 1, 2),
(2, 1, 2, 1),
(3, 2, 2, 3),
(4, 3, 2, 1),
(5, 3, 4, 2),
(6, 4, 3, 1),
(7, 5, 3, 2),
(8, 6, 3, 3),
(9, 7, 2, 2),
(10, 8, 3, 2),
(11, 9, 2, 1),
(12, 10, 4, 2),
(13, 11, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `image_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`image_id`, `item_id`, `image_path`) VALUES
(1, 1, '/images/running_shoes_1.jpg'),
(2, 1, '/images/running_shoes_2.jpg'),
(3, 2, '/images/casual_sneakers_1.jpg'),
(4, 2, '/images/resolution_2-1753754504173-155424891.png'),
(5, 2, '/images/ChatGPT Image Jul 22, 2025, 11_29_11 PM-1753754504249-226996991.png'),
(6, 2, '/images/mental-1753754504383-502141668.jpg'),
(7, 2, '/images/ChatGPT Image Jul 22, 2025, 10_41_07 PM-1753754504391-281036853.png'),
(8, 3, '/images/ChatGPT Image Jul 22, 2025, 11_29_11 PM-1753757030456-555688904.png'),
(9, 3, '/images/mental-1753757030721-15297146.jpg'),
(10, 3, '/images/ChatGPT Image Jul 22, 2025, 10_41_07 PM-1753757030742-687029616.png'),
(11, 3, '/images/remove the hand writ-1753757030873-60673194.png'),
(12, 3, '/images/ChatGPT Image Jul 22, 2025, 01_09_55 AM-1753757031005-433071710.png'),
(13, 4, '/images/ChatGPT Image Jul 22, 2025, 11_29_11 PM-1753757031744-909042974.png'),
(14, 4, '/images/mental-1753757032791-751131716.jpg'),
(15, 4, '/images/ChatGPT Image Jul 22, 2025, 10_41_07 PM-1753757032828-738309215.png'),
(16, 4, '/images/remove the hand writ-1753757033089-128553553.png'),
(17, 4, '/images/ChatGPT Image Jul 22, 2025, 01_09_55 AM-1753757033421-572673566.png'),
(18, 5, '/images/mental-1753935265662-768819997.jpg'),
(19, 5, '/images/remove the hand writ-1753935265677-245447366.png'),
(20, 5, '/images/a living room scene -1753935265775-573730994.png'),
(21, 5, '/images/A split photo_ one s-1753935265842-302748070.png');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `orderinfo_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `user_id`, `item_id`, `orderinfo_id`, `rating`, `comment`, `created_at`) VALUES
(1, 3, 2, 3, 5, 'nice product', '2025-07-31 11:28:19'),
(2, 3, 4, 3, 5, 'nice', '2025-07-31 11:28:40');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`stock_id`, `item_id`, `quantity`) VALUES
(1, 1, 100),
(2, 2, 148),
(3, 3, 56),
(4, 4, 54),
(5, 5, 50);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `current_token` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `email`, `role`, `current_token`, `deleted_at`) VALUES
(1, 'John Doe', 'hashed_password_1', 'john@example.com', 'user', NULL, NULL),
(2, 'Jane Smith', 'hashed_password_2', 'jane@example.com', 'admin', NULL, NULL),
(3, 'raeden jan duque', '$2b$10$IB2nydUPD3G5VpFowQXZ3e6GxQwGSkARhjI60zdkPTH1zQ33VqlIK', 'raedenjanduque12@gmail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6InVzZXIiLCJpYXQiOjE3NTM5MzEwNjMsImV4cCI6MTc1NDAxNzQ2M30.o7xhtBpsRMTkffZ_Y69jUA4hO7MFKBDf3uDYZnURI8g', NULL),
(4, 'raeden duque', '$2b$10$A4PcXTDXngPzcAKtGPtyiOeXRC4K5UwUCVGQLJifxOucioVtiLbtG', 'admin@example.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzOTQxMzUxLCJleHAiOjE3NTQwMjc3NTF9.z4oh3rvoXmpPASXtmeTMfyT8f4HqmkU-MNtvWks1L0o', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `token_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(512) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`token_id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(9, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6InVzZXIiLCJpYXQiOjE3NTM5MzEwNjMsImV4cCI6MTc1NDAxNzQ2M30.o7xhtBpsRMTkffZ_Y69jUA4hO7MFKBDf3uDYZnURI8g', '2025-07-31 11:04:23', '2025-08-01 11:04:23'),
(11, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzOTQxMzUxLCJleHAiOjE3NTQwMjc3NTF9.z4oh3rvoXmpPASXtmeTMfyT8f4HqmkU-MNtvWks1L0o', '2025-07-31 13:55:51', '2025-08-01 13:55:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `orderinfo`
--
ALTER TABLE `orderinfo`
  ADD PRIMARY KEY (`orderinfo_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `orderline`
--
ALTER TABLE `orderline`
  ADD PRIMARY KEY (`orderline_id`),
  ADD KEY `orderinfo_id` (`orderinfo_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `orderinfo_id` (`orderinfo_id`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_current_token` (`current_token`(255));

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orderinfo`
--
ALTER TABLE `orderinfo`
  MODIFY `orderinfo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `orderline`
--
ALTER TABLE `orderline`
  MODIFY `orderline_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orderinfo`
--
ALTER TABLE `orderinfo`
  ADD CONSTRAINT `orderinfo_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);

--
-- Constraints for table `orderline`
--
ALTER TABLE `orderline`
  ADD CONSTRAINT `orderline_ibfk_1` FOREIGN KEY (`orderinfo_id`) REFERENCES `orderinfo` (`orderinfo_id`),
  ADD CONSTRAINT `orderline_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`orderinfo_id`) REFERENCES `orderinfo` (`orderinfo_id`);

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`);

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
