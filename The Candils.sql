-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Nov 05, 2025 at 10:36 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `the_candils`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkout` (IN `p_cartSessionId` VARCHAR(255), IN `p_pesananId` INT)   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Checkout failed';
    END;
    
    START TRANSACTION;
    
    -- Insert detail pemesanan dari keranjang item
    INSERT INTO `Detail Pemesanan` (
        pesananId,
        produkId,
        ukuranId,
        jumlah,
        hargaSaatBeli,
        subtotal
    )
    SELECT 
        p_pesananId,
        ki.produkId,
        ki.ukuranId,
        ki.jumlah,
        (ki.subtotal / ki.jumlah) as hargaSaatBeli,
        ki.subtotal
    FROM `Keranjang Item` ki
    WHERE ki.cartSessionId = p_cartSessionId;
    
    -- Clear cart
    DELETE FROM `Keranjang Item` WHERE cartSessionId = p_cartSessionId;
    DELETE FROM Keranjang WHERE cartSessionId = p_cartSessionId;
    
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `hapusItem` (IN `p_keranjangItemId` INT)   BEGIN
    DELETE FROM `Keranjang Item` 
    WHERE keranjangItemId = p_keranjangItemId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `mergeGuestCartToUser` (IN `p_guestSessionId` VARCHAR(255), IN `p_userSessionId` VARCHAR(255))   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Merge cart failed';
    END;
    
    START TRANSACTION;
    
    -- Create user cart if not exists
    INSERT IGNORE INTO Keranjang (cartSessionId, createdAt) 
    VALUES (p_userSessionId, CURDATE());
    
    -- Move guest cart items to user cart
    UPDATE `Keranjang Item`
    SET cartSessionId = p_userSessionId
    WHERE cartSessionId = p_guestSessionId;
    
    -- Delete guest cart
    DELETE FROM Keranjang WHERE cartSessionId = p_guestSessionId;
    
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `tambahItem` (IN `p_cartSessionId` VARCHAR(255), IN `p_produkId` INT, IN `p_ukuranId` INT, IN `p_jumlah` INT)   BEGIN
    -- Deklarasi variabel (Sudah Benar)
    DECLARE v_harga_dasar DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_harga_tambahan DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_harga_satuan DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_subtotal DECIMAL(10, 2) DEFAULT 0;
    
    -- 1. Ambil harga dasar (hargaUnit)
    SELECT IFNULL(hargaUnit, 0) INTO v_harga_dasar
    FROM Produk
    WHERE produkId = p_produkId;
    
    -- 2. Ambil harga tambahan (jika ada)
    IF p_ukuranId IS NOT NULL THEN
        SELECT IFNULL(hargaTambahan, 0) INTO v_harga_tambahan
        FROM Ukuran
        WHERE ukuranId = p_ukuranId;
    ELSE
        SET v_harga_tambahan = 0;
    END IF;
    
    -- 3. Hitung harga satuan dan subtotal (Sudah Benar)
    SET v_harga_satuan = v_harga_dasar + v_harga_tambahan;
    SET v_subtotal = v_harga_satuan * p_jumlah;
    
    -- 4. Buat keranjang jika belum ada (Sudah Benar)
    INSERT IGNORE INTO Keranjang (cartSessionId, createdAt) 
    VALUES (p_cartSessionId, CURDATE());
    
    -- [PERBAIKAN DI SINI]
    -- Hapus 'harga_satuan' dari daftar INSERT
    INSERT INTO `Keranjang Item` (
        cartSessionId, 
        produkId, 
        ukuranId, 
        jumlah, 
        subtotal  -- 'harga_satuan' telah dihapus dari sini
    )
    VALUES (
        p_cartSessionId, 
        p_produkId, 
        p_ukuranId, 
        p_jumlah, 
        v_subtotal      -- Hanya simpan subtotal
    )
    -- Logika update (Sudah Benar)
    ON DUPLICATE KEY UPDATE
        jumlah = `Keranjang Item`.jumlah + VALUES(jumlah),
        subtotal = `Keranjang Item`.subtotal + VALUES(subtotal);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `DetailPemesanan`
--

CREATE TABLE `DetailPemesanan` (
  `detailPemesananId` int NOT NULL,
  `pesananId` int NOT NULL,
  `produkId` int NOT NULL,
  `ukuranId` int NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `DetailPemesanan`
--

INSERT INTO `DetailPemesanan` (`detailPemesananId`, `pesananId`, `produkId`, `ukuranId`, `quantity`, `subtotal`) VALUES
(4, 7, 3, 17, 2, 20000.00),
(5, 7, 3, 17, 1, 5000.00),
(6, 8, 3, 17, 1, 20000.00),
(7, 9, 3, 18, 1, 25000.00),
(8, 10, 3, 18, 1, 25000.00);

-- --------------------------------------------------------

--
-- Table structure for table `Keranjang`
--

CREATE TABLE `Keranjang` (
  `cartSessionId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Keranjang`
--

INSERT INTO `Keranjang` (`cartSessionId`, `createdAt`) VALUES
('sesi_postman_tes_001', '2025-11-02'),
('session_1762069509230_5xtl1c98v5n', '2025-11-02');

-- --------------------------------------------------------

--
-- Table structure for table `Keranjang Item`
--

CREATE TABLE `Keranjang Item` (
  `keranjangItemId` int NOT NULL,
  `cartSessionId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produkId` int NOT NULL,
  `ukuranId` int DEFAULT NULL,
  `jumlah` int NOT NULL DEFAULT '1',
  `subtotal` float NOT NULL DEFAULT '0'
) ;

--
-- Dumping data for table `Keranjang Item`
--

INSERT INTO `Keranjang Item` (`keranjangItemId`, `cartSessionId`, `produkId`, `ukuranId`, `jumlah`, `subtotal`) VALUES
(20, 'session_1762069509230_5xtl1c98v5n', 3, 17, 1, 20000);

-- --------------------------------------------------------

--
-- Table structure for table `Lokasi`
--

CREATE TABLE `Lokasi` (
  `lokasiId` int NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Lokasi`
