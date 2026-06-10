<script lang="ts">
  import { onMount } from 'svelte';
  import type { CalendarDay } from '../../lib/hijri/calendar-utils';
  import { generateMonthGrid, prevMonth, nextMonth, getMonthName, DAY_NAMES } from '../../lib/hijri/calendar-utils';
  import { gregorianToHijri } from '../../lib/hijri/hijri';
  import { getIslamicHolidaysForYear, getGregorianHolidaysForYear, type CalendarEvent } from '../../lib/hijri/malaysian-holidays';
  import DayDetail from './DayDetail.svelte';

  const today = new Date();
  let year = $state(today.getFullYear());
  let month = $state(today.getMonth() + 1);
  let grid = $state<CalendarDay[]>([]);
  let selectedDay = $state<CalendarDay | null>(null);
  let viewMode = $state<'gregorian' | 'hijri'>('gregorian');

  let todayHijri = $state(gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate()));

  // Upcoming holidays: combine Gregorian + Islamic for current & next year
  let upcomingHolidays = $derived.by(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const allHolidays: { date: Date; event: CalendarEvent }[] = [];

    // Gregorian holidays for current + next year
    for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
      allHolidays.push(...getGregorianHolidaysForYear(y));
    }
    // Islamic holidays for current + next year
    for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
      allHolidays.push(...getIslamicHolidaysForYear(y));
    }

    // Filter: past 7 days to future 90 days
    const past = new Date(now);
    past.setDate(past.getDate() - 7);
    const future = new Date(now);
    future.setDate(future.getDate() + 90);

    return allHolidays
      .filter((h) => h.date >= past && h.date <= future)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  function formatHolidayDate(d: Date): string {
    return d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function isPast(d: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  }

  function isTodayDate(d: Date): boolean {
    return d.toDateString() === new Date().toDateString();
  }

  $effect(() => {
    grid = generateMonthGrid(year, month);
  });

  function goBack() {
    const prev = prevMonth(year, month);
    year = prev.year;
    month = prev.month;
    selectedDay = null;
  }

  function goForward() {
    const next = nextMonth(year, month);
    year = next.year;
    month = next.month;
    selectedDay = null;
  }

  function goToday() {
    year = today.getFullYear();
    month = today.getMonth() + 1;
    selectedDay = null;
  }

  function selectDay(day: CalendarDay) {
    selectedDay = day;
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Today's Hijri Date Banner -->
  <div class="card-brutal text-center bg-accent-green/10">
    <p class="text-sm font-bold text-ink/60 uppercase tracking-wider">Today</p>
    <p class="font-black text-2xl sm:text-3xl my-1">{todayHijri.day} {todayHijri.monthName}</p>
    <p class="arabic-text text-lg sm:text-xl" dir="rtl" style="line-height: 1.8;">{todayHijri.day} {todayHijri.monthNameAr} {todayHijri.year}هـ</p>
    <p class="text-xs text-ink/50 font-bold mt-1">
      {today.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>

  <!-- Calendar Controls -->
  <div class="card-brutal">
    <!-- Navigation -->
    <div class="flex items-center justify-between mb-4 border-b-4 border-ink pb-3">
      <button
        onclick={goBack}
        class="btn-brutal-sm text-xs"
        aria-label="Previous month"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      <div class="text-center">
        <h2 class="font-black text-lg sm:text-xl uppercase tracking-wider">{getMonthName(month)} {year}</h2>
        <button
          onclick={goToday}
          class="text-[10px] font-bold text-accent-blue underline mt-0.5"
        >Today</button>
      </div>

      <button
        onclick={goForward}
        class="btn-brutal-sm text-xs"
        aria-label="Next month"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <!-- View Toggle -->
    <div class="flex border-2 border-ink mb-3">
      <button
        onclick={() => (viewMode = 'gregorian')}
        class="flex-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-75
               {viewMode === 'gregorian' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Gregorian</button>
      <button
        onclick={() => (viewMode = 'hijri')}
        class="flex-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75
               {viewMode === 'hijri' ? 'bg-accent-green text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Hijri Primary</button>
    </div>

    <!-- Day Headers -->
    <div class="grid grid-cols-7 gap-0.5 mb-1">
      {#each DAY_NAMES as day}
        <div class="text-center text-[10px] font-black uppercase tracking-wider text-ink/40 py-1.5
                    {day === 'Fri' ? 'text-accent-yellow' : ''}">
          {day}
        </div>
      {/each}
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-0.5">
      {#each grid as day}
        <button
          onclick={() => selectDay(day)}
          class="calendar-day relative text-left p-1 sm:p-1.5 min-h-[3.5rem] sm:min-h-[4.5rem] md:min-h-[5rem] transition-all duration-75
                 {day.isToday ? 'calendar-day-today' : ''}
                 {day.events.length > 0 ? 'calendar-day-holiday' : ''}
                 {!day.inMonth ? 'opacity-30' : ''}
                 {selectedDay?.gDay === day.gDay && selectedDay?.gMonth === day.gMonth && selectedDay?.gYear === day.gYear ? 'border-ink bg-accent-blue/5' : ''}
                 {day.isFriday && day.inMonth ? 'border-accent-yellow/40' : ''}"
        >
          <!-- Primary date -->
          {#if viewMode === 'gregorian'}
            <span class="text-[10px] sm:text-xs font-black block">{day.gDay}</span>
            <span class="text-[8px] sm:text-[9px] font-bold text-ink/40 block leading-tight">{day.hijri.day} {day.hijri.monthName.slice(0, 3)}</span>
          {:else}
            <span class="text-[10px] sm:text-xs font-black block">{day.hijri.day}</span>
            <span class="text-[8px] sm:text-[9px] font-bold text-ink/40 block leading-tight">{day.hijri.monthName.slice(0, 6)}</span>
            <span class="text-[7px] sm:text-[8px] font-bold text-ink/30 block">{day.gDay}/{day.gMonth}</span>
          {/if}

          <!-- Event dot / label -->
          {#if day.events.length > 0}
            <div class="absolute bottom-0.5 left-0.5 right-0.5">
              <span class="hidden sm:block text-[7px] sm:text-[8px] font-bold bg-accent-pink text-white px-0.5 py-px truncate leading-tight text-center">
                {day.events[0].name.split(' ')[0]}
              </span>
              <span class="sm:hidden block w-1.5 h-1.5 bg-accent-pink rounded-full mx-auto"></span>
            </div>
          {/if}

          <!-- Friday indicator -->
          {#if day.isFriday && day.inMonth}
            <div class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-accent-yellow rounded-full"></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap items-center gap-3 text-[10px] font-bold">
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 border-2 border-ink bg-accent-yellow/20"></div>
      <span>Today</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 bg-accent-pink/20 border border-ink/30"></div>
      <span>Holiday</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-2 h-2 bg-accent-yellow rounded-full"></div>
      <span>Jumu'ah</span>
    </div>
  </div>

  <!-- Day Detail Panel -->
  {#if selectedDay}
    <DayDetail day={selectedDay} onclose={() => (selectedDay = null)} />
  {/if}

  <!-- Upcoming Holidays Section -->
  {#if upcomingHolidays.length > 0}
    <div class="card-brutal-sm">
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">
        Upcoming Holidays & Observances
      </p>
      <div class="flex flex-col gap-2">
        {#each upcomingHolidays as hol}
          <div class="flex items-center gap-3 p-2 border-2 transition-colors duration-75
                      {isTodayDate(hol.date) ? 'border-ink bg-accent-yellow/10' : ''}
                      {isPast(hol.date) ? 'border-ink/10 opacity-50' : 'border-ink/20 hover:border-ink/40'}">
            <!-- Date badge -->
            <div class="w-12 text-center shrink-0">
              <p class="font-black text-sm tabular-nums">{hol.date.getDate()}</p>
              <p class="text-[9px] font-bold text-ink/40 uppercase">{hol.date.toLocaleDateString('en-MY', { month: 'short' })}</p>
            </div>

            <!-- Divider -->
            <div class="w-1 self-stretch shrink-0
                        {hol.event.type === 'national' ? 'bg-accent-blue' : ''}
                        {hol.event.type === 'islamic' ? 'bg-accent-pink' : ''}
                        {hol.event.type === 'observance' ? 'bg-accent-yellow' : ''}"></div>

            <!-- Event info -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-xs sm:text-sm truncate">{hol.event.name}</p>
              {#if hol.event.nameMs && hol.event.nameMs !== hol.event.name}
                <p class="text-[10px] text-ink/50 font-bold truncate">{hol.event.nameMs}</p>
              {/if}
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[9px] font-bold uppercase tracking-wider
                             {hol.event.type === 'national' ? 'text-accent-blue' : ''}
                             {hol.event.type === 'islamic' ? 'text-accent-pink' : ''}
                             {hol.event.type === 'observance' ? 'text-ink/40' : ''}">
                  {hol.event.type}
                </span>
                <span class="text-[9px] font-bold text-ink/30">{formatHolidayDate(hol.date)}</span>
                {#if isPast(hol.date)}
                  <span class="text-[8px] font-bold text-ink/30 uppercase">passed</span>
                {/if}
                {#if isTodayDate(hol.date)}
                  <span class="text-[8px] font-black text-accent-green uppercase">today!</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
