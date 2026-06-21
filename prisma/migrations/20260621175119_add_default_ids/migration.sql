/*
  Warnings:

  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - Added the required column `address1` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCost` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `address1` VARCHAR(191) NOT NULL,
    ADD COLUMN `address2` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentType` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `pincode` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingCost` INTEGER NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `totalAmount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `price`,
    ADD COLUMN `productType` VARCHAR(191) NOT NULL DEFAULT 'weight';

-- CreateTable
CREATE TABLE `address` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NOT NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `saveAddress` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Address_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productvariant` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `ProductVariant_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productvariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_userId_idx` TO `Order_userId_fkey`;
