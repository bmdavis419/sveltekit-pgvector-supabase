import { openaiEmbedding } from "$lib/ai";
import { db } from "$lib/db";
import { insidervizTesting } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { embed } from "ai";
import { sql } from "drizzle-orm";
import { zfd } from "zod-form-data";

export const actions = {
  search: async ({ request }) => {
    const data = await request.formData();

    const schema = zfd.formData({
      query: zfd.text(),
    });

    const res = schema.safeParse(data);

    if (!res.success) {
      error(400, res.error.name);
    }

    const { embedding } = await embed({
      model: openaiEmbedding,
      value: res.data.query,
    });

    const searchRes = await db.select({
      name: insidervizTesting.name,
      id: insidervizTesting.id,
      type: insidervizTesting.type,
      cik: insidervizTesting.cik,
    }).from(insidervizTesting).orderBy(sql`name_embedding <-> ${
      JSON.stringify(
        embedding,
      )
    }`).limit(3);

    return {
      searchRes,
    };
  },
  seed: async ({ locals }) => {
    const seedData = [
      {
        name: "Ernest Garcia",
        type: "insider",
        cik: "0000320193",
      },
      {
        name: "Carvana (CVNA)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Jeff Bezos",
        type: "insider",
        cik: "0000320193",
      },
      {
        name: "Elon Musk",
        type: "insider",
        cik: "0000320193",
      },
      {
        name: "Bill Gates",
        type: "insider",
        cik: "0000320193",
      },
      {
        name: "Mark Zuckerberg",
        type: "insider",
        cik: "0000320193",
      },
      {
        name: "Tesla Inc. (TSLA)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Apple Inc. (AAPL)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Microsoft Corporation (MSFT)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Alphabet Inc. (GOOG)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Facebook, Inc. (FB)",
        type: "company",
        cik: "0000320193",
      },
      {
        name: "Amazon.com, Inc. (AMZN)",
        type: "company",
        cik: "0000320193",
      },
    ];

    for (let i = 0; i < seedData.length; i++) {
      const { embedding } = await embed({
        model: openaiEmbedding,
        value: seedData[i].name,
      });

      // insert into db
      await locals.supabase.from("insiderviz_testing").insert({
        name: seedData[i].name,
        type: seedData[i].type,
        cik: seedData[i].cik,
        name_embedding: JSON.stringify(embedding),
      });
    }

    return { success: true };
  },
};
