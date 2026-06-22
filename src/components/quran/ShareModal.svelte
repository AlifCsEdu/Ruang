<script lang="ts">
  import { onMount } from 'svelte';
  import type { Verse } from '../../lib/quran/types';

  interface Props {
    verse: Verse;
    surahName: string;
    surahArabicName: string;
    chapterNum: number;
    allVerses: Verse[];
    onClose: () => void;
  }

  let { verse, surahName, surahArabicName, chapterNum, allVerses, onClose }: Props = $props();

  let snippetMode = $state(false);
  let cardMode = $state(false);
  let snippetStart = $state(verse.number);
  let snippetEnd = $state(verse.number);
  let includeArabic = $state(true);
  let includeTranslation = $state(true);
  let includeTransliteration = $state(false);
  let toast = $state<string | null>(null);
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Card generation state
  let cardCanvas: HTMLCanvasElement | null = $state(null);
  let selectedTheme = $state(0);
  let cardGenerating = $state(false);
  let cardIncludeTranslation = $state(true);
  let cardIncludeTransliteration = $state(false);

  const cardThemes = [
    { name: 'Canvas', bg: '#F8F5F2', text: '#0D0D0D', accent: '#0038FF', border: '#0D0D0D', sub: 'rgba(13,13,13,0.6)' },
    { name: 'Electric', bg: '#0038FF', text: '#FFFFFF', accent: '#FFD500', border: '#0D0D0D', sub: 'rgba(255,255,255,0.75)' },
    { name: 'Sunrise', bg: '#FFD500', text: '#0D0D0D', accent: '#FF3366', border: '#0D0D0D', sub: 'rgba(13,13,13,0.55)' },
    { name: 'Ink', bg: '#0D0D0D', text: '#FFFFFF', accent: '#00C853', border: '#FFFFFF', sub: 'rgba(255,255,255,0.65)' },
    { name: 'Blush', bg: '#FF3366', text: '#FFFFFF', accent: '#FFD500', border: '#0D0D0D', sub: 'rgba(255,255,255,0.75)' },
    { name: 'Forest', bg: '#00C853', text: '#0D0D0D', accent: '#0038FF', border: '#0D0D0D', sub: 'rgba(13,13,13,0.55)' },
  ];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verseUrl = `${baseUrl}/quran/${chapterNum}#verse-${verse.number}`;
  const ref = `${surahName} (${surahArabicName}) ${verse.number}`;

  function getVerseText(v: Verse): string {
    const parts: string[] = [];
    const arabic = v.words?.map(w => w.text).join(' ') ?? v.text;
    const translit = v.words?.map(w => w.transliteration).filter(Boolean).join(' ') ?? '';
    const trans = v.translations?.[0]?.text ?? '';

    if (includeArabic) parts.push(arabic);
    if (includeTransliteration && translit) parts.push(translit);
    if (includeTranslation && trans) parts.push(trans);

    return parts.join('\n');
  }

  function buildShareText(): string {
    if (snippetMode) {
      const start = Math.min(snippetStart, snippetEnd);
      const end = Math.max(snippetStart, snippetEnd);
      const selectedVerses = allVerses.filter(v => v.number >= start && v.number <= end);
      const parts = selectedVerses.map(v => {
        const text = getVerseText(v);
        return `${text}\n— ${v.number}`;
      });
      const rangeLabel = start === end ? `${start}` : `${start}-${end}`;
      parts.push(`\n— ${surahName} (${surahArabicName}), Ayat ${rangeLabel}`);
      parts.push(`📖 ${baseUrl}/quran/${chapterNum}#verse-${start}`);
      return parts.join('\n\n');
    }

    const sections = [getVerseText(verse)];
    sections.push(`\n— ${ref}`);
    sections.push(`📖 ${verseUrl}`);
    return sections.join('\n');
  }

  function showToast(msg: string) {
    toast = msg;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast = null; }, 2000);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showToast('Copied to clipboard!');
    } catch {
      showToast('Failed to copy');
    }
  }

  async function nativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: ref, text: buildShareText(), url: verseUrl });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      await copyText();
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function shareTelegram() {
    const text = encodeURIComponent(buildShareText());
    const url = encodeURIComponent(verseUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // --- Card image generation ---
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function generateCard() {
    if (!cardCanvas) return;
    cardGenerating = true;
    const W = 1080, H = 1080;
    const pad = 80, border = 8, shadow = 12;
    cardCanvas.width = W;
    cardCanvas.height = H;
    const ctx = cardCanvas.getContext('2d');
    if (!ctx) { cardGenerating = false; return; }
    const theme = cardThemes[selectedTheme];

    // Outer shadow (hard offset, no blur — neo-brutalist signature)
    ctx.fillStyle = theme.border;
    ctx.fillRect(shadow + border, shadow + border, W - 2 * border, H - 2 * border);

    // Card border + fill
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W - shadow, H - shadow);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = border;
    ctx.strokeRect(border / 2, border / 2, W - shadow - border, H - shadow - border);

    const innerX = pad, innerW = W - shadow - 2 * pad;

    // Top accent badge
    const badgeH = 48;
    ctx.fillStyle = theme.accent;
    ctx.fillRect(innerX, pad, 220, badgeH);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(innerX, pad, 220, badgeH);
    ctx.fillStyle = theme.bg === '#FFD500' || theme.bg === '#F8F5F2' || theme.bg === '#00C853' ? '#0D0D0D' : '#FFFFFF';
    ctx.font = `900 22px 'Arial Black', 'Segoe UI Black', 'Helvetica', sans-serif`;
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    const rangeLabel = snippetMode ? `${Math.min(snippetStart, snippetEnd)}-${Math.max(snippetStart, snippetEnd)}` : `${verse.number}`;
    ctx.fillText(`AYAT ${rangeLabel}`, innerX + 110, pad + 32);

    // Surah name badge (right side)
    const surahLabel = `${surahName}`;
    ctx.font = `900 18px 'Arial Black', sans-serif`;
    const surahLabelW = Math.max(ctx.measureText(surahLabel).width + 32, 140);
    const surahLabelX = W - shadow - pad - surahLabelW;
    ctx.fillStyle = theme.border;
    ctx.fillRect(surahLabelX, pad, surahLabelW, badgeH);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(surahLabel, surahLabelX + surahLabelW / 2, pad + 32);

    // Arabic text
    const arabicText = verse.words?.map(w => w.text).join(' ') ?? verse.text;
    const textTop = pad + badgeH + 50;
    let arabicSize = 50;
    const arabicFont = (s: number) => `${s}px 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif`;
    ctx.font = arabicFont(arabicSize);
    let arabicLines = wrapText(ctx, arabicText, innerW - 20);
    while (arabicLines.length > 6 && arabicSize > 24) {
      arabicSize -= 3;
      ctx.font = arabicFont(arabicSize);
      arabicLines = wrapText(ctx, arabicText, innerW - 20);
    }
    const arabicLineH = arabicSize * 1.7;

    // Build optional content
    const translitText = verse.words?.map(w => w.transliteration).filter(Boolean).join(' ') ?? '';
    const transText = verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '') ?? '';
    let transLines: string[] = [];
    let transSize = 22;
    if (cardIncludeTranslation && transText) {
      const transFont = (s: number) => `${s}px 'Georgia', 'Segoe UI', serif`;
      ctx.font = transFont(transSize);
      transLines = wrapText(ctx, transText, innerW - 40);
      while (transLines.length > 4 && transSize > 16) {
        transSize -= 2;
        ctx.font = transFont(transSize);
        transLines = wrapText(ctx, transText, innerW - 40);
      }
    }
    let translitLines: string[] = [];
    if (cardIncludeTransliteration && translitText) {
      const translitFont = (s: number) => `italic ${s}px 'Georgia', serif`;
      ctx.font = translitFont(18);
      translitLines = wrapText(ctx, translitText, innerW - 40);
    }

    // Calculate vertical centering
    const totalTextH = arabicLines.length * arabicLineH + 40 + (translitLines.length > 0 ? translitLines.length * 26 + 24 : 0) + (transLines.length > 0 ? transLines.length * (transSize * 1.5) + 24 : 0);
    const availH = H - shadow - textTop - pad - 60;
    let startY = textTop + Math.max(0, (availH - totalTextH) / 2) + arabicSize * 0.4;

    // Draw Arabic
    ctx.fillStyle = theme.text;
    ctx.font = arabicFont(arabicSize);
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    for (const line of arabicLines) {
      ctx.fillText(line, (W - shadow) / 2, startY);
      startY += arabicLineH;
    }

    // Brutalist divider: thick colored bar
    startY += 16;
    ctx.fillStyle = theme.accent;
    ctx.fillRect((W - shadow) / 2 - 80, startY, 160, 6);
    ctx.fillStyle = theme.border;
    ctx.fillRect((W - shadow) / 2 - 80, startY + 6, 160, 3);
    startY += 32;

    // Draw transliteration (if enabled)
    if (translitLines.length > 0) {
      ctx.fillStyle = theme.sub;
      ctx.font = `italic 18px 'Georgia', serif`;
      ctx.direction = 'ltr';
      for (const line of translitLines) {
        ctx.fillText(line, (W - shadow) / 2, startY);
        startY += 26;
      }
      startY += 12;
    }

    // Draw translation (if enabled)
    if (transLines.length > 0) {
      ctx.fillStyle = theme.sub;
      ctx.font = `${transSize}px 'Georgia', 'Segoe UI', serif`;
      ctx.direction = 'ltr';
      for (const line of transLines) {
        ctx.fillText(line, (W - shadow) / 2, startY);
        startY += transSize * 1.5;
      }
    }

    // Bottom reference bar
    const refY = H - shadow - pad + 16;
    ctx.fillStyle = theme.border;
    ctx.fillRect(innerX, refY - 16, innerW, 44);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 18px 'Arial Black', sans-serif`;
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(`${surahName} (${surahArabicName})`, (W - shadow) / 2, refY + 8);

    // Watermark
    ctx.fillStyle = theme.text + '18';
    ctx.font = `900 14px 'Arial Black', sans-serif`;
    ctx.fillText(`RUANG \u2022 QURAN \u2022 ${chapterNum}:${rangeLabel}`, (W - shadow) / 2, H - shadow - 14);

    cardGenerating = false;
  }

  function downloadCard() {
    if (!cardCanvas) return;
    cardCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-${chapterNum}-${verse.number}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Card downloaded!');
    }, 'image/png');
  }

  async function shareCardImage() {
    if (!cardCanvas) return;
    cardCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `quran-${chapterNum}-${verse.number}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: ref });
        } catch { /* cancelled */ }
      } else {
        downloadCard();
      }
    }, 'image/png');
  }

  async function copyCardImage() {
    if (!cardCanvas) return;
    try {
      const blob = await new Promise<Blob | null>(r => cardCanvas!.toBlob(r, 'image/png'));
      if (blob && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Image copied to clipboard!');
      } else {
        showToast('Copy not supported — try Download');
      }
    } catch {
      showToast('Failed to copy image');
    }
  }

  // Re-generate card when card mode is activated or options change
  $effect(() => {
    if (cardMode && cardCanvas) {
      const _ = selectedTheme;
      const _t = cardIncludeTranslation;
      const _r = cardIncludeTransliteration;
      generateCard();
    }
  });
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-[9998] bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4"
  onclick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-label="Share verse"
