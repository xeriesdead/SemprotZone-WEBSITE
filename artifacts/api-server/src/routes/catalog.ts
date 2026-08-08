import { Router, type IRouter } from "express";
import {
  GetContentParams,
  GetContentResponse,
  GetHomeResponse,
  ListCatalogQueryParams,
  ListCatalogResponse,
} from "@workspace/api-zod";

type Content = {
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
};

const content: Content[] = [
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
    posterUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
    backdropUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=90",
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
    posterUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=700&q=85",
    backdropUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=90",
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
    posterUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85",
    backdropUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90",
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
    posterUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
    backdropUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=90",
    rating: 8.9,
    featured: false,
    progress: 62,
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
    posterUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=85",
    backdropUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=90",
    rating: 8.1,
    featured: false,
    progress: 14,
  },
];

const episodes = {
  "frekuensi-gelap": [
    {
      id: "frekuensi-gelap-s1e1",
      title: "Suara di Ujung Malam",
      description: "Sebuah panggilan anonim mengubah siaran malam menjadi petunjuk pertama.",
      season: 1,
      episode: 1,
      duration: "42m",
      thumbnailUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",
      videoUrl: "",
    },
    {
      id: "frekuensi-gelap-s1e2",
      title: "Sinyal yang Hilang",
      description: "Penyelidikan membawa mereka ke gedung tua di pusat kota.",
      season: 1,
      episode: 2,
      duration: "46m",
      thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85",
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
      thumbnailUrl: "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=900&q=85",
      videoUrl: "",
    },
  ],
};

const videoUrl = "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";

const withVideo = (item: Content) => ({
  ...item,
  episodes:
    episodes[item.id as keyof typeof episodes] ??
    [
      {
        id: `${item.id}-feature`,
        title: item.title,
        description: item.description,
        season: 1,
        episode: 1,
        duration: item.duration,
        thumbnailUrl: item.backdropUrl,
        videoUrl,
      },
    ],
});

const router: IRouter = Router();

router.get("/catalog", (req, res) => {
  const params = ListCatalogQueryParams.parse(req.query);
  const query = params.query?.toLowerCase();
  const result = content.filter((item) => {
    const matchesQuery =
      !query ||
      `${item.title} ${item.tagline} ${item.description} ${item.genres.join(" ")}`
        .toLowerCase()
        .includes(query);
    const matchesGenre = !params.genre || item.genres.includes(params.genre);
    const matchesType = !params.type || item.type === params.type;
    return matchesQuery && matchesGenre && matchesType;
  });
  res.json(ListCatalogResponse.parse(result));
});

router.get("/catalog/:contentId", (req, res) => {
  const { contentId } = GetContentParams.parse(req.params);
  const item = content.find((entry) => entry.id === contentId);
  if (!item) {
    res.status(404).json({ error: "Content not found" });
    return;
  }
  res.json(GetContentResponse.parse(withVideo(item)));
});

router.get("/home", (_req, res) => {
  const featured = content.find((item) => item.featured) ?? content[0];
  const home = {
    featured,
    rails: [
      { id: "popular", title: "Paling banyak ditonton", items: content.slice(0, 5) },
      { id: "new", title: "Baru di Semprot Zone", items: content.slice(1, 6) },
      { id: "continue", title: "Lanjutkan menonton", items: content.filter((item) => item.progress > 0) },
    ],
  };
  res.json(GetHomeResponse.parse(home));
});

export default router;