# Ruang — Phase 3: Major Feature Expansion

## Context
The app works but key features are incomplete or missing. Audio playback barely works (no volume/speed/seek), translation doesn't show in standard view, only 4 reciters, no font options, zone selector is buried at the bottom of the prayer grid, settings page is minimal. This plan addresses all user-requested features plus additional improvements.

---

## Task 1: Fix Translation in Standard View
**Bug**: `verse.translations[0].text` renders empty in standard mode.

**Files**: `src/pages/api/quran/[chapter].ts`, `src/components/quran/SurahReader.svelte`

- Filter out empty translations in `mapVerse()`: `.filter(t => String(t.text ?? '').trim().length > 0)`
- Capture `language_name` from API response instead of hardcoding `'en'`
- Add fallback UI when translations array is empty ("No translation available")
- Debug: verify API returns non-empty translation text for the configured resource IDs

---

## Task 2: Expand Reciters to 11
**File**: `src/lib/quran/constants.ts`

Add 7 popular reciters (all confirmed valid QuranCDN IDs):
| ID | Name | Style |
|----|------|-------|
| 5 | Hani Ar-Rifai | - |
| 8 | Maher Al-Muaiqly | - |
| 9 | Mahmoud Khalil Al-Husary | - |
| 10 | Mohamed Siddiq Al-Minshawi | Mujawwad |
| 12 | Saad Al-Ghamdi | - |
| 161 | Yasser Al-Dosari | - |
| 168 | Ahmad Al-Ajmi | - |

Existing 4 (7,1,3,4) kept. Total: 11.

---

## Task 3: Font Size Controls
**Files**: `constants.ts`, `QuranSettings.svelte`, `SurahReader.svelte`

- Add constants: `FONT_SIZE_MIN=1.25`, `FONT_SIZE_MAX=3.5`, `FONT_SIZE_DEFAULT=1.75`, `FONT_SIZE_STEP=0.25` (rem)
- localStorage key: `ruang_quran_font_size`
- Range slider in QuranSettings with current value display
- SurahReader reads fontSize state, applies as inline `style="font-size: {fontSize}rem"` on Arabic text containers (overrides `.arabic-text` CSS)

---

## Task 4: Font Styles — Uthmani, IndoPak, Tajweed
**Files**: `src/pages/api/quran/[chapter].ts`, `types.ts`, `constants.ts`, `QuranSettings.svelte`, `SurahReader.svelte`, `global.css`

- API: Accept `script` query param — `uthmani` → `text_uthmani`, `indopak` → `text_indopak`, `tajweed` → `text_uthmani_tajweed`
- Tajweed parsing: Replace `<tajweed class=X>` with `<span class="tajweed-X">` in mapVerse
- Types: Add `ScriptType = 'uthmani' | 'indopak' | 'tajweed'`
- SurahReader: conditionally render correct text field based on scriptType; tajweed uses `{@html}` for span tags
- global.css: 10+ tajweed color classes (ham_wasl, madda_normal, ghunnah, qalaqah, ikhafa, idgham, etc.)
- localStorage key: `ruang_quran_script_type`

---

## Task 5: Full-Featured Audio Player
**New file**: `src/components/quran/AudioPlayer.svelte` (~250 lines)
**Modified**: `SurahReader.svelte`, `types.ts`, `constants.ts`, `global.css`

**AudioPlayer component** (fixed bottom bar above nav):
- Play/Pause, Stop, Previous/Next verse buttons
- Seek progress bar (range slider bound to audio currentTime/duration)
- Volume slider (persisted to `ruang_quran_volume`)
- Speed control cycling `[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]` (persisted to `ruang_quran_speed`)
- Repeat verse toggle, Auto-advance toggle
- Current verse number display
- Time display: current/total
- Neo-brutalist design: `border-t-4 border-ink`, `shadow-[0_-4px_0_0_#0D0D0D]`

**SurahReader changes**:
- Remove inline audio bar (lines 404-441) and inline `<audio>` element
- Add AudioPlayer component
- Add `id="verse-{number}"` to verse cards for scroll-to-verse during playback
- `$effect` to auto-scroll to currently playing verse
- Word-by-word audio: click word → `new Audio(word.audio_url).play()`

**AudioState expansion**: Add `repeatVerse`, `volume`, `speed` fields

---

## Task 6: Enhanced Word-by-Word Interaction
**Files**: `SurahReader.svelte`, `QuranSettings.svelte`, `types.ts`

- **Click/Tap**: Play word audio (`word.audio_url`) + show tooltip, auto-dismiss after 3s
- **Hover (desktop)**: Show translation + transliteration tooltip (keep existing)
- **Long press (mobile)**: Show tooltip (via touchstart/touchend timing)
- **Below-word display config**: `wordBelowDisplay: 'none' | 'translation' | 'transliteration' | 'both'`
  - localStorage key: `ruang_quran_word_below`
  - Settings selector in QuranSettings
  - Applied in word-by-word template rendering

---

## Task 7: Mushaf (Continuous Reading) Mode
**Files**: `types.ts`, `SurahReader.svelte`, `global.css`

