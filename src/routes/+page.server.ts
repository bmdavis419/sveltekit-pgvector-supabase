import { openaiEmbedding } from "$lib/ai";
import { db } from "$lib/db";
import { embed } from "ai";
import { sql } from "drizzle-orm";

export const actions = {
  default: async ({ locals }) => {
    const exercises = [
      "Bench",
      "Tricep Pushdown",
      "Incline Bench",
      "Rear Delt Machine",
      "Shoulder Lateral Raise",
    ];

    for (let i = 0; i < exercises.length; i++) {
      const { embedding } = await embed({
        model: openaiEmbedding,
        value: exercises[i],
      });

      // insert into db
      await locals.supabase.from("exercises").insert({
        name: exercises[i],
        name_embedding: JSON.stringify(embedding),
      });
    }

    return {
      success: true,
    };
  },
};

export const load = async () => {
  const { embedding } = await embed({
    model: openaiEmbedding,
    value: "Steak",
  });

  const res = await db.execute(
    sql`SELECT id, name FROM exercises ORDER BY name_embedding <=> ${
      JSON.stringify(embedding)
    } LIMIT 1;`,
  );

  console.log(res);

  return {
    success: true,
  };
};
