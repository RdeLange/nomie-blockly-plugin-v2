<script lang="ts">
  // A dashboard widget as the widget builder made it (phase 20): its header, its components in order, and its footer.
  // The same drawing as the widget frame of DailyNomie (the card, the value, the line of the chart).
  import type { WidgetDesign } from '../runtime/widget';
  import { linePaths } from './widget-chart';
  import { t } from './i18n.svelte';

  let { design, name, emoji, onRun }: { design: WidgetDesign; name: string; emoji: string; onRun: () => void } = $props();
  const W = 300;
  const H = 72;
</script>

<div class="wd">
  <div class="wd-head">
    <span class="emoji">{design.emoji || emoji}</span>
    <strong>{design.name || name}</strong>
  </div>
  {#each design.components as component, i (i)}
    {#if component.kind === 'value'}
      <div class="wd-row">
        <span class="widget-label">{component.label}</span>
        <span class="widget-value">{component.value}</span>
      </div>
    {:else}
      {@const geometry = linePaths(component.points, W, H)}
      {@const colour = component.kind === 'chart' ? component.colour : 'var(--nb-accent, #5e7abc)'}
      <div class="wd-chart">
        <span class="widget-label">{component.label}</span>
        <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" width="100%" height={H} role="img" aria-label={component.label}>
          {#each geometry.paths as d (d)}
            <path {d} fill="none" stroke={colour} stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          {/each}
          {#each geometry.dots as dot, j (j)}
            <circle cx={dot.x} cy={dot.y} r="3" fill={colour} />
          {/each}
        </svg>
      </div>
    {/if}
  {/each}
  {#if design.footer}
    <div class="wd-footer">{design.footer}</div>
  {/if}
  <div class="wd-actions">
    <button class="button" onclick={onRun}>{t('Run')}</button>
  </div>
</div>
