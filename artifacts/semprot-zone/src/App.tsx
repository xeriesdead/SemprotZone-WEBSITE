import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clapperboard,
  Clock3,
  ExternalLink,
  Film,
  Info,
  Menu,
  Play,
  Plus,
  Search,
  Share2,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getGetContentQueryKey,
  getListCatalogQueryKey,
  useGetContent,
  useGetHome,
  useListCatalog,
} from '@workspace/api-client-react';
import type { Content, ContentDetail, Episode, HomeFeed } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import Admin from '@/pages/admin';

const queryClient = new QueryClient();

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function useWatchlist() {
  const [items, setItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('semprot-watchlist') || '[]') as string[];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('semprot-watchlist', JSON.stringify(items));
  }, [items]);
  const toggle = (id: string) => setItems((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return { items, toggle, has: (id: string) => items.includes(id) };
}

function MediaImage({ src, alt, className, ...props }: { src?: string; alt: string; className?: string; [key: string]: unknown }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cx('flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#4d4040,#1d222a_62%)]', className)} {...props}>
        <Film className="h-8 w-8 text-amber-300/60" strokeWidth={1.4} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-amber-300 text-[#11161d] shadow-[0_5px_18px_rgba(245,188,92,.18)]">
        <Clapperboard className="h-[17px] w-[17px]" strokeWidth={2.3} />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#e47b67]" />
      </span>
      {!compact && <span className="font-mono-ui text-[13px] font-bold tracking-[.18em] text-stone-100 transition-colors group-hover:text-amber-200">SEMPR<span className="text-amber-300">OT</span> ZONE</span>}
    </Link>
  );
}

function Header({ onSearch }: { onSearch?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14">
        <Logo />
        <nav className="hidden items-center gap-8 text-[13px] font-semibold tracking-wide text-stone-300 md:flex">
          <Link href="/" className="transition-colors hover:text-amber-200" data-testid="link-home">Home</Link>
          <Link href="/browse" className="transition-colors hover:text-amber-200" data-testid="link-browse">Browse</Link>
          <a href="#about" className="transition-colors hover:text-amber-200" data-testid="link-about">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-amber-200" aria-label="Search" data-testid="button-header-search"><Search className="h-[18px] w-[18px]" /></button>
          <button type="button" className="hidden h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3.5 text-xs font-semibold text-stone-200 transition-colors hover:border-amber-300/40 hover:text-amber-200 sm:flex" data-testid="button-profile"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e47b67] text-[10px] font-bold text-[#1b171b]">SZ</span> Guest</button>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center text-stone-200 md:hidden" aria-label="Open menu" data-testid="button-mobile-menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {menuOpen && <div className="border-y border-white/10 bg-[#11161e]/95 px-6 py-4 backdrop-blur-lg md:hidden"><div className="flex flex-col gap-4 text-sm font-semibold text-stone-200"><Link href="/" data-testid="link-mobile-home">Home</Link><Link href="/browse" data-testid="link-mobile-browse">Browse</Link><a href="#about" data-testid="link-mobile-about">About</a></div></div>}
    </header>
  );
}

function Meta({ content, className }: { content: Content; className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono-ui uppercase tracking-[.08em] text-stone-400', className)}>
      <span className="text-amber-200">{content.year}</span><span className="h-1 w-1 rounded-full bg-stone-600" /><span>{content.type === 'series' ? 'Series' : 'Movie'}</span><span className="h-1 w-1 rounded-full bg-stone-600" /><span>{content.duration}</span><span className="h-1 w-1 rounded-full bg-stone-600" /><span className="rounded border border-stone-600 px-1.5 py-0.5 text-[9px]">{content.maturity}</span>
    </div>
  );
}

function WatchlistButton({ content, saved, onToggle, light = false }: { content: Content; saved: boolean; onToggle: () => void; light?: boolean }) {
  return (
    <button type="button" onClick={onToggle} className={cx('inline-flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold transition-all hover:-translate-y-0.5', light ? 'border-stone-500/50 bg-black/20 text-stone-100 hover:border-amber-300/70' : 'border-white/15 bg-white/[.045] text-stone-200 hover:border-amber-300/60 hover:text-amber-200')} data-testid={`button-watchlist-${content.id}`}>
      {saved ? <BookmarkCheck className="h-4 w-4 text-amber-300" /> : <Bookmark className="h-4 w-4" />} {saved ? 'In your list' : 'Watchlist'}
    </button>
  );
}

