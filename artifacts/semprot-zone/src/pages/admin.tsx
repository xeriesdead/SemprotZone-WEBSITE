import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Film, Pencil, Plus, Trash2, X } from "lucide-react";

type AdminContent = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: "movie" | "series";
  contentType: "movie" | "series";
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  featured: boolean;
  videoUrl: string | null;
};

type ContentForm = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  contentType: "movie" | "series";
  year: string;
  duration: string;
  maturity: string;
  genres: string;
  posterUrl: string;
  backdropUrl: string;
  rating: string;
  featured: boolean;
  videoUrl: string;
};

const emptyForm: ContentForm = {
  id: "",
  title: "",
  tagline: "",
  description: "",
  contentType: "movie",
  year: String(new Date().getFullYear()),
  duration: "",
  maturity: "13+",
  genres: "",
  posterUrl: "",
  backdropUrl: "",
  rating: "0",
  featured: false,
  videoUrl: "",
};

function formFromContent(content: AdminContent): ContentForm {
  return {
    id: content.id,
    title: content.title,
    tagline: content.tagline,
    description: content.description,
    contentType: content.contentType,
    year: String(content.year),
    duration: content.duration,
    maturity: content.maturity,
    genres: content.genres.join(", "),
    posterUrl: content.posterUrl,
    backdropUrl: content.backdropUrl,
    rating: String(content.rating),
    featured: content.featured,
    videoUrl: content.videoUrl ?? "",
  };
}

async function requestCatalog(path = "/api/admin/catalog", options?: RequestInit) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-2 block font-mono-ui text-[10px] uppercase tracking-[.14em] text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClass() {
  return "h-11 w-full rounded border border-white/10 bg-white/[.04] px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-300/60";
}

