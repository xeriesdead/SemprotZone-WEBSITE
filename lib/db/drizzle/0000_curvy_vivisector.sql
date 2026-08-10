CREATE TYPE "public"."content_type" AS ENUM('movie', 'series');--> statement-breakpoint
CREATE TABLE "contents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"description" text NOT NULL,
	"content_type" "content_type" NOT NULL,
	"year" integer NOT NULL,
	"duration" text NOT NULL,
	"maturity" text NOT NULL,
	"poster_url" text NOT NULL,
	"backdrop_url" text NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"video_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"season" integer NOT NULL,
	"episode" integer NOT NULL,
	"duration" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"video_url" text NOT NULL,
	CONSTRAINT "episodes_content_season_episode_unique" UNIQUE("content_id","season","episode")
);
--> statement-breakpoint
CREATE TABLE "content_genres" (
	"content_id" text NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "content_genres_content_id_genre_id_pk" PRIMARY KEY("content_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "genres_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_genres" ADD CONSTRAINT "content_genres_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_genres" ADD CONSTRAINT "content_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;