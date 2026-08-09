import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("content_type", ["movie", "series"]);

export const content = pgTable("content", {
  // Slug-style primary key (e.g. "malam-terakhir") so public URLs stay stable.
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  type: contentTypeEnum("type").notNull().default("movie"),
  year: integer("year").notNull().default(0),
  duration: text("duration").notNull().default(""),
  maturity: text("maturity").notNull().default(""),
  posterUrl: text("poster_url").notNull().default(""),
  backdropUrl: text("backdrop_url").notNull().default(""),
  rating: real("rating").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  progress: integer("progress").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Content = typeof content.$inferSelect;
export type InsertContent = typeof content.$inferInsert;
