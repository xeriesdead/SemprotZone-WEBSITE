import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgEnum, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const contentTypeEnum = pgEnum("content_type", ["movie", "series"]);

export const contentsTable = pgTable("contents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  description: text("description").notNull(),
  contentType: contentTypeEnum("content_type").notNull(),
  year: integer("year").notNull(),
  duration: text("duration").notNull(),
  maturity: text("maturity").notNull(),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url").notNull(),
  rating: real("rating").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  videoUrl: text("video_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContentSchema = createInsertSchema(contentsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentsTable.$inferSelect;