export default function Admin() {
  const [items, setItems] = useState<AdminContent[]>([]);
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCatalog() {
    setLoading(true);
    try {
      setItems((await requestCatalog()) as AdminContent[]);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load catalog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  function updateForm(key: keyof ContentForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(item: AdminContent) {
    setEditingId(item.id);
    setForm(formFromContent(item));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      id: form.id.trim(),
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      contentType: form.contentType,
      year: Number(form.year),
      duration: form.duration.trim(),
      maturity: form.maturity.trim(),
      genres: form.genres.split(",").map((genre) => genre.trim()).filter(Boolean),
      posterUrl: form.posterUrl.trim(),
      backdropUrl: form.backdropUrl.trim(),
      rating: Number(form.rating),
      featured: form.featured,
      videoUrl: form.videoUrl.trim(),
    };

    try {
      await requestCatalog(
        editingId ? `/api/admin/catalog/${editingId}` : "/api/admin/catalog",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      await loadCatalog();
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save catalog entry");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminContent) {
    if (!window.confirm(`Hapus "${item.title}" dari katalog?`)) return;
    try {
      await requestCatalog(`/api/admin/catalog/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete catalog entry");
    }
  }

  return (
    <div className="cinema-grain min-h-[100dvh] bg-[#10151d] text-stone-100">
      <header className="border-b border-white/[.08] bg-[#10151d]/95">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14">
          <Link href="/" className="flex items-center gap-3 text-stone-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-amber-300 text-[#11161d]">
              <Film className="h-4 w-4" />
            </span>
            <span className="font-mono-ui text-[13px] font-bold tracking-[.18em]">
              SEMPR<span className="text-amber-300">OT</span> ZONE
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 transition hover:text-amber-200">
            <ArrowLeft className="h-4 w-4" /> Kembali ke website
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-10 md:pt-16 lg:px-14">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/[.08] pb-7 md:flex-row md:items-end">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-amber-300/80">Content control room</p>
            <h1 className="mt-3 font-display text-5xl leading-none text-stone-100 md:text-6xl">Admin catalog.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">Kelola film dan series yang tampil di katalog. Upload video dan login belum diaktifkan.</p>
          </div>
          <button type="button" onClick={resetForm} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#11161d] transition hover:bg-amber-200">
            <Plus className="h-4 w-4" /> Tambah judul
          </button>
        </div>

        {error && <div className="mb-6 flex items-center justify-between rounded border border-[#e47b67]/40 bg-[#e47b67]/10 px-4 py-3 text-sm text-[#f1a18f]"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Close error"><X className="h-4 w-4" /></button></div>}

        <section className="mb-10 rounded-xl border border-white/[.08] bg-white/[.025] p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-stone-500">{editingId ? "Editing title" : "New title"}</p>
              <h2 className="mt-1 font-display text-2xl text-stone-100">{editingId ? "Edit katalog" : "Tambah ke katalog"}</h2>
            </div>
            {editingId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-200"><X className="h-4 w-4" /> Batal edit</button>}
          </div>
          <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
            <Field label="ID unik"><input required disabled={!!editingId} value={form.id} onChange={(event) => updateForm("id", event.target.value)} placeholder="malam-terakhir" className={inputClass()} /></Field>
            <Field label="Judul"><input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Malam Terakhir" className={inputClass()} /></Field>
            <Field label="Jenis"><select value={form.contentType} onChange={(event) => updateForm("contentType", event.target.value)} className={inputClass()}><option value="movie">Film</option><option value="series">Series</option></select></Field>
            <Field label="Tahun"><input required type="number" min="1900" max="2100" value={form.year} onChange={(event) => updateForm("year", event.target.value)} className={inputClass()} /></Field>
            <Field label="Durasi"><input required value={form.duration} onChange={(event) => updateForm("duration", event.target.value)} placeholder="1j 48m / 2 musim" className={inputClass()} /></Field>
            <Field label="Rating"><input required type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(event) => updateForm("rating", event.target.value)} className={inputClass()} /></Field>
            <Field label="Maturity"><input required value={form.maturity} onChange={(event) => updateForm("maturity", event.target.value)} placeholder="13+" className={inputClass()} /></Field>
            <Field label="Genre (pisahkan dengan koma)"><input value={form.genres} onChange={(event) => updateForm("genres", event.target.value)} placeholder="Drama, Thriller" className={inputClass()} /></Field>
            <Field label="Tagline" wide><input value={form.tagline} onChange={(event) => updateForm("tagline", event.target.value)} placeholder="Tidak semua rahasia ingin ditemukan." className={inputClass()} /></Field>
            <Field label="Deskripsi" wide><textarea required value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="min-h-24 w-full rounded border border-white/10 bg-white/[.04] px-3 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-300/60" placeholder="Ringkasan cerita..." /></Field>
            <Field label="Poster URL"><input required type="url" value={form.posterUrl} onChange={(event) => updateForm("posterUrl", event.target.value)} placeholder="https://..." className={inputClass()} /></Field>
            <Field label="Backdrop URL"><input required type="url" value={form.backdropUrl} onChange={(event) => updateForm("backdropUrl", event.target.value)} placeholder="https://..." className={inputClass()} /></Field>
            <Field label="Video URL (opsional)" wide><input type="url" value={form.videoUrl} onChange={(event) => updateForm("videoUrl", event.target.value)} placeholder="https://... (belum ada upload)" className={inputClass()} /></Field>
            <label className="flex items-center gap-3 text-sm text-stone-300 md:col-span-2"><input type="checkbox" checked={form.featured} onChange={(event) => updateForm("featured", event.target.checked)} className="h-4 w-4 accent-amber-300" /> Tampilkan sebagai featured</label>
            <div className="md:col-span-2"><button disabled={saving} type="submit" className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#11161d] transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60">{editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah judul"}</button></div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-stone-500">Published program</p><h2 className="mt-1 font-display text-3xl text-stone-100">Daftar katalog</h2></div><span className="text-xs text-stone-500">{loading ? "Memuat..." : `${items.length} judul`}</span></div>
          {loading ? <div className="rounded border border-white/[.08] p-8 text-sm text-stone-500">Memuat katalog...</div> : !items.length ? <div className="rounded border border-dashed border-white/[.12] p-10 text-center text-sm text-stone-500">Belum ada judul di database.</div> : <div className="overflow-x-auto rounded-xl border border-white/[.08]"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-white/[.08] bg-white/[.025] font-mono-ui text-[10px] uppercase tracking-[.14em] text-stone-500"><tr><th className="px-5 py-4">Judul</th><th className="px-5 py-4">Jenis</th><th className="px-5 py-4">Tahun</th><th className="px-5 py-4">Genre</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-white/[.06]">{items.map((item) => <tr key={item.id} className="text-sm text-stone-300"><td className="px-5 py-4"><div className="font-semibold text-stone-100">{item.title}</div><div className="mt-1 font-mono-ui text-[10px] text-stone-600">{item.id}</div></td><td className="px-5 py-4 capitalize">{item.type}</td><td className="px-5 py-4">{item.year}</td><td className="px-5 py-4 text-xs text-stone-500">{item.genres.join(" · ") || "—"}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => startEdit(item)} className="inline-flex h-9 items-center gap-2 rounded border border-white/10 px-3 text-xs font-semibold text-stone-300 transition hover:border-amber-300/50 hover:text-amber-200"><Pencil className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => void remove(item)} className="inline-flex h-9 items-center gap-2 rounded border border-[#e47b67]/25 px-3 text-xs font-semibold text-[#e47b67] transition hover:bg-[#e47b67]/10"><Trash2 className="h-3.5 w-3.5" /> Hapus</button></div></td></tr>)}</tbody></table></div>}
        </section>
      </main>
    </div>
  );
}