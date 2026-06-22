# Quran Reader Gold Standard Overhaul

## Context

The previous 17-task plan has been fully implemented. The Quran reader now has night mode, ornamental ayah markers, mushaf overhaul, word-by-word audio, keyboard shortcuts, copy/share, reading progress, and tajweed night colors. However, several critical issues remain and the overall UI/UX still falls short of premium Quran apps like quran.com and quranwbw.com. This plan addresses: a settings modal z-index bug, missing per-word audio in Standard/Mushaf modes, UI polish, and new QoL features.

---

## Phase 1: Critical Fixes (P0)

### Task 1: Settings Modal Z-Index Fix

**Problem:** The `QuranSettings` dropdown (`z-30`) is trapped inside the controls-bar's `z-10` stacking context, causing it to render behind verse content.

**Files:** `src/components/quran/QuranSettings.svelte`, `src/styles/global.css`

**Approach:** Convert the dropdown from `absolute` positioning to a **fixed-position modal overlay** that escapes all parent stacking contexts.

- Replace `absolute top-full mt-2 right-0 z-30` dropdown with a two-layer fixed overlay:
  - Backdrop: `fixed inset-0 z-[60] bg-ink/20` — click to close
  - Panel: `fixed z-[61]` — bottom-sheet on mobile (full-width, fixed bottom), centered modal on desktop (max-w-lg)
- Add Escape key handler to close
- Maintain neo-brutalist styling: `border-4 border-ink shadow-[8px_8px_0px_0px_#0D0D0D]`
- Add `animate-slide-up` for mobile entry, `animate-brutal-pop` for desktop entry
- Add `.settings-backdrop` CSS class with fade-in transition in global.css

**Verification:**
- Settings panel appears above all verse content
- Scrolling page does not move the settings panel
- Escape key and backdrop click both close the panel
- Mobile (375px): renders as bottom sheet
- Desktop (1280px): renders as centered modal

---

### Task 2: Per-Word Audio in Standard Mode

**Problem:** In Standard mode, Arabic text is rendered as a single text block. Individual words are not clickable.

**Files:** `src/components/quran/SurahReader.svelte`, `src/styles/global.css`

**Approach:** Render each word as an inline `<button>` styled to appear as continuous text.