>
  <!-- Panel -->
  <div class="border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] w-full max-w-md animate-brutal-pop max-h-[85vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b-4 border-ink">
      <h3 class="font-black text-sm uppercase tracking-wider">📤 Share Verse</h3>
      <button
        onclick={onClose}
        class="w-7 h-7 border-2 border-ink flex items-center justify-center text-xs font-black hover:bg-accent-pink hover:text-white transition-colors"
        aria-label="Close"
      >✕</button>
    </div>

    <div class="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
      <!-- Verse reference -->
      <div class="flex items-center gap-2 p-2 bg-canvas border-2 border-ink/20">
        <span class="font-black text-lg tabular-nums">{verse.number}</span>
        <div class="text-xs">
          <p class="font-black">{surahName}</p>
          <p class="text-ink/50 font-bold">{surahArabicName}</p>
        </div>
      </div>

      <!-- Snippet mode toggle -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          onclick={() => { snippetMode = !snippetMode; if (snippetMode) cardMode = false; }}
          class="chip-brutal transition-colors {snippetMode ? 'bg-accent-blue text-white' : 'bg-white'}"
        >{snippetMode ? '✓ Verse Range' : '📝 Verse Range'}</button>
        <button
          onclick={() => { cardMode = !cardMode; if (cardMode) snippetMode = false; }}
          class="chip-brutal transition-colors {cardMode ? 'bg-accent-pink text-white' : 'bg-white'}"
        >{cardMode ? '✓ Image Card' : '🎨 Image Card'}</button>
      </div>

      {#if snippetMode}
        <!-- Verse range selector -->
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <label class="text-[10px] font-black uppercase tracking-wider text-ink/50 block mb-1">From</label>
            <input
              type="number"
              min={1}
              max={allVerses.length}
              bind:value={snippetStart}
              class="input-brutal w-full text-sm !py-1.5 !px-2 !shadow-none"
            />
          </div>
          <span class="text-lg font-black text-ink/30 mt-4">—</span>
          <div class="flex-1">
            <label class="text-[10px] font-black uppercase tracking-wider text-ink/50 block mb-1">To</label>
            <input
              type="number"
              min={1}
              max={allVerses.length}
              bind:value={snippetEnd}
              class="input-brutal w-full text-sm !py-1.5 !px-2 !shadow-none"
            />
          </div>
        </div>
      {/if}

      <!-- Card mode: theme selector + preview -->
      {#if cardMode}
        <!-- Theme swatches -->
        <div>
          <p class="text-[10px] font-black uppercase tracking-wider text-ink/50 mb-1.5">Card Theme:</p>
          <div class="flex items-center gap-2 flex-wrap">
            {#each cardThemes as theme, i}
              <button
                onclick={() => (selectedTheme = i)}
                class="w-9 h-9 border-4 transition-all {selectedTheme === i ? 'border-ink shadow-[3px_3px_0px_0px_#0D0D0D] scale-110' : 'border-ink/20 opacity-70 hover:opacity-100'}"
                style="background: {theme.bg};"
                title={theme.name}
              ></button>
            {/each}
            <span class="text-[10px] font-bold text-ink/50 ml-1">{cardThemes[selectedTheme].name}</span>
          </div>
        </div>

        <!-- Canvas preview -->
        <div class="flex justify-center">
          <canvas
            bind:this={cardCanvas}
            class="max-w-full border-2 border-ink/20 shadow-[4px_4px_0px_0px_#0D0D0D]"
            style="aspect-ratio: 1; max-height: 300px; max-width: 300px;"
          ></canvas>
        </div>

        <!-- Card content toggles -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-black uppercase tracking-wider text-ink/50 mr-1">Include:</span>
          <button
            onclick={() => (cardIncludeTranslation = !cardIncludeTranslation)}
            class="chip-brutal text-[9px] {cardIncludeTranslation ? 'bg-accent-green text-white' : 'bg-white'}"
          >Translation</button>
          <button
            onclick={() => (cardIncludeTransliteration = !cardIncludeTransliteration)}
            class="chip-brutal text-[9px] {cardIncludeTransliteration ? 'bg-accent-green text-white' : 'bg-white'}"
          >Rumi</button>
        </div>

        <!-- Card actions -->
        <div class="flex gap-2 flex-wrap">
          <button
            onclick={copyCardImage}
            class="flex-1 btn-brutal-sm text-xs bg-accent-blue text-white border-ink flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11V3a1 1 0 011-1h8"/></svg>
            Copy Image
          </button>
          <button
            onclick={downloadCard}
            class="flex-1 btn-brutal-sm text-xs bg-accent-pink text-white border-ink flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"/></svg>
            Download
          </button>
          <button
            onclick={shareCardImage}
            class="flex-1 btn-brutal-sm text-xs bg-accent-green text-white border-ink flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="3" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="12" cy="13" r="2"/><line x1="5.7" y1="9" x2="10.3" y2="12"/><line x1="10.3" y1="4" x2="5.7" y2="7"/></svg>
            Share
          </button>
        </div>
      {/if}

      <!-- Format options (for text sharing) -->
      {#if !cardMode}
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[10px] font-black uppercase tracking-wider text-ink/50 mr-1">Include:</span>
        <button
          onclick={() => (includeArabic = !includeArabic)}
          class="chip-brutal text-[9px] {includeArabic ? 'bg-accent-green text-white' : 'bg-white'}"
        >Arabic</button>
        <button
          onclick={() => (includeTranslation = !includeTranslation)}
          class="chip-brutal text-[9px] {includeTranslation ? 'bg-accent-green text-white' : 'bg-white'}"
        >Translation</button>
        <button
          onclick={() => (includeTransliteration = !includeTransliteration)}
          class="chip-brutal text-[9px] {includeTransliteration ? 'bg-accent-green text-white' : 'bg-white'}"
        >Rumi</button>
      </div>
      {/if}

      <!-- Quick preview (text mode only) -->
      {#if !cardMode}
      <div class="p-2.5 bg-canvas/50 border-2 border-ink/10 max-h-28 overflow-y-auto">
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-1">Preview:</p>
        <pre class="text-[10px] text-ink/60 whitespace-pre-wrap font-[family-name:var(--font-ui)] leading-relaxed">{buildShareText()}</pre>
      </div>
      {/if}

      <!-- Share platforms grid -->
      <div class="grid grid-cols-3 gap-2">
        <button
          onclick={shareWhatsApp}
          class="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-ink bg-[#25D366] text-white font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#0D0D0D]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.584-1.453A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.822-6.34-2.197l-.442-.353-3.16 1.003 1.038-3.07-.387-.47A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          WhatsApp
        </button>

        <button
          onclick={shareTelegram}
          class="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-ink bg-[#0088CC] text-white font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#0D0D0D]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          Telegram
        </button>

        <button
          onclick={nativeShare}
          class="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-ink bg-accent-yellow font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#0D0D0D]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
          More
        </button>
      </div>

      <!-- Copy actions -->
      <div class="flex gap-2 border-t-2 border-ink/10 pt-3">
        <button
          onclick={copyText}
          class="flex-1 btn-brutal-sm text-xs bg-accent-green text-white border-ink flex items-center justify-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11V3a1 1 0 011-1h8"/></svg>
          Copy {snippetMode ? 'Snippet' : 'Verse'}
        </button>
        <button
          onclick={() => { navigator.clipboard?.writeText(verseUrl); showToast('Link copied!'); }}
          class="btn-brutal-sm text-xs flex items-center justify-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 10l4-4"/><path d="M8.5 5.5l1.76-1.76a2.5 2.5 0 0 1 3.54 3.54L12 9.04"/><path d="M7.5 10.5L5.74 12.26a2.5 2.5 0 0 1-3.54-3.54L4 6.96"/></svg>
          Copy Link
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Toast notification -->
{#if toast}
  <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] border-4 border-ink bg-accent-yellow px-4 py-2 shadow-[4px_4px_0px_0px_#0D0D0D] animate-slide-up">
    <p class="font-black text-xs uppercase tracking-wider">{toast}</p>
  </div>
{/if}
