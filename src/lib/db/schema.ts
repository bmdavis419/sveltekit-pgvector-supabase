import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});

export const insidervizTesting = pgTable("insiderviz_testing", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  cik: text("cik").notNull(),
});
