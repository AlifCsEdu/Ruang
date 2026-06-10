<script lang="ts">
  import { onMount } from 'svelte';
  import type { Hadith, HadithResponse } from '../../lib/hadith/types';

  interface Props {
    collection: string;
  }

  let { collection }: Props = $props();

  let hadiths = $state<Hadith[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let page = $state(1);
  let totalPages = $state(1);
  let totalHadiths = $state(0);
  let isFallback = $state(false);
  let search = $state('');
  let infiniteScroll = $state(false);
  let allLoadedHadiths = $state<Hadith[]>([]);

  let filteredHadiths = $derived(
    search.trim()
      ? hadiths.filter((h) =>
          h.english.toLowerCase().includes(search.toLowerCase()) ||
          h.arabic.includes(search) ||
          h.narrator?.toLowerCase().includes(search.toLowerCase())
        )
      : hadiths
  );

  let displayHadiths = $derived(
    infiniteScroll ? allLoadedHadiths : filteredHadiths
  );

  onMount(async () => {
    await loadPage(1);
  });

  async function loadPage(p: number) {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/hadith/${collection}?page=${p}&perPage=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HadithResponse & { isFallback?: boolean } = await res.json();
      hadiths = data.hadiths;
      totalPages = data.totalPages;
      totalHadiths = data.totalHadiths;
      isFallback = data.isFallback ?? false;
      page = p;

      if (infiniteScroll && p > 1) {
        allLoadedHadiths = [...allLoadedHadiths, ...data.hadiths];
      } else {
        allLoadedHadiths = [...data.hadiths];
      }
    } catch (err: any) {
      error = err.message ?? 'Failed to load hadiths';
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (page >= totalPages || loading) return;
    await loadPage(page + 1);
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === page) return;
    allLoadedHadiths = [];
    loadPage(p);
  }

  function toggleInfiniteScroll() {
    infiniteScroll = !infiniteScroll;
    if (infiniteScroll) {
      allLoadedHadiths = [...hadiths];
    }
  }

  // Intersection observer for infinite scroll
  let sentinel: HTMLDivElement | null = $state(null);
  $effect(() => {
    if (!sentinel || !infiniteScroll) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  // Pagination helpers
  let pageNumbers = $derived.by(() => {
    const pages: (number | string)[] = [];
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  });
</script>

<div class="flex flex-col gap-4">
  <!-- Search bar -->
  <div class="flex items-center gap-2">
    <input
      type="text"
      bind:value={search}
      placeholder="Cari hadith..."
      class="input-brutal flex-1 text-sm !shadow-none !border-2"
    />
    <button
      onclick={toggleInfiniteScroll}
      class="btn-brutal-sm text-xs shrink-0
             {infiniteScroll ? '!bg-accent-blue !text-white' : ''}"
    >
      {infiniteScroll ? '∞' : '📄'}
    </button>
  </div>

  {#if isFallback}
    <div class="card-brutal-sm bg-accent-yellow/20">
      <p class="text-xs font-bold text-ink/70">
        ⚠ Menunjukkan koleksi curated. API Sunnah.com belum dikonfigurasi.
      </p>
    </div>
  {/if}

  <!-- Hadith list -->
  {#if loading && hadiths.length === 0}
    <div class="text-center py-12">
      <div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">
        Memuatkan hadith...
      </div>
    </div>
  {:else if error}
    <div class="card-brutal-sm bg-accent-pink text-white">
      <p class="font-bold text-sm">{error}</p>
      <button onclick={() => loadPage(page)} class="btn-brutal-sm mt-2 bg-white text-ink text-xs">
        Cuba Lagi
      </button>
    </div>
  {:else if displayHadiths.length === 0}
    <div class="text-center py-12">
      <p class="font-black text-ink/40 uppercase tracking-wider">Tiada hadith dijumpai</p>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      {#each displayHadiths as hadith}
        <div class="card-brutal">
          <div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2">
            <span class="badge-brutal bg-accent-yellow text-xs">#{hadith.number}</span>
            {#if hadith.reference}
              <span class="text-xs text-ink/40 font-bold">{hadith.reference}</span>
            {/if}
            {#if hadith.grade}
              <span class="ml-auto badge-brutal bg-accent-green/20 text-[10px]">{hadith.grade}</span>
            {/if}
          </div>

          <p class="arabic-text mb-4" dir="rtl" lang="ar">{hadith.arabic}</p>
          <p class="text-sm text-ink/80 leading-relaxed mb-3">{hadith.english}</p>

          {#if hadith.narrator}
            <p class="text-xs text-ink/50 font-bold">Diriwayatkan: {hadith.narrator}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Infinite scroll sentinel -->
  {#if infiniteScroll && page < totalPages}
    <div bind:this={sentinel} class="py-4 text-center">
      {#if loading}
        <div class="font-bold text-ink/40 animate-pulse">Memuatkan lagi...</div>
      {/if}
    </div>
  {/if}

  <!-- Pagination controls -->
  {#if !infiniteScroll && totalPages > 1}
    <div class="flex items-center justify-center gap-1 flex-wrap">
      <button
        onclick={() => goToPage(page - 1)}
        disabled={page <= 1}
        class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      >← Prev</button>

      {#each pageNumbers as p}
        {#if p === '...'}
          <span class="px-2 text-ink/40 font-bold">...</span>
        {:else}
          <button
            onclick={() => goToPage(p as number)}
            class="btn-brutal-sm text-xs
                   {p === page ? '!bg-accent-blue !text-white' : ''}"
          >{p}</button>
        {/if}
      {/each}

      <button
        onclick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      >Next →</button>
    </div>

    <p class="text-center text-xs text-ink/40 font-bold">
      Halaman {page} daripada {totalPages} · {totalHadiths} hadith
    </p>
  {/if}
</div>
