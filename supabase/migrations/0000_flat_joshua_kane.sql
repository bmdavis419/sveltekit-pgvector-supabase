create extension vector with schema extensions;

CREATE TABLE IF NOT EXISTS "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_embedding" vector(1536)
);

-- NOTE: pick one of the following indexes

-- L2 SIMILARITY
-- CREATE INDEX ON exercises USING hnsw ("name_embedding" vector_l2_ops);

-- COSINE SIMILARITY
CREATE INDEX ON exercises USING hnsw ("name_embedding" vector_cosine_ops);

-- INNER PRODUCT SIMILARITY
-- CREATE INDEX ON exercises USING hnsw ("name_embedding" vector_ip_ops);


-- this is always required for how I do supabase lol 
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;