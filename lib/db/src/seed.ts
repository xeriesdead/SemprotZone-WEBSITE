import { inArray } from "drizzle-orm";

import { db, pool } from "./index";
import {
  contentGenresTable,
  contentsTable,
  episodesTable,
  genresTable,
} from "./schema";

type CatalogItem = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: "movie" | "series";
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  viewCount?: number;
  featured: boolean;
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

const catalog: CatalogItem[] = [
  {
    id: "malam-terakhir",
    title: "Malam Terakhir",
    tagline: "Tidak semua rahasia ingin ditemukan.",
    description:
      "Ketika lampu kota padam, seorang jurnalis menemukan rekaman yang menghubungkan masa lalu keluarganya dengan sebuah malam yang tak pernah selesai.",
    type: "movie",
    year: 2025,
    duration: "1j 48m",
    maturity: "16+",
    genres: ["Thriller", "Drama", "Misteri"],
    posterUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
    backdropUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=90",
    rating: 8.7,
    viewCount: 18400,
    featured: true,
  },
  {
    id: "pulang-ke-laut",
    title: "Pulang ke Laut",
    tagline: "Rumah selalu punya cara untuk memanggil.",
    description:
      "Seorang fotografer kembali ke kampung pesisirnya dan harus berdamai dengan pilihan yang ia tinggalkan bertahun-tahun lalu.",
    type: "movie",
    year: 2024,
    duration: "1j 36m",
    maturity: "13+",
    genres: ["Drama", "Keluarga"],
    posterUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=700&q=85",
    backdropUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=90",
    rating: 8.2,
    viewCount: 12100,
    featured: false,
  },
  {
    id: "jalan-pulang",
    title: "Jalan Pulang",
    tagline: "Satu perjalanan. Dua hati yang belum selesai.",
    description:
      "Dua sahabat lama mengendarai motor menembus pegunungan untuk memenuhi janji yang mereka buat saat masih remaja.",
    type: "movie",
    year: 2025,
    duration: "1j 42m",
    maturity: "13+",
    genres: ["Drama", "Petualangan"],
    posterUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85",
    backdropUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90",
    rating: 8.4,
    viewCount: 9700,
    featured: false,
  },
  {
    id: "frekuensi-gelap",
    title: "Frekuensi Gelap",
    tagline: "Dengarkan baik-baik.",
    description:
      "Siaran radio misterius membawa seorang penyiar malam menuju sebuah konspirasi yang selama ini tersembunyi di balik suara kota.",
    type: "series",
    year: 2025,
    duration: "2 musim",
    maturity: "16+",
    genres: ["Misteri", "Thriller"],
    posterUrl:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
    backdropUrl:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=90",
    rating: 8.9,
    viewCount: 24600,
    featured: false,
  },
  {
    id: "kota-setelah-hujan",
    title: "Kota Setelah Hujan",
    tagline: "Setiap sudut menyimpan cerita.",
    description:
      "Kisah-kisah kecil dari orang-orang yang menemukan harapan baru di kota yang belum mereka kenal.",
    type: "series",
    year: 2024,
    duration: "1 musim",
    maturity: "13+",
    genres: ["Drama", "Romansa"],
    posterUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=85",
    backdropUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=90",
    rating: 8.1,
    viewCount: 8300,
    featured: false,
  },
];

const explicitEpisodes: Record<string, CatalogEpisode[]> = {
  "frekuensi-gelap": [
    {
      id: "frekuensi-gelap-s1e1",
      title: "Suara di Ujung Malam",
      description:
        "Sebuah panggilan anonim mengubah siaran malam menjadi petunjuk pertama.",
      season: 1,
      episode: 1,
      duration: "42m",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",
      videoUrl: "",
    },
    {
      id: "frekuensi-gelap-s1e2",
      title: "Sinyal yang Hilang",
      description: "Penyelidikan membawa mereka ke gedung tua di pusat kota.",
      season: 1,
      episode: 2,
      duration: "46m",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85",
      videoUrl: "",
    },
  ],
  "kota-setelah-hujan": [
    {
      id: "kota-setelah-hujan-s1e1",
      title: "Pertemuan Pertama",
      description: "Hujan mempertemukan dua orang asing di sebuah kedai kecil.",
      season: 1,
      episode: 1,
      duration: "38m",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=900&q=85",
      videoUrl: "",
    },
  ],
};

const fallbackVideoUrl =
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";

async function seed() {
  await db.transaction(async (tx) => {
    const genreNames = [...new Set(catalog.flatMap((item) => item.genres))];

    await tx
      .insert(genresTable)
      .values(genreNames.map((name) => ({ name })))
      .onConflictDoNothing({ target: genresTable.name });

    const genreRows = await tx
      .select({ id: genresTable.id, name: genresTable.name })
      .from(genresTable)
      .where(inArray(genresTable.name, genreNames));
    const genreIds = new Map(genreRows.map((genre) => [genre.name, genre.id]));

    await tx
      .insert(contentsTable)
      .values(
        catalog.map((item) => ({
          id: item.id,
          title: item.title,
          tagline: item.tagline,
          description: item.description,
          contentType: item.type,
          year: item.year,
          duration: item.duration,
          maturity: item.maturity,
          posterUrl: item.posterUrl,
          backdropUrl: item.backdropUrl,
          rating: item.rating,
          viewCount: item.viewCount ?? 0,
          featured: item.featured,
          videoUrl: null,
        })),
      )
      .onConflictDoNothing({ target: contentsTable.id });

    await tx
      .insert(contentGenresTable)
      .values(
        catalog.flatMap((item) =>
          item.genres.map((name) => {
            const genreId = genreIds.get(name);
            if (genreId === undefined) {
              throw new Error(`Genre was not seeded: ${name}`);
            }
            return { contentId: item.id, genreId };
          }),
        ),
      )
      .onConflictDoNothing();

    const episodeRows = catalog.flatMap((item) => {
      const episodes = explicitEpisodes[item.id] ?? [
        {
          id: `${item.id}-feature`,
          title: item.title,
          description: item.description,
          season: 1,
          episode: 1,
          duration: item.duration,
          thumbnailUrl: item.backdropUrl,
          videoUrl: fallbackVideoUrl,
        },
      ];

      return episodes.map((episode) => ({
        ...episode,
        contentId: item.id,
      }));
    });

    await tx
      .insert(episodesTable)
      .values(episodeRows)
      .onConflictDoNothing({ target: episodesTable.id });
  });

  console.log(
    `Seeded ${catalog.length} contents, ${new Set(catalog.flatMap((item) => item.genres)).size} genres, and ${catalog.reduce(
      (count, item) =>
        count + (explicitEpisodes[item.id]?.length ?? 1),
      0,
    )} episodes.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());