import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

/**
 * Smoke test: the app actually mounts and paints its default state.
 * Uses renderToString so it needs no DOM environment — effects do not run,
 * which is fine, because this is checking the first paint only.
 */
describe('App', () => {
  const html = renderToString(<App />);

  it('renders the reference build as compatible', () => {
    expect(html).toContain('PC Builder');
    expect(html).toContain('Compatible');
  });

  it('renders every category row', () => {
    for (const label of [
      'Processor',
      'Motherboard',
      'Memory',
      'Graphics card',
      'CPU cooler',
      'Power supply',
      'Case',
      'Storage',
    ]) {
      expect(html).toContain(label);
    }
  });

  it('shows the parts, totals and power figures', () => {
    expect(html).toContain('Ryzen 5 7600');
    expect(html).toContain('Estimated draw');
    expect(html).toContain('Recommended PSU');
    expect(html).toContain('Parts selected');
  });
});
