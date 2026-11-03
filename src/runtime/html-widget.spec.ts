// The HTML of a widget (phase 20): plain HTML with {{parameters}}. The parameters are escaped, and the HTML is cleaned:
// no scripts, no event handlers, no links, and only https images (decided with the owner).
import { describe, expect, it } from 'vitest';
import { cleanWidgetHtml, fillWidgetHtml } from './html-widget';

describe('the HTML of a widget is cleaned', () => {
  it('keeps text, layout, style attributes and https images', () => {
    const out = cleanWidgetHtml('<div class="x" style="color: red"><b>Hi</b> <img src="https://example.com/a.png" alt="a"></div>');
    expect(out).toContain('<b>Hi</b>');
    expect(out).toContain('style="color: red"');
    expect(out).toContain('src="https://example.com/a.png"');
  });

  it('removes scripts, event handlers, links and plain-web images', () => {
    const out = cleanWidgetHtml('<script>alert(1)</script><p onclick="x()">a</p><a href="javascript:alert(1)">b</a><img src="http://tracker.example/p.gif">');
    expect(out).not.toMatch(/script/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toMatch(/href/i);
    expect(out).not.toMatch(/http:\/\//i);
    expect(out).toContain('a');
    expect(out).toContain('b');
  });

  it('removes a style that loads something or runs code', () => {
    expect(cleanWidgetHtml('<p style="background: url(https://x.example/a.png)">x</p>')).not.toMatch(/url\(/i);
    expect(cleanWidgetHtml('<p style="width: expression(alert(1))">x</p>')).not.toMatch(/expression/i);
  });

  it('keeps simple inline SVG', () => {
    expect(cleanWidgetHtml('<svg viewBox="0 0 10 10"><rect x="1" y="1" width="4" height="4" fill="#0A6CC9"/></svg>')).toContain('<rect');
  });
});

describe('the parameters of a widget', () => {
  it('replace the placeholders, escaped, and an unknown placeholder is empty', () => {
    const filled = fillWidgetHtml('<b>{{mood}}</b> {{missing}}', { mood: '<img src=x onerror=alert(1)>' });
    expect(filled).not.toContain('<img');
    expect(filled).toContain('&lt;img');
    expect(filled).not.toContain('{{');
  });

  it('a number is written as its text', () => {
    expect(fillWidgetHtml('<span>{{avg}}</span>', { avg: '5.5' })).toBe('<span>5.5</span>');
  });
});

describe('an HTML component of a widget', () => {
  it('is filled and cleaned when the run passes it', async () => {
    const { componentOf } = await import('./widget');
    const fmt = (v: unknown) => String(v);
    const c = componentOf({ kind: 'html', html: '<p onclick="x()">Mood {{mood}}</p><script>bad()</script>', params: { mood: '6<7' } }, fmt);
    expect(c).toEqual({ kind: 'html', html: '<p>Mood 6&lt;7</p>' });
  });

  it('an HTML component with no HTML is an empty one', async () => {
    const { componentOf } = await import('./widget');
    expect(componentOf({ kind: 'html' }, String)).toEqual({ kind: 'html', html: '' });
  });
});

describe('the page an HTML widget is shown in', () => {
  it('is a page with a policy that allows only https images and inline styles, and no script', async () => {
    const { htmlDocument } = await import('./html-widget');
    const page = htmlDocument('<p>hi</p>');
    expect(page).toContain("default-src 'none'");
    expect(page).toContain('img-src https:');
    expect(page).not.toContain('script-src');
    expect(page).toContain('<body><p>hi</p></body>');
  });
});
