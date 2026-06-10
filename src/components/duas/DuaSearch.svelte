<script lang="ts">
  import { SearchIcon } from '../icons/index';

  interface Props {
    categories: string[];
  }

  let { categories }: Props = $props();

  let search = $state('');
  let activeCategory = $state('');

  let filteredCount = $state(0);

  function applyFilter() {
    const list = document.getElementById('duas-list');
    if (!list) return;

    const cards = list.querySelectorAll('[data-category]');
    let count = 0;

    cards.forEach((card) => {
      const htmlCard = card as HTMLElement;
      const category = htmlCard.getAttribute('data-category') ?? '';
      const text = htmlCard.textContent?.toLowerCase() ?? '';
      const searchTerm = search.toLowerCase().trim();

      const matchesCategory = !activeCategory || category === activeCategory;
      const matchesSearch = !searchTerm || text.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        htmlCard.style.display = '';
        count++;
      } else {
        htmlCard.style.display = 'none';
      }
    });

    filteredCount = count;
  }

  // Reactive filter on search/category change
  $effect(() => {
    // Touch both to trigger reactivity
    void search;
    void activeCategory;
    applyFilter();
  });

  function setCategory(cat: string) {
    activeCategory = activeCategory === cat ? '' : cat;
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Search input -->
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
      {@html SearchIcon(18)}
    </span>
    <input
      type="text"
      bind:value={search}
      placeholder="Search duas..."
      class="input-brutal w-full pl-10"
      aria-label="Search duas"
    />
  </div>

  <!-- Category filter chips -->
  <div class="flex flex-wrap gap-2">
    <button
      onclick={() => { activeCategory = ''; }}
      class="btn-brutal-sm text-xs
             {!activeCategory ? 'bg-ink text-white' : 'bg-white hover:bg-canvas'}"
    >
      All
    </button>
    {#each categories as cat}
      <button
        onclick={() => setCategory(cat)}
        class="btn-brutal-sm text-xs
               {activeCategory === cat ? 'bg-accent-pink text-white' : 'bg-white hover:bg-canvas'}"
      >
        {cat}
      </button>
    {/each}
  </div>
</div>
