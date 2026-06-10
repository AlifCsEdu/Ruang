# 📖 Project Ruang - Master Blueprint (V5 - Standard Web Layout)

## 1. Core Philosophy & Target Audience
- **Concept:** A high-performance, all-in-one Muslim web application. It uses a **standard, accessible web layout** (not a fake OS) but feels like a native app due to instant routing and zero-JS defaults.
- **Target Audience:** Malaysian Muslims. Culturally relevant, highly accurate, and localized.
- **The "McMaster" Standard:** Sub-second load times. Zero layout shifts. Instant interactions. 
- **Navigation:** Standard web routing (`/solat`, `/quran`, `/duas`) utilizing **Astro ViewTransitions** for instant, app-like page morphing without full reloads or white flashes.

## 2. The Bleeding-Edge Tech Stack
- **Framework:** Astro 5 (Utilize Content Layer API and ViewTransitions).
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` for instant HMR and CSS-first `@theme` config).
- **Interactivity:** Svelte 5 (Using Runes: `$state`, `$derived` ONLY for specific interactive widgets like Tasbih or Audio Players).
- **Database/Edge:** Turso (LibSQL) + Cloudflare Pages (Edge rendering).

## 3. Design System: "Vibrant Neo-Brutalism Web"
*NO traditional Islamic green/gold. NO gradients. NO blur. NO soft drop-shadows.*

### 🎨 Color Palette (Tailwind v4 `@theme` tokens)
- **Canvas:** `#F8F5F2` (Paper White - main background)
- **Ink:** `#0D0D0D` (True Black - used for all borders and primary text)
- **Accent 1 (Primary/Links):** `#0038FF` (Electric Blue)
- **Accent 2 (Highlights/Tags):** `#FFD500` (Cyber Yellow)
- **Accent 3 (Interactive/Alerts):** `#FF3366` (Vibrant Pink)
- **Accent 4 (Success/Completed):** `#00C853` (Neon Green)

### 🧱 Standard Web Layout & UI Rules
- **The Layout Structure:** 
  - **Desktop:** Sticky Top Navbar + Left Sidebar for main navigation + Main Content Area.
  - **Mobile:** Top Navbar + Bottom Navigation Bar (Thumb-zone optimized) + Main Content.
- **Cards & Containers:** 
  - **Border:** `border-4 border-[#0D0D0D]`
  - **Shadow:** `shadow-[8px_8px_0px_0px_#0D0D0D]` (Hard, offset, no blur).
- **Physical Buttons:** 
  - **Base:** `border-4 border-[#0D0D0D] bg-white font-bold`
  - **Active Press:** `active:translate-x-1 active:translate-y-1 active:shadow-none` (Crucial for mobile touch feedback).

### 📦 UI Component Strategy (HyperUI & Neobrutalism)
1. **HyperUI (Neobrutalism):** This is pure HTML/Tailwind. Use their standard web components (Navbars, Footers, Cards, Accordions, Forms) and copy them directly into `.astro` files.
2. **Neobrutalism Components:** React-based. **DO NOT INSTALL.** Extract the CSS logic and rebuild them natively in Astro.
3. **Accessibility (a11y):** Ensure all text on vibrant accent backgrounds passes WCAG AAA. Use thick 3px black focus rings (`focus:outline-none focus:ring-4 focus:ring-[#0038FF]`) for keyboard navigation.

## 4. Features & Data Engineering (APIs)

### 🕌 Waktu Solat (Malaysian Context)
- **Source:** `api.waktusolat.app` (JAKIM e-Solat).
- **Logic:** Fetch based on user's selected Zone (e.g., SGR01). 
- **Edge Caching:** Cache the JAKIM zone list and daily prayer times at the Cloudflare Edge (`s-maxage=86400`).
- **Offline Fallback:** Store the current day's prayer times in `localStorage`.
- **UI:** A prominent Neo-Brutalist "Next Prayer" countdown card on the Homepage dashboard.

### 📖 Al-Quran & 📚 Hadith
- **Quran:** Quran.com API v4. Word-by-word Malay/English, Transliteration, Audio. 
- **Hadith:** Sunnah.com API. 
- **Duas:** Static JSON (Hisnul Muslim) loaded via Astro 5 Content Layer API.
- **UI:** High-contrast Neo-Brutalist Ayah/Hadith cards. Proper `dir="rtl"` and Tajweed line-heights.

### 🛠️ Utilities
- **Tasbih:** Svelte 5 Island. Haptic feedback, saves count to IndexedDB.
- **Prayer Tracker:** Visual Neo-Brutalist calendar grid showing 5 daily Solat streaks.
- **Hijri Calendar:** Synced to Malaysian official Hijri dates.

## 5. The "McMaster" Performance Rules
1. **Core Web Vitals:** LCP < 1.0s, CLS = 0, INP < 50ms.
2. **Astro View Transitions:** Use `<meta name="view-transition" content="same-origin" />` and `transition:name` attributes to make standard web navigation feel like a native app.
3. **Font Strategy:** Subset Arabic fonts. Use `font-display: swap` for UI fonts.
4. **Zero HTTP Icons:** Use inline SVGs for all UI icons. Do not use FontAwesome.