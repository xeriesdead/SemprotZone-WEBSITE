import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

import { contentsTable } from "./content";

export const episodesTable = pgTable(
  "episodes",
  {
    id: text("id").primaryKey(),
    contentId: text("content_id")
      .notNull()
      .references(() => contentsTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    season: integer("season").notNull(),
    episode: integer("episode").notNull(),
    duration: text("duration").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    videoUrl: text("video_url").notNull(),
  },
  (table) => [
    unique("episodes_content_season_episode_unique").on(
      table.contentId,
      table.season,
      table.episode,
    ),
  ],
);

export const insertEpisodeSchema = createInsertSchema(episodesTable);

export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodesTable.$inferSelect;