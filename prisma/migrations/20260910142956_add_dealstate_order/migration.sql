/*
  Warnings:

  - You are about to drop the column `order` on the `deal_states` table. All the data in the column will be lost.
  - Added the required column `sequence` to the `deal_states` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deal_states" DROP COLUMN "order",
ADD COLUMN     "sequence" INTEGER NOT NULL;
