import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { content } from "./content";
import { episodes } from "./episodes";

/**
 * Generic streaming source table.
 *
 * A source belongs to EXACTLY ONE of a movie (`contentId`) or an episode
 * (`episodeId`), enforced by the check constraint below.
 *
 * `providerType` and `providerName` are free-form strings so brand new
 * providers can be added without any schema/enum migration. `kind`
 * distinguishes iframe/embed players ("embed") from direct video files such
 * as MP4 or a future object-storage provider ("direct"), keeping the door
 * open for direct/storage providers later without a big migration.
 */
export const videoSources = pgTable(
  "video_sources",
  {
    id: serial("id").primaryKey(),
    contentId: text("content_id").references(() => content.id, {
      onDelete: "cascade",
    }),
    episodeId: integer("episode_id").references(() => episodes.id, {
      onDelete: "cascade",
    }),
    providerName: text("provider_name").notNull(),
    // Free-form provider identifier (e.g. "doodstream", "streamup", "r2").
    providerType: text("provider_type").notNull(),
    // "embed" (iframe) or "direct" (native <video>).
    kind: text("kind").notNull().default("embed"),
    url: text("url").notNull(),
    label: text("label").notNull().default(""),
    quality: text("quality"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "video_sources_owner_exactly_one",
      sql`num_nonnulls(${t.contentId}, ${t.episodeId}) = 1`,
    ),
  ],
);

export type VideoSource = typeof videoSources.$inferSelect;
export type InsertVideoSource = typeof videoSources.$inferInsert;
