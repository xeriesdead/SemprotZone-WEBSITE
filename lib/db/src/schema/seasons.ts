import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { content } from "./content";

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  contentId: text("content_id")
    .notNull()
    .references(() => content.id, { onDelete: "cascade" }),
  number: integer("number").notNull().default(1),
  title: text("title"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = typeof seasons.$inferInsert;
