<script lang="ts">
  interface Props {
    number: number;
    variant?: 'badge' | 'inline';
    playing?: boolean;
  }

  let { number, variant = 'badge', playing = false }: Props = $props();
</script>

{#if variant === 'badge'}
  <!-- Badge variant: circular ornamental marker for Standard/Word-by-Word modes -->
  <span
    class="inline-flex items-center justify-center shrink-0 {playing ? 'ayah-playing' : ''}"
    style="width: 2rem; height: 2rem;"
    aria-label="Verse {number}"
  >
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer ring -->
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" stroke-width="2" fill="{playing ? '#FFD500' : 'none'}" />
      <!-- Inner dashed ring -->
      <circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.5" fill="none" />
      <!-- Decorative dots at cardinal points -->
      <circle cx="16" cy="2.5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="29.5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="2.5" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="29.5" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
      <!-- Number -->
      <text x="16" y="16" text-anchor="middle" dominant-baseline="central"
        font-family="var(--font-ui, Inter, system-ui, sans-serif)"
        font-weight="900" font-size="10" fill="currentColor">
        {number}
      </text>
    </svg>
  </span>

{:else}
  <!-- Inline variant: ornamental marker for Mushaf/Standard continuous text -->
  <span class="ayah-inline {playing ? 'ayah-playing' : ''}" aria-label="Verse {number}">
    <svg width="1.8em" height="1.8em" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
      <!-- Vesica-piscis shape (two overlapping circles) -->
      <ellipse cx="20" cy="20" rx="18" ry="12" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
      <ellipse cx="20" cy="20" rx="12" ry="18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
      <!-- Inner circle -->
      <circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="1" fill="{playing ? '#FFD500' : 'none'}" opacity="0.9" />
      <!-- Decorative flourishes (left and right) -->
      <line x1="0" y1="20" x2="5" y2="20" stroke="currentColor" stroke-width="1" opacity="0.4" />
      <line x1="35" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1" opacity="0.4" />
      <!-- Small dots -->
      <circle cx="2" cy="20" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="38" cy="20" r="1" fill="currentColor" opacity="0.5" />
      <!-- Number -->
      <text x="20" y="20" text-anchor="middle" dominant-baseline="central"
        font-family="var(--font-ui, Inter, system-ui, sans-serif)"
        font-weight="900" font-size="10" fill="currentColor">
        {number}
      </text>
    </svg>
  </span>
{/if}

<style>
  .ayah-playing {
    color: var(--color-accent-yellow, #FFD500);
    filter: drop-shadow(0 0 4px rgba(255, 213, 0, 0.4));
  }

  .ayah-inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.15em;
    vertical-align: middle;
  }
</style>
