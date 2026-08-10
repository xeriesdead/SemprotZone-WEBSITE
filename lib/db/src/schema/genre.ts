import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, unique, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

import { contentsTable } from "./content";

export const genresTable = pgTable("genres", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
}, (table) => [unique("genres_name_unique").on(table.name)]);

export const contentGenresTable = pgTable(
  "content_genres",
  {
    contentId: text("content_id")
      .notNull()
      .references(() => contentsTable.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genresTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.contentId, table.genreId] }),
  ],
);

export const insertGenreSchema = createInsertSchema(genresTable);

export const insertContentGenreSchema = createInsertSchema(contentGenresTable);

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genresTable.$inferSelect;
export type InsertContentGenre = z.infer<typeof insertContentGenreSchema>;
export type ContentGenre = typeof contentGenresTable.$inferSelect;