import { openaiEmbedding } from "$lib/ai";
import { db } from "$lib/db";
import { exercises } from "$lib/db/schema";
import { error } from "@sveltejs/kit";
import { embed } from "ai";
import { eq, sql } from "drizzle-orm";
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

    const dbExercises = await db.select({
      name: exercises.name,
      id: exercises.id,
    }).from(exercises).orderBy(sql`name_embedding <=> ${
      JSON.stringify(
        embedding,
      )
    }`).limit(3);

    return {
      dbExercises,
      // we return the query to use it as a value in the form
      query: res.data.query,
    };
  },
  seed: async ({ locals }) => {
    const exercisesSeedList = [
      "Bench",
      "Tricep Pushdown",
      "Incline Bench",
      "Rear Delt Machine",
      "Shoulder Lateral Raise",
    ];

    // check if the db is already seeded
    const curEx = await db.query.exercises.findFirst({
      where: eq(exercises.name, "Bench"),
    });

    if (curEx) {
      return {
        status: "skipped, already seeded",
      };
    }

    for (let i = 0; i < exercisesSeedList.length; i++) {
      const { embedding } = await embed({
        model: openaiEmbedding,
        value: exercisesSeedList[i],
      });

      // insert into db
      await locals.supabase.from("exercises").insert({
        name: exercisesSeedList[i],
        name_embedding: JSON.stringify(embedding),
      });
    }

    return {
      status: "seeded",
    };
  },
};

export const load = async () => {
  const { embedding } = await embed({
    model: openaiEmbedding,
    value: "Steak",
  });

  // without type safety
  const res = await db.execute(
    sql`SELECT id, name FROM exercises ORDER BY name_embedding <=> ${
      JSON.stringify(embedding)
    } LIMIT 3;`,
  );

  console.log(res);

  // with type safety
  const newRes = await db.select({
    name: exercises.name,
    id: exercises.id,
  }).from(exercises).orderBy(sql`name_embedding <=> ${
    JSON.stringify(
      embedding,
    )
  }`).limit(3);

  console.log(newRes);

  return {
    success: true,
  };
};
