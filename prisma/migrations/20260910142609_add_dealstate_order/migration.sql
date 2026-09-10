/*
  Warnings:

  - Added the required column `order` to the `deal_states` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deal_states" ADD COLUMN     "order" INTEGER NOT NULL;
