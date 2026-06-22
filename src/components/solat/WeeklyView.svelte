<script lang="ts">
  import type { SolatDay, SolatResponse } from '../../lib/solat/types';
  import { PRAYER_KEYS } from '../../lib/solat/types';

  interface Props {
    prayers: SolatDay[] | null;
    currentZone: string;
  }

  let { prayers, currentZone }: Props = $props();

  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

  const DAYS = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

  // Get next 7 days of prayer data
  let weekDays = $derived.by(() => {
    if (!prayers || prayers.length === 0) return [];
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const result: { day: SolatDay; isToday: boolean; dayLabel: string; dateLabel: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayData = prayers.find(p => p.date === dateStr);
      if (dayData) {
        result.push({
          day: dayData,
          isToday: dateStr === todayStr,
          dayLabel: DAYS[d.getDay()],
          dateLabel: `${d.getDate()}/${d.getMonth() + 1}`,
        });
      }
    }
    return result;
  });
</script>

{#if !prayers || weekDays.length === 0}
  <div class="text-center py-8 text-ink/40 font-bold text-sm">
    Tiada data minggu ini
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse" role="table" aria-label="Weekly prayer times">
      <thead>
        <tr>
          <th class="text-left p-2 border-b-2 border-ink text-[10px] font-black uppercase tracking-wider text-ink/60">Waktu</th>
          {#each weekDays as wd}
            <th
              class="text-center p-2 border-b-2 border-ink text-[10px] font-black uppercase tracking-wider
                     {wd.isToday ? 'text-accent-blue bg-accent-blue/10' : 'text-ink/60'}"
            >
              <div>{wd.dayLabel}</div>
              <div class="text-[8px] font-bold opacity-50">{wd.dateLabel}</div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each PRAYER_KEYS as key}
          {@const display = PRAYER_DISPLAY[key]}
          {#if display}
            <tr class="border-b border-ink/10 hover:bg-canvas transition-colors">
              <td class="p-2 font-bold text-[10px] uppercase tracking-wider">
                <span class="mr-1" aria-hidden="true">{display.emoji}</span>
                {display.label}
              </td>
              {#each weekDays as wd}
                <td
                  class="text-center p-2 font-mono text-xs tabular-nums
                         {wd.isToday ? 'font-black text-accent-blue' : ''}"
                >
                  {(wd.day[key as keyof SolatDay] as string) || '—'}
                </td>
              {/each}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  <div class="text-[10px] font-bold text-ink/40 text-center mt-2">
    Zon: {currentZone} • {weekDays.length} hari
  </div>
{/if}
