# vectors, sveltekit, supabase, and the ai sdk

_still a work in progress, I'll delete this line when I'm done_

## what is this?

This is a demo of a simple app which uses the AI SDK, Supabase, and SvelteKit to
make a search feature.

This app shows off the different ways to index and search vectors and how to
create/query them.

## prerequisites

- [OpenAI API KEY](https://openai.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Bun](https://bun.sh/)

## how to run

1. fill in the `.env` file with your creds (see `.env.example`)
2. install packages with `bun install`
3. run `supabase start`
4. run `bun run dev`

## important docs for reference

- [pgvector](https://github.com/pgvector/pgvector)
- [supabase pgvector small example](https://supabase.com/docs/guides/database/extensions/pgvector?queryGroups=database-method&database-method=sql)
- [ai sdk openai embeddings](https://sdk.vercel.ai/providers/ai-sdk-providers/openai#embedding-models)
