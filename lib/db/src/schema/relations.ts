import { relations } from "drizzle-orm";

import { contentsTable } from "./content";
import { contentGenresTable, genresTable } from "./genre";
import { episodesTable } from "./episode";

export const contentsRelations = relations(contentsTable, ({ many }) => ({
  episodes: many(episodesTable),
  contentGenres: many(contentGenresTable),
}));

export const genresRelations = relations(genresTable, ({ many }) => ({
  contentGenres: many(contentGenresTable),
}));

export const contentGenresRelations = relations(
  contentGenresTable,
  ({ one }) => ({
    content: one(contentsTable, {
      fields: [contentGenresTable.contentId],
      references: [contentsTable.id],
    }),
    genre: one(genresTable, {
      fields: [contentGenresTable.genreId],
      references: [genresTable.id],
    }),
  }),
);

export const episodesRelations = relations(episodesTable, ({ one }) => ({
  content: one(contentsTable, {
    fields: [episodesTable.contentId],
    references: [contentsTable.id],
  }),
}));