- Extend `VerseDisplayMode` with `'mushaf'`
- Add "Mushaf" button to display mode toggle (Standard / Perkataan / Mushaf)
- Mushaf template: flowing Arabic text without verse card boundaries, verse number markers `﴿{n}﴾` inline
- Optional translation block below full Arabic text
- CSS: `.mushaf-container`, `.mushaf-text` (line-height: 3, text-align: justify), `.verse-number-marker` (circular blue border)
- localStorage key: `ruang_quran_display_mode` (default: 'standard')

---

## Task 8: Multi-Bookmark Management Panel
**New file**: `src/components/quran/BookmarksPanel.svelte` (~120 lines)
**Modified**: `bookmarks.ts`, `QuranBrowser.svelte`

- Bookmarks panel on Quran index page showing all bookmarks
- Each bookmark card: surah name, ayah, note (editable), delete button, "Go" navigation link
- Add `updateBookmarkNote()`, `clearAllBookmarks()`, `getBookmarkCount()` to bookmarks.ts
- "Clear All" button with confirmation
- Differentiate from "Last Read" (single position, already implemented)

---

## Task 9: Zone Selector Relocation (Waktu Solat)
**New file**: `src/components/solat/ZoneHeader.svelte` (~120 lines)
**Modified**: `solat/index.astro`, `PrayerDashboard.svelte`

- Create prominent ZoneHeader card above prayer grid in solat page
- Layout: `📍 Zon Semasa` label + zone name + zone code badge + ZoneSelector dropdown + Imsak time
- Remove ZoneSelector from PrayerDashboard (line 639), replace with simple Imsak text line
- Zone changes propagate via existing `solat-settings-changed` event listener in PrayerDashboard

---

## Task 10: Auto-Detect Location
**Files**: `geolocation.ts`, `PrayerDashboard.svelte`, `SettingsPage.svelte`

- Extend `geolocation.ts`:
  - `autoDetectOnce()`: one-shot with `maximumAge: 600000` (10min cache)
  - `startAutoDetect(callback)`: uses `watchPosition()` with low-power config, throttles callbacks to 30min intervals, returns cleanup function
  - Add `maximumAge` parameter to existing `requestLocation()`
- PrayerDashboard: on mount, if `settings.autoDetectLocation`, call `autoDetectOnce()`, update zone if changed
- Settings toggle: "Auto-Kesan Lokasi" in Solat tab of Settings page
- Graceful fallback: keep last known zone on failure, show subtle notification
- The `autoDetectLocation` field already exists in `SolatSettings` type but is unused — wire it up

---

## Task 11: Expanded Settings Page
**Files**: `SettingsPage.svelte`, `SolatSettings.svelte`

### 11a: Flatten SolatSettings embedding
- Add `embedded` prop to SolatSettings — when true, skip expand/collapse header and sub-tabs
- Show sunnah + advanced sections stacked directly

### 11b: Quran tab expansion
Add after existing reciter/translation pickers:
- Font script selector (Uthmani/IndoPak/Tajweed)
- Font size slider
- Word-by-word below-display preference
- Audio playback defaults (speed, auto-advance toggle, volume slider)
- Default display mode (Standard/Perkataan/Mushaf)

### 11c: Display tab expansion
- Language toggle (Malay/English) — persist preference, translate Settings page labels initially
- Data management section: Clear cache, Reset all settings, Export/Import preferences as JSON
- About section (version, credits)

### 11d: New "Umum" (General) tab
- Default startup page selector (Solat/Quran/Dashboard)
- Reduced motion toggle → adds `data-reduced-motion` attribute + CSS override

---

## Task 12: Build and Verification
- `npx astro build` — zero errors
- Visual verification of all pages: `/quran/3`, `/quran`, `/settings`, `/solat`
- Test audio player: play, pause, seek, volume, speed, auto-advance
- Test font switches: Uthmani → IndoPak → Tajweed
- Test bookmarks: add, edit note, delete, navigate
- Test zone selector in new position
- Test auto-detect location

---

## Implementation Order
```
Task 1: Fix Translation Bug (blocker)
Task 2: Expand Reciters (quick win)
Task 3: Font Size Controls
Task 4: Font Styles + Tajweed
Task 5: Full Audio Player (largest effort)
Task 6: Enhanced Word-by-Word
Task 7: Mushaf Mode
Task 8: Bookmarks Panel
Task 9: Zone Selector Relocation
Task 10: Auto-Detect Location
Task 11: Settings Page Expansion
Task 12: Build & Verify
```

## New Files
| File | Purpose |
|------|---------|
| `src/components/quran/AudioPlayer.svelte` | Full audio player component |
| `src/components/quran/BookmarksPanel.svelte` | Bookmark management panel |
| `src/components/solat/ZoneHeader.svelte` | Prominent zone header card |

## Key Modified Files
| File | Changes |
|------|---------|
| `SurahReader.svelte` | All Quran features: modes, fonts, audio integration, word interaction |
| `QuranSettings.svelte` | Expand from 2 to 6 settings sections |
| `SettingsPage.svelte` | New General tab, expanded Quran/Display tabs, data management |
| `PrayerDashboard.svelte` | Remove zone selector, add auto-detect on mount |
| `[chapter].ts` (API) | Script type param, tajweed parsing, translation fix |
| `constants.ts` | 11 reciters, font options, speed options, new localStorage keys |
| `types.ts` | ScriptType, expanded AudioState, Mushaf mode |
| `geolocation.ts` | Auto-detect with watchPosition |
| `global.css` | Tajweed colors, mushaf styles, audio player styles |
