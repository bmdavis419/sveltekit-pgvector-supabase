create extension vector with schema extensions;

CREATE TABLE IF NOT EXISTS "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_embedding" vector(1536)
);

CREATE INDEX ON exercises USING hnsw ("name_embedding" vector_cosine_ops);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;