function PosterCard({ content, saved, onToggle }: { content: Content; saved: boolean; onToggle: () => void }) {
  return (
    <div className="poster-card group relative min-w-[138px] max-w-[138px] md:min-w-[178px] md:max-w-[178px]" data-testid={`card-content-${content.id}`}>
      <Link href={`/title/${content.id}`} className="block" data-testid={`link-content-${content.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-[5px] bg-[#252b32] shadow-[0_9px_25px_rgba(0,0,0,.22)]">
          <MediaImage src={content.posterUrl} alt={content.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11161d]/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {content.progress > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-stone-700/90"><div className="h-full bg-amber-300" style={{ width: `${Math.min(100, content.progress)}%` }} /></div>}
          <div className="absolute right-2 top-2 rounded bg-[#10151d]/80 px-1.5 py-1 text-[9px] font-mono-ui text-amber-200 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">{content.rating.toFixed(1)}</div>
        </div>
      </Link>
      <button type="button" onClick={onToggle} className={cx('absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#10151d]/75 text-stone-200 backdrop-blur transition-all hover:bg-amber-300 hover:text-[#11161d] md:opacity-0 md:group-hover:opacity-100', saved && 'text-amber-300 md:opacity-100')} aria-label={saved ? `Remove ${content.title} from watchlist` : `Add ${content.title} to watchlist`} data-testid={`button-card-watchlist-${content.id}`}>{saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</button>
      <Link href={`/title/${content.id}`} className="mt-3 block" data-testid={`link-card-title-${content.id}`}><h3 className="truncate text-[13px] font-semibold text-stone-100 transition-colors group-hover:text-amber-200">{content.title}</h3><p className="mt-1 truncate text-[10px] font-mono-ui uppercase tracking-[.08em] text-stone-500">{content.genres?.slice(0, 2).join(' / ') || content.type}</p></Link>
    </div>
  );
}

function Rail({ title, items, saved, onToggle }: { title: string; items: Content[]; saved: (id: string) => boolean; onToggle: (content: Content) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const move = (distance: number) => railRef.current?.scrollBy({ left: distance, behavior: 'smooth' });
  if (!items?.length) return null;
  return (
    <section className="group/rail relative mb-12 md:mb-16" data-testid={`section-rail-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="mb-5 flex items-end justify-between"><div><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[.22em] text-amber-300/75">Curated tonight</p><h2 className="font-display text-2xl text-stone-100 md:text-[29px]">{title}</h2></div><div className="hidden gap-1 md:flex"><button type="button" onClick={() => move(-420)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-amber-300/50 hover:text-amber-200" aria-label={`Previous ${title}`} data-testid={`button-previous-${title}`}><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(420)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-amber-300/50 hover:text-amber-200" aria-label={`Next ${title}`} data-testid={`button-next-${title}`}><ChevronRight className="h-4 w-4" /></button></div></div>
      <div ref={railRef} className="hide-scrollbar flex gap-4 overflow-x-auto pb-3 md:gap-5">{items.map((item) => <PosterCard key={item.id} content={item} saved={saved(item.id)} onToggle={() => onToggle(item)} />)}</div>
    </section>
  );
}

function SkeletonRail() {
  return <section className="mb-14"><div className="mb-5 h-8 w-44 animate-shimmer rounded" /><div className="hide-scrollbar flex gap-4 overflow-hidden">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="min-w-[138px] md:min-w-[178px]"><div className="aspect-[2/3] animate-shimmer rounded-[5px]" /><div className="mt-3 h-3 w-3/4 animate-shimmer rounded" /></div>)}</div></section>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-28 text-center" data-testid="state-error"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#e47b67]/40 bg-[#e47b67]/10 text-[#e47b67]"><CircleAlert className="h-6 w-6" /></div><h2 className="font-display text-3xl text-stone-100">The projector is warming up.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-stone-400">{message}</p><button type="button" onClick={retry} className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#11161d] transition hover:bg-amber-200" data-testid="button-retry"><ChevronRight className="h-4 w-4" /> Try again</button></div>;
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-28 text-center" data-testid="state-empty"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-200"><Film className="h-6 w-6" /></div><h2 className="font-display text-3xl text-stone-100">{title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-stone-400">{message}</p></div>;
}

