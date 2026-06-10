<script lang="ts">
  import { toggleBookmark, isBookmarked } from '../../lib/quran/bookmarks';

  interface Props {
    surah: number;
    ayah: number;
    surahName: string;
  }

  let { surah, ayah, surahName }: Props = $props();

  let bookmarked = $state(false);

  $effect(() => {
    bookmarked = isBookmarked(surah, ayah);
  });

  function handleToggle() {
    bookmarked = toggleBookmark(surah, ayah, surahName);
  }
</script>

<button
  onclick={handleToggle}
  class="w-7 h-7 flex items-center justify-center transition-all duration-75 shrink-0
         {bookmarked ? 'text-accent-pink' : 'text-ink/30 hover:text-accent-pink/60'}"
  aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
  title={bookmarked ? 'Bookmarked' : 'Bookmark this verse'}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
</button>
