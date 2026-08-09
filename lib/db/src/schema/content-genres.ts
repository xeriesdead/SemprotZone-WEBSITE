import { pgTable, text, integer, primaryKey } from "drizzle-orm/pg-core";
import { content } from "./content";
import { genres } from "./genres";

export const contentGenres = pgTable(
  "content_genres",
  {
    contentId: text("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.contentId, t.genreId] })],
);

export type ContentGenre = typeof contentGenres.$inferSelect;
export type InsertContentGenre = typeof contentGenres.$inferInsert;
