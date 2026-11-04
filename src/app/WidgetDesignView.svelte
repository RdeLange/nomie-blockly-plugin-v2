<script lang="ts">
  // A dashboard widget as the widget builder made it (phase 20). It is sized like DailyNomie 7's dashboard widgets: a
  // header of at least 32 px with the Run button in its top-right corner, a body of at least 90 px, and a footer of at
  // least 32 px. The fonts are small, as on the dashboard, and the widget takes the card colour Nomie sends.
  import type { WidgetDesign } from '../runtime/widget';
  import { barRects, linePaths } from './widget-chart';
  import { htmlDocument } from '../runtime/html-widget';
  import { t } from './i18n.svelte';

  // onRun is given in the editor's preview only: a dashboard widget runs by itself and has no Run button (phase 23)
  let { design, name, emoji, onRun }: { design: WidgetDesign; name: string; emoji: string; onRun?: () => void } = $props();
  const W = 300;
  const H = 40;
</script>

<div class="wd">
  <div class="wd-head">
    <span class="wd-emoji">{design.emoji || emoji}</span>
    <span class="wd-title">{design.name || name}</span>
    {#if onRun}
      <button class="wd-run" onclick={onRun}>{t('Run')}</button>
    {/if}
  </div>
  <div class="wd-main">
    {#each design.components as component, i (i)}
      {#if component.kind === 'value'}
        <div class="wd-value">
          <span class="wd-label">{component.label}</span>
          <span class="wd-num">{component.value}</span>
        </div>
      {:else if component.kind === 'bars'}
        {@const bars = barRects(component.points, W, H)}
        <div class="wd-chart">
          <span class="wd-label">{component.label}</span>
          <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label={component.label}>
            {#each bars as bar, j (j)}
              <rect x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx="2" fill={component.colour} />
            {/each}
          </svg>
        </div>
      {:else if component.kind === 'html'}
        <!-- no sandbox permissions: the page runs no script, and its policy allows only https images -->
        <iframe class="wd-html" title={design.name || name} srcdoc={htmlDocument(component.html)} sandbox=""></iframe>
      {:else}
        {@const geometry = linePaths(component.points, W, H)}
        {@const colour = component.kind === 'chart' ? component.colour : 'var(--nb-accent, #5e7abc)'}
        <div class="wd-chart">
          <span class="wd-label">{component.label}</span>
          <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label={component.label}>
            {#each geometry.paths as d (d)}
              <path {d} fill="none" stroke={colour} stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
            {/each}
            {#each geometry.dots as dot, j (j)}
              <circle cx={dot.x} cy={dot.y} r="2.5" fill={colour} />
            {/each}
          </svg>
        </div>
      {/if}
    {/each}
  </div>
  <div class="wd-footer">{design.footer}</div>
</div>