- Replace Standard mode Arabic text block (lines ~815-822) with per-word iteration:
  - When `verse.words?.length && scriptType !== 'tajweed'` → iterate words as `<button class="word-clickable">`
  - When `scriptType === 'tajweed'` → keep `{@html verse.text_tajweed}` (tajweed HTML has embedded color spans that can't merge with word spans)
  - Fallback → `{getScriptText(verse)}`
- Add `.word-clickable` CSS: `display: inline; padding: 0; margin: 0; border: none; background: none; font: inherit; color: inherit;` + hover highlight + focus-visible outline + night mode override
- Existing `handleWordClick` function handles audio playback + tooltip — no changes needed

**Verification:**
- Standard mode (uthmani): click any word → hear audio, see tooltip with translation
- Standard mode (tajweed): text renders with correct colors (word click unavailable — acceptable)
- Word highlight (yellow glow) appears on playing word

---

### Task 3: Per-Word Audio in Mushaf Mode

**Files:** `src/components/quran/SurahReader.svelte`

**Approach:** Apply the same per-word span pattern from Task 2 to the Mushaf mode text block (lines ~719-731).

- Within each `<span id="mushaf-verse-{verse.number}">`, iterate `verse.words` as `<button class="word-clickable">` when not in tajweed mode
- Same tajweed exception and same `handleWordClick` handler

**Verification:**
- Mushaf mode: click any word → hear audio, see tooltip
- Word spacing and line-height remain natural for continuous reading

---

## Phase 2: UI/UX Refinement (P1)

### Task 4: Controls Bar Responsive Restructure

**File:** `src/components/quran/SurahReader.svelte` (lines 563-647)

- Split into two tiers: **Primary row** (always visible): display mode + translation/rumi + settings. **Secondary row** (collapsible on mobile): night mode + play all + WBW + info badge
- Add `showMoreControls` state toggle with "..." chip button on mobile
- On desktop (`sm:`): both rows always visible

---

### Task 5: Audio Player Responsive Layout

**File:** `src/components/quran/AudioPlayer.svelte` (lines 183-280)

- Mobile: transport controls only (prev/play/stop/next) + verse number + close
- Desktop (`sm:`): full controls (speed, volume, repeat, auto-advance)
- Collapsible "Advanced" toggle on mobile for extra controls

---

### Task 6: Verse Card Visual Hierarchy Enhancement

**Files:** `src/styles/global.css`, `src/components/quran/SurahReader.svelte`

- Dedicated verse number gutter area for AyahMarker badge
- Increase Arabic section padding for breathing room
- Subtle hover state enhancement
- Night mode card border visibility

---

### Task 7: Loading Skeleton States

**File:** `src/components/quran/SurahReader.svelte` (lines 657-663), `src/styles/global.css`

- Replace pulsing text with 4 skeleton verse cards
- Shimmer animation backgrounds matching verse card dimensions
- `.skeleton-verse` CSS class with `animate-shimmer`

---

### Task 8: Mushaf Mode Ornamental Polish

**File:** `src/styles/global.css` (mushaf styles, lines 418-457)

- Move inline-styled `.mushaf-surah-header` to proper CSS class
- Add margin rule lines (left/right borders)
- Improve corner ornaments with accent-yellow intersection dots
- Night mode ornament visibility

---

### Task 9: Display Mode Transition Polish

**File:** `src/components/quran/SurahReader.svelte`

- Keep `{#key displayMode}` for clean state reset
- Add `.mode-enter` CSS class for smoother opacity+transform entrance

---

## Phase 3: Quality of Life Features (P2)

### Task 10: Bookmark Tags & Enhanced Management

**Files:** `src/lib/quran/bookmarks.ts`, `src/components/quran/BookmarksPanel.svelte`

- Add `tags?: string[]` to Bookmark interface ("memorize", "reflect", "tafsir")
- Tag filter chips, sort options (date, surah number)
- Export bookmarks as JSON download
- `getBookmarksByTag()` and `getReadingStats()` helpers

---

### Task 11: In-Surah Verse Search

**File:** `src/components/quran/SurahReader.svelte`

- Search input in secondary controls row
- Search through translations and Arabic text
- Highlight matches with existing `.search-highlight` class
- Match count badge, auto-scroll to first match

---

### Task 12: Reading Progress Per-Surah Tracking

**Files:** `src/lib/quran/bookmarks.ts`, `src/components/quran/QuranBrowser.svelte`

- `ReadingProgress` interface: surah, totalVerses, versesRead, completedAt
- Store in localStorage `ruang_quran_reading_progress`
- Progress bars on surah cards in QuranBrowser
- "X of 114 surah completed" summary

---

### Task 13: Keyboard Shortcuts Help Modal

**File:** `src/components/quran/SurahReader.svelte`

- `?` key opens shortcuts reference overlay
- Clean grid layout of all shortcuts
- Same fixed modal pattern as settings (Task 1)

---

### Task 14: Enhanced Copy Verse Format

**File:** `src/components/quran/SurahReader.svelte`

- Include transliteration, translator name, Juz info
- Source attribution line: "via Ruang"

---

### Task 15: Cross-Surah Quick Navigation

**File:** `src/pages/quran/[surah].astro`

- Surah quick-jump dropdown or number input in navigation bar
- Compact chip-brutal select styling

---

## Files Summary

| File | Tasks |
|------|-------|
| `src/components/quran/QuranSettings.svelte` | 1 |
| `src/components/quran/SurahReader.svelte` | 2, 3, 4, 6, 7, 9, 11, 13, 14 |
| `src/components/quran/AudioPlayer.svelte` | 5 |
| `src/styles/global.css` | 1, 2, 6, 7, 8 |
| `src/lib/quran/bookmarks.ts` | 10, 12 |
| `src/components/quran/BookmarksPanel.svelte` | 10 |
| `src/components/quran/QuranBrowser.svelte` | 12 |
| `src/pages/quran/[surah].astro` | 15 |

## Execution Order

```
Phase 1 (Critical):  Tasks 1-3   — settings z-index fix, per-word audio Standard+Mushaf
Phase 2 (Polish):    Tasks 4-9   — controls restructure, audio responsive, verse cards, skeletons, mushaf polish, transitions
Phase 3 (Features):  Tasks 10-15 — bookmark tags, search, reading progress, shortcuts help, copy enhance, quick-nav
```

## Verification

1. `npx astro build` passes cleanly (exit code 0)
2. **Settings modal:** Opens above content, Escape/backdrop-click closes, mobile bottom-sheet / desktop centered
3. **Per-word audio (Standard):** Click any word in uthmani/indopak → audio plays + tooltip; tajweed renders colors
4. **Per-word audio (Mushaf):** Same as Standard, natural reading flow preserved
5. **Controls bar:** Primary row always visible, secondary collapsible on mobile
6. **Audio player:** Clean mobile layout (transport only), full layout on desktop
7. **Skeleton loaders:** Shimmer animation during loading, match verse card dimensions
8. **Bookmarks:** Tag filter works, sort works, export downloads JSON
9. **Search:** Keyword → matching verses highlighted, count shown, first match scrolled to
10. **Keyboard shortcuts:** `?` opens help modal, all shortcuts functional
11. **Night mode:** All new elements properly themed
12. **Mobile (375px):** All features usable, no overflow, proper touch targets