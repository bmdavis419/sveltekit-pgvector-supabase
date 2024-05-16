import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});
