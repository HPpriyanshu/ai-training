/*
  Warnings:

  - Added the required column `content_tsv` to the `Chunk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "content_tsv" tsvector NOT NULL;

-- Index for fast search
CREATE INDEX chunk_tsv_idx
ON "Chunk"
USING GIN (content_tsv);