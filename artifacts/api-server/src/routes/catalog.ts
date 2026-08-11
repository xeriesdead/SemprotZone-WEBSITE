import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetContentParams,
  GetContentResponse,
  GetHomeResponse,
  ListCatalogQueryParams,
  ListCatalogResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  contentGenresTable,
  contentsTable,
  episodesTable,
  genresTable,
} from "@workspace/db/schema";

type CatalogContent = {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  type: "movie" | "series";
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string | null;
  rating: number;
  featured: boolean;
  progress: number;
};

type CatalogEpisode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode: number;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
};

const router: IRouter = Router();

const catalogOrder = [
  "malam-terakhir",
  "pulang-ke-laut",
  "jalan-pulang",
  "frekuensi-gelap",
  "kota-setelah-hujan",
] as const;

const progressByContentId: Record<string, number> = {
  "malam-terakhir": 0,
  "pulang-ke-laut": 38,
  "jalan-pulang": 0,
  "frekuensi-gelap": 62,
  "kota-setelah-hujan": 14,
};

const contentRows = () =>
  db
    .select({
      id: contentsTable.id,
      title: contentsTable.title,
      tagline: contentsTable.tagline,
      description: contentsTable.description,
      type: contentsTable.contentType,
      year: contentsTable.year,
      duration: contentsTable.duration,
      maturity: contentsTable.maturity,
      posterUrl: contentsTable.posterUrl,
      backdropUrl: contentsTable.backdropUrl,
      videoUrl: contentsTable.videoUrl,
      rating: contentsTable.rating,
      featured: contentsTable.featured,
      genre: genresTable.name,
    })
    .from(contentsTable)
    .leftJoin(
      contentGenresTable,
      eq(contentGenresTable.contentId, contentsTable.id),
    )
    .leftJoin(genresTable, eq(contentGenresTable.genreId, genresTable.id))
    .orderBy(asc(contentsTable.id));

const loadCatalog = async (): Promise<CatalogContent[]> => {
  const rows = await contentRows();
  const contentById = new Map<string, CatalogContent>();

  for (const row of rows) {
    const item = contentById.get(row.id);
    if (item) {
      if (row.genre) item.genres.push(row.genre);
      continue;
    }

    contentById.set(row.id, {
      id: row.id,
      title: row.title,
      tagline: row.tagline,
      description: row.description,
      type: row.type,
      year: row.year,
      duration: row.duration,
      maturity: row.maturity,
      genres: row.genre ? [row.genre] : [],
      posterUrl: row.posterUrl,
      backdropUrl: row.backdropUrl,
      videoUrl: row.videoUrl,
      rating: row.rating,
      featured: row.featured,
      progress: 0,
    });
  }

  return [...contentById.values()]
    .map((item) => ({
      ...item,
      tagline: item.tagline ?? "",
      progress: progressByContentId[item.id] ?? 0,
    }))
    .sort(
      (a, b) =>
        catalogOrder.indexOf(a.id as (typeof catalogOrder)[number]) -
        catalogOrder.indexOf(b.id as (typeof catalogOrder)[number]),
    );
};

const loadEpisodes = async (contentId: string): Promise<CatalogEpisode[]> => {
  const rows = await db
    .select({
      id: episodesTable.id,
      title: episodesTable.title,
      description: episodesTable.description,
      season: episodesTable.season,
      episode: episodesTable.episode,
      duration: episodesTable.duration,
      thumbnailUrl: episodesTable.thumbnailUrl,
      videoUrl: episodesTable.videoUrl,
    })
    .from(episodesTable)
    .where(eq(episodesTable.contentId, contentId))
    .orderBy(asc(episodesTable.season), asc(episodesTable.episode));

  return rows;
};

const matchesCatalogQuery = (
  item: CatalogContent,
  params: ReturnType<typeof ListCatalogQueryParams.parse>,
) => {
  const query = params.query?.toLowerCase();
  const matchesQuery =
    !query ||
    `${item.title} ${item.tagline ?? ""} ${item.description} ${item.genres.join(" ")}`
      .toLowerCase()
      .includes(query);
  const matchesGenre = !params.genre || item.genres.includes(params.genre);
  const matchesType = !params.type || item.type === params.type;

  return matchesQuery && matchesGenre && matchesType;
};

router.get("/catalog", async (req, res) => {
  const params = ListCatalogQueryParams.parse(req.query);
  const catalog = await loadCatalog();
  const result = catalog.filter((item) => matchesCatalogQuery(item, params));

  res.json(ListCatalogResponse.parse(result));
});

router.get("/catalog/:contentId", async (req, res) => {
  const { contentId } = GetContentParams.parse(req.params);
  const catalog = await loadCatalog();
  const item = catalog.find((entry) => entry.id === contentId);

  if (!item) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const episodes = await loadEpisodes(contentId);
  res.json(GetContentResponse.parse({ ...item, episodes }));
});

router.get("/home", async (_req, res) => {
  const catalog = await loadCatalog();
  const featured = catalog.find((item) => item.featured) ?? catalog[0];

  if (!featured) {
    res.status(500).json({ error: "Catalog is empty" });
    return;
  }

  const home = {
    featured,
    rails: [
      { id: "popular", title: "Paling banyak ditonton", items: catalog.slice(0, 5) },
      { id: "new", title: "Baru di Semprot Zone", items: catalog.slice(1, 6) },
      {
        id: "continue",
        title: "Lanjutkan menonton",
        items: catalog.filter((item) => item.progress > 0),
      },
    ],
  };

  res.json(GetHomeResponse.parse(home));
});

export default router;