--

INSERT INTO `Lokasi` (`lokasiId`, `name`) VALUES
(1, 'Ciputat'),
(2, 'Bukit Indah'),
(3, 'Pamulang');

-- --------------------------------------------------------

--
-- Table structure for table `Pemesanan`
--

CREATE TABLE `Pemesanan` (
  `pesananId` int NOT NULL,
  `lokasiId` int DEFAULT NULL,
  `namaPelanggan` varchar(255) NOT NULL,
  `alamatPengiriman` text NOT NULL,
  `kontakPelanggan` varchar(25) NOT NULL,
  `tanggalPesanan` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `buktiPembayaranUrl` varchar(255) DEFAULT NULL,
  `biayaPengiriman` decimal(10,2) DEFAULT '0.00',
  `totalHarga` decimal(10,2) NOT NULL,
  `statusPesanan` enum('Perlu Dikirim','Selesai','Dibatalkan') NOT NULL DEFAULT 'Perlu Dikirim',
  `tipePesanan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Pemesanan`
--

INSERT INTO `Pemesanan` (`pesananId`, `lokasiId`, `namaPelanggan`, `alamatPengiriman`, `kontakPelanggan`, `tanggalPesanan`, `buktiPembayaranUrl`, `biayaPengiriman`, `totalHarga`, `statusPesanan`, `tipePesanan`) VALUES
(2, 1, 'Pelanggan Simulasi', 'Jalan Uji Coba No. 123', '081234567890', '2025-11-01 12:28:12', NULL, 0.00, 150000.00, 'Perlu Dikirim', NULL),
(3, 1, 'Pelanggan Simulasi', 'Jalan Uji Coba No. 123', '081234567890', '2025-11-01 12:30:44', NULL, 0.00, 150000.00, 'Perlu Dikirim', NULL),
(4, 1, 'Tes Pelanggan Lagi', 'Alamat Tes', '081234567890', '2025-11-01 12:32:37', NULL, 0.00, 150000.00, 'Perlu Dikirim', NULL),
(7, 1, 'Pelanggan Postman', 'Jl. Coba Lagi No. 1', '081234567890', '2025-11-01 13:00:17', NULL, 0.00, 25000.00, 'Perlu Dikirim', NULL),
(8, 1, 'Adit', 'Bintaro', '12341234', '2025-11-04 09:22:37', 'https://res.cloudinary.com/dosfggbxu/image/upload/v1762248163/bukti_pembayaran/pesanan_8_1762248157586.png', 0.00, 20000.00, 'Selesai', NULL),
(9, 1, 'AA', 'AAA', '12312344', '2025-11-04 09:24:24', 'https://res.cloudinary.com/dosfggbxu/image/upload/v1762248268/bukti_pembayaran/pesanan_9_1762248264696.png', 0.00, 25000.00, 'Selesai', NULL),
(10, 1, 'tes', 'adada', '123123123', '2025-11-05 04:30:48', 'https://res.cloudinary.com/dosfggbxu/image/upload/v1762317061/bukti_pembayaran/pesanan_10_1762317049015.png', 0.00, 25000.00, 'Perlu Dikirim', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Produk`
--

CREATE TABLE `Produk` (
  `produkId` int NOT NULL,
  `namaProduk` varchar(255) NOT NULL,
  `deskripsi` text,
  `stok` int NOT NULL DEFAULT '0',
  `foto` varchar(255) DEFAULT NULL,
  `hargaUnit` decimal(10,2) NOT NULL COMMENT 'Harga dasar produk',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabel untuk menyimpan data produk utama';

--
-- Dumping data for table `Produk`
--

INSERT INTO `Produk` (`produkId`, `namaProduk`, `deskripsi`, `stok`, `foto`, `hargaUnit`, `createdAt`) VALUES
(3, 'Candil Susu Coklat', 'ada', 45, '/uploads/foto-1761724878020-813909992.png', 20000.00, '2025-10-29 08:01:18'),
(8, 'Candil Susu', 'Susu', 10, '/uploads/foto-1761813246166-845914743.png', 20000.00, '2025-10-30 08:34:06'),
(11, 'Candil Susu Coklat', 'Candil', 10, '/uploads/foto-1762061673547-483863431.png', 2000.00, '2025-11-02 05:34:33');

-- --------------------------------------------------------

--
-- Table structure for table `Ukuran`
--

CREATE TABLE `Ukuran` (
  `ukuranId` int NOT NULL,
  `produkId` int NOT NULL,
  `namaUkuran` varchar(100) NOT NULL COMMENT 'Contoh: Small, Large, 250g',
  `hargaTambahan` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Harga tambahan untuk ukuran ini'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabel untuk menyimpan opsi ukuran dan harga tambahan per produk';

--
-- Dumping data for table `Ukuran`
--

INSERT INTO `Ukuran` (`ukuranId`, `produkId`, `namaUkuran`, `hargaTambahan`) VALUES
(17, 3, '300 ml', 0.00),
(18, 3, '500 ml', 5000.00),
(28, 11, '300 ml', 0.00),
(32, 8, '300 ml', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `Ulasan`
--

CREATE TABLE `Ulasan` (
  `ulasanId` int NOT NULL,
  `produkId` int NOT NULL,
  `namaReviewer` varchar(100) NOT NULL,
  `rating` int NOT NULL,
  `komentar` text,
  `tanggalUlasan` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `Ulasan`
--

INSERT INTO `Ulasan` (`ulasanId`, `produkId`, `namaReviewer`, `rating`, `komentar`, `tanggalUlasan`) VALUES
(1, 3, 'Penguji dari Postman', 5, 'Produk ini sangat bagus, saya tes dari Postman!', '2025-10-30 03:50:08'),
(2, 3, 'Penguji dari Postman', 4, 'Produk ini sangat bagus, saya tes dari Postman!', '2025-10-30 03:52:12'),
(3, 3, 'Test', 5, 'Bagus', '2025-10-30 08:00:27'),
(4, 3, 'test', 4, 'test', '2025-11-01 07:27:49');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `userId` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `namaLengkap` varchar(255) NOT NULL,
  `role` enum('Customer','Admin','Super Admin') NOT NULL DEFAULT 'Customer',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`userId`, `username`, `password`, `namaLengkap`, `role`, `createdAt`) VALUES
(1, 'admin', '$2b$10$GOV1v1pFh1U2kvm.EovcTe1n.3SX7ti1HO7PLHg6FXmCZDwnkHY1W', 'Admin Utama', 'Super Admin', '2025-10-29 04:00:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `DetailPemesanan`
--
ALTER TABLE `DetailPemesanan`
  ADD PRIMARY KEY (`detailPemesananId`),
  ADD KEY `pesananId` (`pesananId`),
  ADD KEY `produkId` (`produkId`),
  ADD KEY `ukuranId` (`ukuranId`);

--
-- Indexes for table `Keranjang`
--
ALTER TABLE `Keranjang`
  ADD PRIMARY KEY (`cartSessionId`),
  ADD KEY `idx_created_at` (`createdAt`);

--
-- Indexes for table `Keranjang Item`
--
ALTER TABLE `Keranjang Item`
  ADD PRIMARY KEY (`keranjangItemId`),
  ADD UNIQUE KEY `unique_cart_product` (`cartSessionId`,`produkId`,`ukuranId`),
  ADD KEY `idx_cart_session` (`cartSessionId`),
  ADD KEY `idx_produk` (`produkId`),
  ADD KEY `idx_ukuran` (`ukuranId`);

--
-- Indexes for table `Lokasi`
--
ALTER TABLE `Lokasi`
  ADD PRIMARY KEY (`lokasiId`);

--
-- Indexes for table `Pemesanan`
--
ALTER TABLE `Pemesanan`
  ADD PRIMARY KEY (`pesananId`),
  ADD KEY `lokasiId` (`lokasiId`);

--
-- Indexes for table `Produk`
--
ALTER TABLE `Produk`
  ADD PRIMARY KEY (`produkId`);

--
-- Indexes for table `Ukuran`
--
ALTER TABLE `Ukuran`
  ADD PRIMARY KEY (`ukuranId`),
  ADD KEY `produkId` (`produkId`);

--
-- Indexes for table `Ulasan`
--
ALTER TABLE `Ulasan`
  ADD PRIMARY KEY (`ulasanId`),
  ADD KEY `fk_ulasan_produk_simple` (`produkId`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `DetailPemesanan`
--
ALTER TABLE `DetailPemesanan`
  MODIFY `detailPemesananId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Keranjang Item`
--
ALTER TABLE `Keranjang Item`
  MODIFY `keranjangItemId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Lokasi`
--
ALTER TABLE `Lokasi`
  MODIFY `lokasiId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Pemesanan`
--
ALTER TABLE `Pemesanan`
  MODIFY `pesananId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Produk`
--
ALTER TABLE `Produk`
  MODIFY `produkId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `Ukuran`
--
ALTER TABLE `Ukuran`
  MODIFY `ukuranId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `Ulasan`
--
ALTER TABLE `Ulasan`
  MODIFY `ulasanId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `DetailPemesanan`
--
ALTER TABLE `DetailPemesanan`
  ADD CONSTRAINT `detailpemesanan_ibfk_1` FOREIGN KEY (`pesananId`) REFERENCES `Pemesanan` (`pesananId`) ON DELETE CASCADE,
  ADD CONSTRAINT `detailpemesanan_ibfk_2` FOREIGN KEY (`produkId`) REFERENCES `Produk` (`produkId`) ON DELETE RESTRICT,
  ADD CONSTRAINT `detailpemesanan_ibfk_3` FOREIGN KEY (`ukuranId`) REFERENCES `Ukuran` (`ukuranId`) ON DELETE RESTRICT;

--
-- Constraints for table `Keranjang Item`
--
ALTER TABLE `Keranjang Item`
  ADD CONSTRAINT `fk_keranjang_item_cart` FOREIGN KEY (`cartSessionId`) REFERENCES `Keranjang` (`cartSessionId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_keranjang_item_produk` FOREIGN KEY (`produkId`) REFERENCES `Produk` (`produkId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_keranjang_item_ukuran` FOREIGN KEY (`ukuranId`) REFERENCES `Ukuran` (`ukuranId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Pemesanan`
--
ALTER TABLE `Pemesanan`
  ADD CONSTRAINT `pemesanan_ibfk_1` FOREIGN KEY (`lokasiId`) REFERENCES `Lokasi` (`lokasiId`) ON DELETE SET NULL;

--
-- Constraints for table `Ukuran`
--
ALTER TABLE `Ukuran`
  ADD CONSTRAINT `ukuran_ibfk_1` FOREIGN KEY (`produkId`) REFERENCES `Produk` (`produkId`) ON DELETE CASCADE;

--
-- Constraints for table `Ulasan`
--
ALTER TABLE `Ulasan`
  ADD CONSTRAINT `fk_ulasan_produk_simple` FOREIGN KEY (`produkId`) REFERENCES `Produk` (`produkId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
