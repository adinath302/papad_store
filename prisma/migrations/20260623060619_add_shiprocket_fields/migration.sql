-- AlterTable
ALTER TABLE `order` ADD COLUMN `courierName` VARCHAR(191) NULL,
    ADD COLUMN `shippingMethod` VARCHAR(191) NULL,
    ADD COLUMN `shiprocketShipmentId` INTEGER NULL,
    ADD COLUMN `trackingId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `productvariant` ADD COLUMN `weight` INTEGER NOT NULL DEFAULT 500;