function Home() {
  const { data, isLoading, isError, refetch } = useGetHome();
  const { items, toggle, has } = useWatchlist();
  const [, setLocation] = useLocation();
  const feed = data as HomeFeed | undefined;
  const featured = feed?.featured;
  return (
    <div className="cinema-grain min-h-[100dvh] bg-[#10151d]">
      <Header onSearch={() => setLocation('/browse')} />
      {isLoading ? <><div className="h-[590px] animate-shimmer md:h-[700px]" /><main className="mx-auto max-w-[1440px] px-5 py-14 md:px-10"><SkeletonRail /><SkeletonRail /></main></> : isError ? <><div className="pt-20"><ErrorState message="We couldn't reach the screening room. Check your connection and try once more." retry={() => refetch()} /></div></> : !feed || !featured ? <><div className="pt-20"><EmptyState title="No screenings tonight." message="There is nothing in the public catalog yet. Check back after the next programming drop." /></div></> : <>
        <section className="relative min-h-[620px] overflow-hidden md:min-h-[735px]">
          <MediaImage src={featured.backdropUrl || featured.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
          <div className="hero-vignette absolute inset-0" />
          <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] items-end px-5 pb-20 pt-32 md:min-h-[735px] md:items-center md:px-10 md:pb-6 lg:px-14"><div className="max-w-xl animate-rise"><div className="mb-5 flex items-center gap-3"><span className="flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.2em] text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Featured tonight</span><span className="text-[10px] uppercase tracking-[.18em] text-stone-400">Semprot original selection</span></div><h1 className="font-display text-5xl leading-[.94] tracking-[-.035em] text-stone-100 md:text-7xl">{featured.title}</h1><p className="mt-4 max-w-lg text-base font-medium leading-7 text-stone-300 md:text-lg">{featured.tagline}</p><Meta content={featured} className="mt-6" /><p className="mt-5 line-clamp-3 max-w-lg text-sm leading-6 text-stone-400">{featured.description}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={`/watch/${featured.id}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#11161d] transition-all hover:-translate-y-0.5 hover:bg-amber-200" data-testid={`link-play-featured-${featured.id}`}><Play className="h-4 w-4 fill-current" /> Start watching</Link><WatchlistButton content={featured} saved={has(featured.id)} onToggle={() => toggle(featured.id)} /></div></div></div>
        </section>
        <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 md:px-10 md:pt-16 lg:px-14">
          <div className="mb-10 flex items-center justify-between border-b border-white/[.08] pb-5"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-stone-500">The house program</p><h2 className="mt-1 font-display text-3xl text-stone-100 md:text-4xl">Find your next after-hours story.</h2></div><Link href="/browse" className="hidden items-center gap-2 text-xs font-bold text-amber-200 transition hover:text-amber-100 sm:flex" data-testid="link-explore-all">Explore all <ArrowLeft className="h-4 w-4 rotate-180" /></Link></div>
          {feed.rails?.map((rail) => <Rail key={rail.id} title={rail.title} items={rail.items} saved={has} onToggle={(content) => toggle(content.id)} />)}
          {!feed.rails?.length && <EmptyState title="The program is between reels." message="Browse the catalog to see everything currently available." />}
        </main>
        <footer id="about" className="border-t border-white/[.08] px-5 py-10 md:px-10 lg:px-14"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 text-[11px] text-stone-500 sm:flex-row"><Logo compact /><p>Free to watch. Supported by a few well-placed pauses.</p><span className="font-mono-ui uppercase tracking-[.14em]">© Semprot Zone</span></div></footer>
      </>}
    </div>
  );
}

function Browse() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [type, setType] = useState('');
  const params = useMemo(() => ({ query: search || undefined, genre: genre || undefined, type: (type || undefined) as 'movie' | 'series' | undefined }), [search, genre, type]);
  const { data, isLoading, isError, refetch } = useListCatalog(params, { query: { queryKey: getListCatalogQueryKey(params) } });
  const { has, toggle } = useWatchlist();
  const catalog = (data || []) as Content[];
  return <div className="cinema-grain min-h-[100dvh] bg-[#10151d]"><Header /><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-28 md:px-10 md:pt-36 lg:px-14"><div className="mb-10 max-w-3xl animate-rise"><p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-amber-300/80">The full program</p><h1 className="mt-3 font-display text-5xl leading-none text-stone-100 md:text-7xl">Browse the <span className="text-amber-300">dark.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-stone-400">Indonesian voices, international detours, and stories worth staying up for.</p></div><div className="mb-10 flex flex-col gap-3 border-y border-white/[.08] py-4 md:flex-row md:items-center"><div className="relative flex-1 md:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, stories, moods..." className="h-11 w-full rounded-full border border-white/10 bg-white/[.04] pl-10 pr-10 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-300/60" aria-label="Search catalog" data-testid="input-search-catalog" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200" aria-label="Clear search" data-testid="button-clear-search"><X className="h-4 w-4" /></button>}</div><div className="flex gap-2"><label className="relative"><select value={type} onChange={(event) => setType(event.target.value)} className="h-11 appearance-none rounded-full border border-white/10 bg-white/[.04] px-4 pr-9 text-xs font-bold text-stone-300 outline-none focus:border-amber-300/50" aria-label="Filter by type" data-testid="select-type"><option value="">Everything</option><option value="movie">Movies</option><option value="series">Series</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" /></label><label className="relative"><select value={genre} onChange={(event) => setGenre(event.target.value)} className="h-11 appearance-none rounded-full border border-white/10 bg-white/[.04] px-4 pr-9 text-xs font-bold text-stone-300 outline-none focus:border-amber-300/50" aria-label="Filter by genre" data-testid="select-genre"><option value="">Any genre</option><option value="Drama">Drama</option><option value="Comedy">Comedy</option><option value="Thriller">Thriller</option><option value="Action">Action</option><option value="Romance">Romance</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" /></label></div></div>{isLoading ? <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{[1,2,3,4,5,6,7,8,9,10,11,12].map((item) => <div key={item}><div className="aspect-[2/3] animate-shimmer rounded-[5px]" /><div className="mt-3 h-3 w-3/4 animate-shimmer rounded" /></div>)}</div> : isError ? <ErrorState message="The catalog is temporarily out of focus. Try reloading the program." retry={() => refetch()} /> : !catalog.length ? <EmptyState title="No matching stories." message={search ? `Nothing in the program matches “${search}”. Try a different title or clear the filters.` : 'The catalog is waiting for its next reel.'} /> : <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{catalog.map((item) => <PosterCard key={item.id} content={item} saved={has(item.id)} onToggle={() => toggle(item.id)} />)}</div>}</main></div>;
}

function Detail({ watchlist, toggle }: { watchlist: ReturnType<typeof useWatchlist>; toggle: (id: string) => void }) {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetContent(id, { query: { enabled: !!id, queryKey: getGetContentQueryKey(id) } });
  const content = data as ContentDetail | undefined;
  if (isLoading) return <div className="min-h-[100dvh] bg-[#10151d] pt-24"><div className="mx-auto max-w-[1440px] px-5 md:px-10"><div className="h-[400px] animate-shimmer rounded-xl" /></div></div>;
  if (isError) return <div className="min-h-[100dvh] bg-[#10151d] pt-20"><ErrorState message="We couldn't load this title's details." retry={() => refetch()} /></div>;
  if (!content) return <div className="min-h-[100dvh] bg-[#10151d] pt-20"><EmptyState title="Title not found." message="This story may have left the public program." /></div>;
  const episodes = content.episodes || [];
  return <div className="cinema-grain min-h-[100dvh] bg-[#10151d]"><Header /><section className="relative min-h-[650px] overflow-hidden pt-24 md:min-h-[720px] md:pt-0"><MediaImage src={content.backdropUrl || content.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" /><div className="absolute inset-0 bg-[linear-gradient(90deg,#10151d_2%,rgba(16,21,29,.84)_34%,rgba(16,21,29,.3)_75%),linear-gradient(0deg,#10151d_7%,transparent_48%)]" /><div className="relative mx-auto flex min-h-[650px] max-w-[1440px] items-end px-5 pb-14 md:min-h-[720px] md:items-center md:px-10 md:pb-0 lg:px-14"><div className="max-w-2xl animate-rise"><Link href="/browse" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-stone-400 transition hover:text-amber-200" data-testid="link-back-browse"><ArrowLeft className="h-4 w-4" /> Back to browse</Link><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[.22em] text-amber-300/80">{content.type === 'series' ? 'Series selection' : 'Film selection'}</p><h1 className="font-display text-5xl leading-[.95] text-stone-100 md:text-7xl">{content.title}</h1><p className="mt-4 font-display text-xl italic text-stone-300">{content.tagline}</p><Meta content={content} className="mt-6" /><div className="mt-6 flex items-center gap-2 text-sm text-amber-200"><Star className="h-4 w-4 fill-current" /> {content.rating.toFixed(1)} <span className="text-stone-500">audience rating</span></div><p className="mt-5 max-w-xl text-sm leading-7 text-stone-400">{content.description}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={`/watch/${content.id}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#11161d] transition hover:-translate-y-0.5 hover:bg-amber-200" data-testid={`link-detail-play-${content.id}`}><Play className="h-4 w-4 fill-current" /> {content.type === 'series' ? 'Play first episode' : 'Play film'}</Link><WatchlistButton content={content} saved={watchlist.has(content.id)} onToggle={() => toggle(content.id)} /></div></div></div></section><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-10 lg:px-14">{content.genres?.length > 0 && <div className="mb-10 flex flex-wrap gap-2">{content.genres.map((genreName) => <span key={genreName} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-mono-ui uppercase tracking-[.1em] text-stone-400">{genreName}</span>)}</div>}{content.type === 'series' && <section><div className="mb-6 flex items-end justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-amber-300/75">Continue the story</p><h2 className="mt-2 font-display text-3xl text-stone-100">Episodes</h2></div><span className="text-xs text-stone-500">{episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}</span></div>{episodes.length ? <div className="grid gap-4 md:grid-cols-2">{episodes.map((episode) => <EpisodeRow key={episode.id} episode={episode} contentId={content.id} />)}</div> : <EmptyState title="Episodes are still being cut." message="This series has no public episodes available yet." />}</section>}</main></div>;
}

function EpisodeRow({ episode, contentId }: { episode: Episode; contentId: string }) {
  return <Link href={`/watch/${contentId}?episode=${episode.id}`} className="group flex gap-4 rounded-lg border border-white/[.08] bg-white/[.025] p-3 transition-colors hover:border-amber-300/40 hover:bg-white/[.05]" data-testid={`link-episode-${episode.id}`}><div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded bg-[#242a31] sm:w-48"><MediaImage src={episode.thumbnailUrl} alt={episode.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-0 flex items-center justify-center bg-[#10151d]/45 opacity-0 transition-opacity group-hover:opacity-100"><Play className="h-7 w-7 fill-current text-amber-300" /></span></div><div className="min-w-0 py-1"><p className="font-mono-ui text-[9px] uppercase tracking-[.14em] text-amber-300/80">S{String(episode.season).padStart(2, '0')} · E{String(episode.episode).padStart(2, '0')}</p><h3 className="mt-2 truncate text-sm font-bold text-stone-100 group-hover:text-amber-200">{episode.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">{episode.description}</p><p className="mt-2 flex items-center gap-1 text-[10px] text-stone-500"><Clock3 className="h-3 w-3" /> {episode.duration}</p></div></Link>;
}

function Watch({ watchlist, toggle }: { watchlist: ReturnType<typeof useWatchlist>; toggle: (id: string) => void }) {
  const { id = '' } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { data, isLoading, isError, refetch } = useGetContent(id, { query: { enabled: !!id, queryKey: getGetContentQueryKey(id) } });
  const content = data as ContentDetail | undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [adVisible, setAdVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const episodeKey = new URLSearchParams(location.split('?')[1] || '').get('episode');
  const episodes = content?.episodes || [];
  const episode = episodes.find((item) => item.id === episodeKey) || episodes[0];
  const source = content?.type === 'series' ? episode?.videoUrl : content?.videoUrl;
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = muted;
  }, [muted]);
  if (isLoading) return <div className="min-h-[100dvh] bg-[#090d12] pt-24"><div className="mx-auto aspect-video max-w-[1200px] animate-shimmer" /></div>;
  if (isError) return <div className="min-h-[100dvh] bg-[#090d12] pt-20"><ErrorState message="The playback room is unavailable right now." retry={() => refetch()} /></div>;
  if (!content) return <div className="min-h-[100dvh] bg-[#090d12] pt-20"><EmptyState title="This reel is missing." message="Return to browse and choose another title." /></div>;
  return <div className="cinema-grain min-h-[100dvh] bg-[#090d12] text-stone-100"><div className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 md:px-8 md:pt-8"><div className="mb-5 flex items-center justify-between"><button type="button" onClick={() => setLocation(`/title/${id}`)} className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 transition hover:text-amber-200" data-testid="button-back-title"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to title</span></button><Logo /><button type="button" onClick={() => setAdVisible((visible) => !visible)} className="text-xs text-stone-500 transition hover:text-amber-200" data-testid="button-toggle-ad">{adVisible ? 'Hide ad treatment' : 'Show ad treatment'}</button></div><div className="relative overflow-hidden rounded-md bg-[#151a21] shadow-[0_20px_80px_rgba(0,0,0,.38)]"><div className="aspect-video w-full">{source ? <video ref={videoRef} controls autoPlay={false} poster={content.backdropUrl || content.posterUrl} className="h-full w-full" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} data-testid="video-player"><source src={source} /></video> : <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#2b3036,#11161d_70%)] text-center"><Film className="mb-4 h-10 w-10 text-amber-300/70" /><h2 className="font-display text-2xl">Playback is being prepared.</h2><p className="mt-2 max-w-xs text-xs leading-5 text-stone-500">There is no video source attached to this reel yet. You can still explore the title and episodes.</p></div>}</div>{adVisible && <div className="absolute left-4 top-4 flex items-center gap-2 rounded bg-[#10151d]/85 px-3 py-2 text-[10px] font-mono-ui uppercase tracking-[.12em] text-stone-300 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[#e47b67]" /> Ad-supported screening</div>}<div className="absolute bottom-12 left-4 flex items-center gap-2">{source && <button type="button" onClick={() => { if (videoRef.current) { if (playing) videoRef.current.pause(); else void videoRef.current.play(); } }} className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-[#11161d] transition hover:bg-amber-200" aria-label={playing ? 'Pause video' : 'Play video'} data-testid="button-player-play">{playing ? <span className="text-xs font-bold">Ⅱ</span> : <Play className="h-4 w-4 fill-current" />}</button>}<button type="button" onClick={() => setMuted((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10151d]/75 text-stone-200 backdrop-blur transition hover:text-amber-200" aria-label={muted ? 'Unmute video' : 'Mute video'} data-testid="button-player-mute">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button></div></div><div className="mt-6 flex flex-col justify-between gap-5 border-b border-white/[.08] pb-7 sm:flex-row sm:items-start"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.17em] text-amber-300/80">{content.type === 'series' && episode ? `Season ${episode.season} · Episode ${episode.episode}` : 'Feature presentation'}</p><h1 className="mt-2 font-display text-3xl text-stone-100 md:text-4xl">{content.type === 'series' && episode ? episode.title : content.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{content.type === 'series' && episode ? episode.description : content.description}</p></div><div className="flex shrink-0 gap-2"><WatchlistButton content={content} saved={watchlist.has(content.id)} onToggle={() => toggle(content.id)} light /><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-500/50 text-stone-300 transition hover:border-amber-300/60 hover:text-amber-200" aria-label="Copy link" data-testid="button-share"><Share2 className="h-4 w-4" /></button></div></div>{content.type === 'series' && episodes.length > 1 && <div className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl">More episodes</h2><span className="text-[10px] font-mono-ui uppercase tracking-[.14em] text-stone-500">{episodes.length} in this season</span></div><div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">{episodes.map((item) => <Link href={`/watch/${content.id}?episode=${item.id}`} key={item.id} className={cx('min-w-[190px] rounded border p-2 transition', item.id === episode?.id ? 'border-amber-300/60 bg-amber-300/[.08]' : 'border-white/10 bg-white/[.025] hover:border-amber-300/40')} data-testid={`link-watch-episode-${item.id}`}><div className="aspect-video overflow-hidden rounded-sm bg-[#232931]"><MediaImage src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" /></div><p className="mt-2 truncate text-xs font-semibold">{item.title}</p></Link>)}</div></div>}</div></div>;
}

function AppRouter() {
  const watchlist = useWatchlist();
  return <Switch><Route path="/" component={Home} /><Route path="/browse" component={Browse} /><Route path="/admin" component={Admin} /><Route path="/title/:id"><Detail watchlist={watchlist} toggle={watchlist.toggle} /></Route><Route path="/watch/:id"><Watch watchlist={watchlist} toggle={watchlist.toggle} /></Route><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRouter /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;