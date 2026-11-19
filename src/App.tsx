import { useMemo, useState } from 'react';
import {
  cases,
  coolers,
  cpus,
  gpus,
  motherboards,
  psus,
  rams,
  storages,
  type Cpu,
  type Motherboard,
  type Ram,
  type Gpu,
  type Cooler,
  type Psu,
  type PcCase,
  type Storage,
} from './data/parts';
import {
  checkBuild,
  completeness,
  estimatedDraw,
  recommendedPsuWattage,
  totalPrice,
  verdict,
  type Build,
} from './lib/compat';

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

interface Row<T> {
  key: keyof Build;
  label: string;
  hint: string;
  items: T[];
  /** Secondary line shown under each option. */
  detail: (item: T) => string;
}

const cpuRows: Row<Cpu> = {
  key: 'cpu',
  label: 'Processor',
  hint: 'Socket decides which boards fit',
  items: cpus,
  detail: (c) => `${c.socket} · ${c.cores} cores · ${c.tdp}W`,
};

const boardRow: Row<Motherboard> = {
  key: 'motherboard',
  label: 'Motherboard',
  hint: 'Memory type and form factor live here',
  items: motherboards,
  detail: (m) => `${m.socket} · ${m.ramType} · ${m.formFactor} · ${m.ramSlots} slots`,
};

const ramRow: Row<Ram> = {
  key: 'ram',
  label: 'Memory',
  hint: 'Type must match the board',
  items: rams,
  detail: (r) => `${r.type} · ${r.capacityGb}GB · ${r.modules}× modules`,
};

const gpuRow: Row<Gpu> = {
  key: 'gpu',
  label: 'Graphics card',
  hint: 'Physical length is the usual blocker',
  items: gpus,
  detail: (g) => (g.lengthMm === 0 ? 'uses CPU graphics' : `${g.lengthMm}mm · ${g.tdp}W`),
};

const coolerRow: Row<Cooler> = {
  key: 'cooler',
  label: 'CPU cooler',
  hint: 'Rated for a heat load, and must fit vertically',
  items: coolers,
  detail: (c) => `${c.heightMm}mm tall · rated ${c.supportsTdp}W`,
};

const psuRow: Row<Psu> = {
  key: 'psu',
  label: 'Power supply',
  hint: 'Needs headroom above peak draw',
  items: psus,
  detail: (p) => `${p.wattage}W · 80+ ${p.efficiency}`,
};

const caseRow: Row<PcCase> = {
  key: 'pcCase',
  label: 'Case',
  hint: 'Fits a board size, a GPU length, a cooler height',
  items: cases,
  detail: (c) => `${c.supportedFormFactors.join('/')} · GPU ${c.maxGpuLengthMm}mm`,
};

const storageRow: Row<Storage> = {
  key: 'storage',
  label: 'Storage',
  hint: 'NVMe needs an M.2 slot',
  items: storages,
  detail: (s) => `${s.interface} · ${s.capacityGb}GB`,
};

const rows = [cpuRows, boardRow, ramRow, gpuRow, coolerRow, psuRow, caseRow, storageRow];

/** A reference build that passes every rule — good for a first impression. */
const referenceBuild = (): Build => ({
  cpu: cpus[0],
  motherboard: motherboards[0],
  ram: rams[1],
  gpu: gpus[2],
  cooler: coolers[1],
  psu: psus[3],
  pcCase: cases[3],
  storage: storages[1],
});

export default function App() {
  const [build, setBuild] = useState<Build>(referenceBuild);

  const issues = useMemo(() => checkBuild(build), [build]);
  const state = verdict(issues);
  const draw = estimatedDraw(build);
  const recommended = recommendedPsuWattage(build);
  const price = totalPrice(build);
  const done = completeness(build);

  const set = <K extends keyof Build>(key: K, value: Build[K]) =>
    setBuild((prev) => ({ ...prev, [key]: value }));

  const verdictLabel =
    state === 'ok' ? 'Compatible' : state === 'warn' ? `${issues.length} warning${issues.length > 1 ? 's' : ''}` : `${issues.filter((i) => i.severity === 'error').length} conflict${issues.filter((i) => i.severity === 'error').length > 1 ? 's' : ''}`;

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <div className="eyebrow">Compatibility checker</div>
          <h1>PC Builder</h1>
          <p className="lede">
            Pick parts on the left. Every verdict on the right comes from a rule you can read in{' '}
            <code>src/lib/compat.ts</code> — not a guess.
          </p>
        </div>
        <div className="masthead-actions">
          <button className="btn btn-quiet" onClick={() => setBuild({})}>
            Clear
          </button>
          <button className="btn" onClick={() => setBuild(referenceBuild())}>
            Load reference build
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel" aria-label="Parts">
          {rows.map((row) => {
            const value = build[row.key] as { id: string } | undefined;
            return (
              <div className="row" key={row.key}>
                <label className="row-label" htmlFor={`sel-${row.key}`}>
                  <span className="row-name">{row.label}</span>
                  <span className="row-hint">{row.hint}</span>
                </label>
                <div className="row-control">
                  <select
                    id={`sel-${row.key}`}
                    value={value?.id ?? ''}
                    onChange={(e) => {
                      const picked = row.items.find((i) => i.id === e.target.value);
                      set(row.key, (picked ?? undefined) as never);
                    }}
                  >
                    <option value="">— none selected —</option>
                    {row.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · ₹{inr.format(item.price)}
                      </option>
                    ))}
                  </select>
                  <span className="row-detail">
                    {value ? row.detail(value as never) : 'nothing selected'}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="summary" aria-label="Build summary">
          <div className={`verdict verdict-${state}`}>
            <span className="verdict-dot" aria-hidden="true" />
            <span>{verdictLabel}</span>
          </div>

          <dl className="stats">
            <div>
              <dt>Total</dt>
              <dd>₹{inr.format(price)}</dd>
            </div>
            <div>
              <dt>Estimated draw</dt>
              <dd>{draw} W</dd>
            </div>
            <div>
              <dt>Recommended PSU</dt>
              <dd>{recommended} W</dd>
            </div>
            <div>
              <dt>Parts selected</dt>
              <dd>
                {done.selected}/{done.total}
              </dd>
            </div>
          </dl>

          <div className="power">
            <div className="power-labels">
              <span>Draw vs PSU</span>
              <span>
                {build.psu ? `${draw} / ${build.psu.wattage} W` : 'no PSU selected'}
              </span>
            </div>
            <div className="power-track">
              <div
                className={
                  build.psu && draw > build.psu.wattage * 0.85 ? 'power-fill is-high' : 'power-fill'
                }
                style={{ width: `${Math.min(100, build.psu ? (draw / build.psu.wattage) * 100 : 0)}%` }}
              />
            </div>
          </div>

          <div className="issues">
            <h2>Findings</h2>
            {issues.length === 0 ? (
              <p className="empty">
                No rule is violated by this selection. Add parts to see the checks run.
              </p>
            ) : (
              <ul>
                {issues.map((issue) => (
                  <li key={issue.rule} className={`issue issue-${issue.severity}`}>
                    <span className="issue-tag">{issue.severity}</span>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>

      <footer className="foot">
        <span>Rules live in one place, so they can be unit-tested — see `compat.test.ts`.</span>
        <span>Prices are indicative, in INR.</span>
      </footer>
    </div>
  );
}
