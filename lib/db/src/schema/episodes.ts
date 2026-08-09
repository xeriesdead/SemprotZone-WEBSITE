import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { content } from "./content";
import { seasons } from "./seasons";

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  contentId: text("content_id")
    .notNull()
    .references(() => content.id, { onDelete: "cascade" }),
  seasonId: integer("season_id").references(() => seasons.id, {
    onDelete: "set null",
  }),
  seasonNumber: integer("season_number").notNull().default(1),
  episodeNumber: integer("episode_number").notNull().default(1),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  duration: text("duration").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = typeof episodes.$inferInsert;
