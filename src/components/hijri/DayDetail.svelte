<script lang="ts">
  import type { CalendarDay } from '../../lib/hijri/calendar-utils';

  interface Props {
    day: CalendarDay;
    onclose: () => void;
  }

  let { day, onclose }: Props = $props();

  const dayName = day.date.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  });
</script>

<div class="card-brutal bg-white border-4 border-ink">
  <!-- Header -->
  <div class="flex items-start justify-between mb-3 border-b-4 border-ink pb-3">
    <div>
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Selected Date</p>
      <h3 class="font-black text-lg uppercase tracking-wider">{dayName}</h3>
    </div>
    <button
      onclick={onclose}
      class="w-8 h-8 border-2 border-ink flex items-center justify-center bg-white hover:bg-canvas
             active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
             shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75"
      aria-label="Close"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <!-- Date Details -->
  <div class="flex flex-col gap-3">
    <!-- Gregorian -->
    <div class="flex items-center gap-3 p-2 border-2 border-ink/20">
      <div class="w-8 h-8 bg-accent-blue text-white flex items-center justify-center font-black text-xs shrink-0">G</div>
      <div>
        <p class="text-[10px] font-bold text-ink/40 uppercase">Gregorian</p>
        <p class="font-black text-sm">{day.gDay} {day.date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' })}</p>
      </div>
    </div>

    <!-- Hijri -->
    <div class="flex items-center gap-3 p-2 border-2 border-ink/20">
      <div class="w-8 h-8 bg-accent-green text-white flex items-center justify-center font-black text-xs shrink-0">H</div>
      <div>
        <p class="text-[10px] font-bold text-ink/40 uppercase">Hijri</p>
        <p class="font-black text-sm">{day.hijri.day} {day.hijri.monthName} {day.hijri.year} AH</p>
        <p class="arabic-text text-sm" dir="rtl" style="line-height: 1.5;">{day.hijri.day} {day.hijri.monthNameAr}</p>
      </div>
    </div>

    <!-- Day type -->
    {#if day.isFriday}
      <div class="flex items-center gap-2 px-3 py-2 bg-accent-yellow/20 border-2 border-accent-yellow/50">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent-yellow">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span class="text-xs font-black uppercase tracking-wider">Jumu'ah (Friday)</span>
      </div>
    {/if}

    <!-- Events -->
    {#if day.events.length > 0}
      <div class="flex flex-col gap-2">
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Events & Holidays</p>
        {#each day.events as event}
          <div class="flex items-center gap-3 p-2 border-2 border-accent-pink/30 bg-accent-pink/5">
            <div class="w-2 h-2 rounded-full shrink-0
                        {event.type === 'national' ? 'bg-accent-blue' : ''}
                        {event.type === 'islamic' ? 'bg-accent-pink' : ''}
                        {event.type === 'observance' ? 'bg-accent-yellow' : ''}"></div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm truncate">{event.name}</p>
              {#if event.nameMs}
                <p class="text-[10px] text-ink/50 font-bold">{event.nameMs}</p>
              {/if}
              <p class="text-[9px] font-bold uppercase tracking-wider mt-0.5
                        {event.type === 'national' ? 'text-accent-blue' : ''}
                        {event.type === 'islamic' ? 'text-accent-pink' : ''}
                        {event.type === 'observance' ? 'text-ink/40' : ''}">
                {event.type}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-xs text-ink/40 font-bold text-center py-2">No events on this date</p>
    {/if}
  </div>
</div>
