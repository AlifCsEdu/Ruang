<script lang="ts">
  import type { Bookmark } from '../../lib/quran/bookmarks';

  const PRESET_TAGS = ['memorize', 'reflect', 'tafsir'];

  interface Props {
    bookmarks: Bookmark[];
    onDelete: (surah: number, ayah: number) => void;
    onUpdateNote: (surah: number, ayah: number, note: string) => void;
    onClearAll: () => void;
    onAddTag?: (surah: number, ayah: number, tag: string) => void;
    onRemoveTag?: (surah: number, ayah: number, tag: string) => void;
  }

  let { bookmarks, onDelete, onUpdateNote, onClearAll, onAddTag, onRemoveTag }: Props = $props();

  let editingKey = $state<string | null>(null);
  let editNote = $state('');
  let filterTag = $state<string | null>(null);

  const allTags = $derived(
    Array.from(new Set(bookmarks.flatMap(b => b.tags ?? []))).sort()
  );

  const filteredBookmarks = $derived(
    filterTag ? bookmarks.filter(b => b.tags?.includes(filterTag)) : bookmarks
  );

  function startEdit(b: Bookmark) {
    editingKey = `${b.surah}:${b.ayah}`;
    editNote = b.note ?? '';
  }

  function saveEdit(surah: number, ayah: number) {
    onUpdateNote(surah, ayah, editNote);
    editingKey = null;
    editNote = '';
  }

  function cancelEdit() {
    editingKey = null;
    editNote = '';
  }

  function handleClearAll() {
    if (confirm('Padam semua bookmark? Tindakan ini tidak boleh dibatalkan.')) {
      onClearAll();
    }
  }

  function toggleTag(b: Bookmark, tag: string) {
    if (b.tags?.includes(tag)) {
      onRemoveTag?.(b.surah, b.ayah, tag);
    } else {
      onAddTag?.(b.surah, b.ayah, tag);
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-lg">♥</span>
      <h3 class="font-black text-sm uppercase tracking-wider">Bookmarks</h3>
      <span class="chip-brutal bg-accent-pink/20 text-[10px]">{bookmarks.length}</span>
    </div>
    {#if bookmarks.length > 0}
      <button
        onclick={handleClearAll}
        class="btn-brutal-sm text-[10px] text-accent-pink hover:bg-accent-pink/10"
      >Padam Semua</button>
    {/if}
  </div>

  <!-- Tag filter chips -->
  {#if allTags.length > 0}
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] font-black uppercase tracking-wider text-ink/40">Tags:</span>
      <button
        onclick={() => (filterTag = null)}
        class="chip-brutal text-[9px] {!filterTag ? 'bg-ink text-white' : 'bg-white'} transition-colors"
      >All</button>
      {#each allTags as tag}
        <button
          onclick={() => (filterTag = filterTag === tag ? null : tag)}
          class="chip-brutal text-[9px] {filterTag === tag ? 'bg-accent-yellow' : 'bg-white'} transition-colors"
        >{tag}</button>
      {/each}
    </div>
  {/if}

  <!-- Bookmarks list -->
  {#if filteredBookmarks.length === 0}
    <div class="card-brutal-sm text-center py-6">
      <p class="text-sm text-ink/40 font-bold">{filterTag ? `Tiada bookmark dengan tag "${filterTag}".` : 'Tiada bookmark lagi.'}</p>
      <p class="text-xs text-ink/30 font-bold mt-1">Tekan ♥ pada ayat untuk menambah bookmark.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-2">
      {#each filteredBookmarks as b (b.surah + ':' + b.ayah)}
        {@const key = `${b.surah}:${b.ayah}`}
        <div class="card-brutal-sm hover:bg-accent-pink/5 transition-colors">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-accent-pink">♥</span>
                <a
                  href="/quran/{b.surah}#verse-{b.ayah}"
                  class="font-black text-sm hover:text-accent-blue transition-colors"
                >
                  {b.surahName} : {b.ayah}
                </a>
                <span class="chip-brutal bg-accent-yellow/30 text-[9px]">Surah {b.surah}</span>
              </div>
              <p class="text-[10px] text-ink/30 font-bold mt-0.5">
                {new Date(b.addedAt).toLocaleDateString('ms-MY')}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0">
              {#if editingKey !== key}
                <button
                  onclick={() => startEdit(b)}
                  class="w-6 h-6 border-2 border-ink/30 flex items-center justify-center text-[10px]
                         hover:border-ink hover:bg-canvas transition-all"
                  aria-label="Edit note"
                >✏️</button>
              {/if}
              <button
                onclick={() => onDelete(b.surah, b.ayah)}
                class="w-6 h-6 border-2 border-ink/30 flex items-center justify-center text-[10px]
                       hover:border-accent-pink hover:bg-accent-pink/10 transition-all"
                aria-label="Delete bookmark"
              >🗑️</button>
              <a
                href="/quran/{b.surah}#verse-{b.ayah}"
                class="w-6 h-6 border-2 border-ink/30 flex items-center justify-center text-[10px]
                       hover:border-accent-blue hover:bg-accent-blue/10 transition-all"
                aria-label="Go to verse"
              >→</a>
            </div>
          </div>

          <!-- Note display / edit -->
          {#if editingKey === key}
            <div class="mt-2 flex gap-2">
              <input
                type="text"
                bind:value={editNote}
                placeholder="Tambah nota..."
                class="input-brutal flex-1 text-xs !shadow-none !border-2 !py-1"
                onkeydown={(e) => { if (e.key === 'Enter') saveEdit(b.surah, b.ayah); if (e.key === 'Escape') cancelEdit(); }}
              />
              <button onclick={() => saveEdit(b.surah, b.ayah)} class="btn-brutal-sm text-[10px] bg-accent-green text-white border-ink">✓</button>
              <button onclick={cancelEdit} class="btn-brutal-sm text-[10px]">✕</button>
            </div>
            <!-- Tag toggles -->
            <div class="mt-2 flex flex-wrap gap-1">
              {#each PRESET_TAGS as tag}
                <button
                  onclick={() => toggleTag(b, tag)}
                  class="chip-brutal text-[9px] {b.tags?.includes(tag) ? 'bg-accent-yellow' : 'bg-white'} transition-colors"
                >{b.tags?.includes(tag) ? '✓' : '+'} {tag}</button>
              {/each}
            </div>
          {:else if b.note}
            <p class="mt-1.5 text-xs text-ink/60 font-bold italic border-l-2 border-ink/20 pl-2">"{b.note}"</p>
          {/if}

          <!-- Tag display (always visible) -->
          {#if b.tags?.length}
            <div class="mt-1.5 flex flex-wrap gap-1">
              {#each b.tags as tag}
                <span class="chip-brutal text-[8px] bg-accent-yellow/30">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
