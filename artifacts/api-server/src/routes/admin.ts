import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  contentsTable,
  contentGenresTable,
  db,
  genresTable,
} from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const adminContentInputSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  tagline: z.string().trim().default(""),
  description: z.string().trim().min(1),
  contentType: z.enum(["movie", "series"]),
  year: z.number().int().min(1900).max(2100),
  duration: z.string().trim().min(1),
  maturity: z.string().trim().min(1),
  posterUrl: z.string().url(),
  backdropUrl: z.string().url(),
  rating: z.number().min(0).max(10),
  featured: z.boolean().default(false),
  videoUrl: z.string().url().or(z.literal("")).default(""),
  genres: z.array(z.string().trim().min(1)).default([]),
});

const adminContentPatchSchema = adminContentInputSchema.partial().extend({
  genres: z.array(z.string().trim().min(1)).optional(),
});

type AdminContentInput = z.infer<typeof adminContentInputSchema>;

function toAdminContent(
  content: typeof contentsTable.$inferSelect,
  genres: string[],
) {
  return {
    ...content,
    type: content.contentType,
    tagline: content.tagline ?? "",
    genres,
  };
}

async function getGenres(contentId: string) {
  const rows = await db
    .select({ name: genresTable.name })
    .from(contentGenresTable)
    .innerJoin(genresTable, eq(contentGenresTable.genreId, genresTable.id))
    .where(eq(contentGenresTable.contentId, contentId));

  return rows.map((row) => row.name);
}

async function saveGenres(contentId: string, genreNames: string[]) {
  const names = [...new Set(genreNames.map((name) => name.trim()).filter(Boolean))];
  await db
    .delete(contentGenresTable)
    .where(eq(contentGenresTable.contentId, contentId));

  for (const name of names) {
    const existing = await db
      .select({ id: genresTable.id })
      .from(genresTable)
      .where(eq(genresTable.name, name))
      .limit(1);
    const genre =
      existing[0] ??
      (
        await db
          .insert(genresTable)
          .values({ name })
          .returning({ id: genresTable.id })
      )[0];

    if (genre) {
      await db
        .insert(contentGenresTable)
        .values({ contentId, genreId: genre.id })
        .onConflictDoNothing();
    }
  }
}

function contentValues(input: AdminContentInput) {
  return {
    id: input.id,
    title: input.title,
    tagline: input.tagline || null,
    description: input.description,
    contentType: input.contentType,
    year: input.year,
    duration: input.duration,
    maturity: input.maturity,
    posterUrl: input.posterUrl,
    backdropUrl: input.backdropUrl,
    rating: input.rating,
    featured: input.featured,
    videoUrl: input.videoUrl || null,
  };
}

router.get("/admin/catalog", async (_req, res) => {
  try {
    const contents = await db
      .select()
      .from(contentsTable)
      .orderBy(desc(contentsTable.createdAt));
    const result = await Promise.all(
      contents.map(async (content) =>
        toAdminContent(content, await getGenres(content.id)),
      ),
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Unable to load the admin catalog" });
  }
});

router.post("/admin/catalog", async (req, res) => {
  const parsed = adminContentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid catalog entry", details: parsed.error.flatten() });
    return;
  }

  try {
    const input = parsed.data;
    const [content] = await db
      .insert(contentsTable)
      .values(contentValues(input))
      .returning();
    if (!content) {
      res.status(500).json({ error: "Unable to create catalog entry" });
      return;
    }
    await saveGenres(content.id, input.genres);
    res.status(201).json(toAdminContent(content, input.genres));
  } catch (error) {
    res.status(500).json({ error: "Unable to create catalog entry" });
  }
});

router.put("/admin/catalog/:contentId", async (req, res) => {
  const parsed = adminContentPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid catalog entry", details: parsed.error.flatten() });
    return;
  }

  try {
    const input = parsed.data;
    const [content] = await db
      .update(contentsTable)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.tagline !== undefined && { tagline: input.tagline || null }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.contentType !== undefined && { contentType: input.contentType }),
        ...(input.year !== undefined && { year: input.year }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.maturity !== undefined && { maturity: input.maturity }),
        ...(input.posterUrl !== undefined && { posterUrl: input.posterUrl }),
        ...(input.backdropUrl !== undefined && { backdropUrl: input.backdropUrl }),
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.featured !== undefined && { featured: input.featured }),
        ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl || null }),
        updatedAt: new Date(),
      })
      .where(eq(contentsTable.id, req.params.contentId))
      .returning();

    if (!content) {
      res.status(404).json({ error: "Catalog entry not found" });
      return;
    }
    if (input.genres !== undefined) {
      await saveGenres(content.id, input.genres);
    }
    res.json(toAdminContent(content, await getGenres(content.id)));
  } catch (error) {
    res.status(500).json({ error: "Unable to update catalog entry" });
  }
});

router.delete("/admin/catalog/:contentId", async (req, res) => {
  try {
    const [deleted] = await db
      .delete(contentsTable)
      .where(eq(contentsTable.id, req.params.contentId))
      .returning({ id: contentsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Catalog entry not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Unable to delete catalog entry" });
  }
});

export default router;