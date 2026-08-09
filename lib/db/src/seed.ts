import { db, pool } from "./index";
import {
  genres,
  content,
  contentGenres,
  episodes,
  videoSources,
} from "./schema";

type SeedContent = {
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
  featured: boolean;
  progress: number;
  episodes?: {
    seasonNumber: number;
    episodeNumber: number;
    title: string;
    description: string;
    duration: string;
    thumbnailUrl: string;
  }[];
};

const seedData: SeedContent[] = [
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
    featured: true,
    progress: 0,
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
    featured: false,
    progress: 38,
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
    featured: false,
    progress: 0,
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
    featured: false,
    progress: 62,
    episodes: [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: "Suara di Ujung Malam",
        description:
          "Sebuah panggilan anonim mengubah siaran malam menjadi petunjuk pertama.",
        duration: "42m",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",
      },
      {
        seasonNumber: 1,
        episodeNumber: 2,
        title: "Sinyal yang Hilang",
        description: "Penyelidikan membawa mereka ke gedung tua di pusat kota.",
        duration: "46m",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85",
      },
    ],
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
    featured: false,
    progress: 14,
    episodes: [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: "Pertemuan Pertama",
        description:
          "Hujan mempertemukan dua orang asing di sebuah kedai kecil.",
        duration: "38m",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Sample direct video used so seeded titles are immediately playable.
const SAMPLE_DIRECT =
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";

async function seed() {
  console.log("[seed] starting");

  // Genres
  const genreNames = Array.from(
    new Set(seedData.flatMap((c) => c.genres)),
  ).sort();
  const genreRows = genreNames.map((name) => ({ slug: slugify(name), name }));
  await db.insert(genres).values(genreRows).onConflictDoNothing();
  const allGenres = await db.select().from(genres);
  const genreBySlug = new Map(allGenres.map((g) => [g.slug, g]));

  for (const item of seedData) {
    await db
      .insert(content)
      .values({
        id: item.id,
        title: item.title,
        tagline: item.tagline,
        description: item.description,
        type: item.type,
        year: item.year,
        duration: item.duration,
        maturity: item.maturity,
        posterUrl: item.posterUrl,
        backdropUrl: item.backdropUrl,
        rating: item.rating,
        featured: item.featured,
        progress: item.progress,
      })
      .onConflictDoNothing();

    // Content <-> genres
    let order = 0;
    for (const gname of item.genres) {
      const g = genreBySlug.get(slugify(gname));
      if (!g) continue;
      await db
        .insert(contentGenres)
        .values({ contentId: item.id, genreId: g.id, sortOrder: order++ })
        .onConflictDoNothing();
    }

    if (item.type === "series" && item.episodes?.length) {
      for (const ep of item.episodes) {
        const [row] = await db
          .insert(episodes)
          .values({
            contentId: item.id,
            seasonNumber: ep.seasonNumber,
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            description: ep.description,
            duration: ep.duration,
            thumbnailUrl: ep.thumbnailUrl,
            sortOrder: ep.episodeNumber,
          })
          .returning();
        await db
          .insert(videoSources)
          .values({
            episodeId: row.id,
            providerName: "SavFiles",
            providerType: "savfiles",
            kind: "direct",
            url: SAMPLE_DIRECT,
            label: "SavFiles",
            quality: "720p",
            sortOrder: 0,
          })
          .onConflictDoNothing();
      }
    } else if (item.type === "movie") {
      await db
        .insert(videoSources)
        .values({
          contentId: item.id,
          providerName: "SavFiles",
          providerType: "savfiles",
          kind: "direct",
          url: SAMPLE_DIRECT,
          label: "SavFiles",
          quality: "720p",
          sortOrder: 0,
        })
        .onConflictDoNothing();
    }
  }

  console.log("[seed] done");
}

seed()
  .catch((err) => {
    console.error("[seed] failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
