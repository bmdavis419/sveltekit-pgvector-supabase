CREATE TABLE IF NOT EXISTS "insiderviz_testing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"cik" text NOT NULL,
	"name_embedding" vector(1536)
);

CREATE INDEX ON "insiderviz_testing" USING hnsw ("name_embedding" vector_l2_ops);

ALTER TABLE "insiderviz_testing" ENABLE ROW LEVEL SECURITY;