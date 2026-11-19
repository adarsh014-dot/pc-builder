# PC Builder

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![tests](https://img.shields.io/badge/tests-21%20passing-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

Pick PC parts and see **every** reason they conflict — socket, memory type, physical clearance,
power headroom — each one traced to a named rule you can read and test.

**[Live demo →](https://adarsh014-dot.github.io/pc-builder/)**

```
CPU socket ──┐
RAM type ────┼──▶ checkBuild() ──▶ Issue[]  ──▶ verdict: ok | warn | error
case limits ─┘                    (rule id, severity, message)
```

## Why this exists

Most "PC builder" demos are a form and a hard-coded red banner. The interesting engineering is not
the form — it is deciding *what* makes a build invalid, and being able to prove it.

So the rule engine here is a set of small **pure functions** that return issues instead of throwing
or short-circuiting. Consequences that matter:

- A broken build still renders. You see **all** problems at once, not just the first one found.
- Every issue carries a stable `rule` id, so tests assert on a specific rule rather than a message
  string that will drift.
- Severity is separate from detection: DDR5 in a DDR4 board is an `error`; RAM faster than the
  board is rated is a `warning`, because the machine still boots.

## Rules implemented

| Rule id | Kind | Check |
| --- | --- | --- |
| `cpu-socket` | error | CPU socket matches motherboard socket |
| `ram-type` | error | DDR4 / DDR5 generation matches the board |
| `ram-slots` | error | Module count fits the board's slots |
| `ram-capacity` | error | Total capacity within the board maximum |
| `ram-speed` | warning | Rated speed within what the board supports |
| `case-formfactor` | error | Case accepts the board's form factor |
| `gpu-length` | error | GPU length within case clearance |
| `gpu-clearance` | warning | Under 15 mm spare — cable routing gets tight |
| `cooler-height` | error | Cooler height within case clearance |
| `cooler-tdp` | warning | Cooler rated for the CPU's heat load |
| `storage-m2` | error | NVMe needs an M.2 slot |
| `psu-under` | error | PSU wattage below estimated peak draw |
| `psu-headroom` | warning | PSU below draw + 25% transient headroom |

Power is estimated from TDP plus fixed overheads, deliberately assuming CPU and GPU do not peak
simultaneously (0.9× on the CPU). The recommended PSU rounds the estimate up 25% and then up to the
next 50 W, which is how people actually buy them.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm test         # 21 unit tests
```

## Layout

```
src/
  data/parts.ts        static catalogue: CPUs, boards, memory, GPUs, coolers, PSUs, cases, drives
  lib/compat.ts        the rule engine — pure, no React
  lib/compat.test.ts   18 tests covering every rule and the power maths
  App.test.tsx         3 render tests: the app mounts and paints its default state
  App.tsx              UI: part pickers + live verdict panel
```

The catalogue is plain data on purpose: no network calls, no API keys, no rate limits, and the engine
stays deterministic — which is what makes it testable.

Tests come in two layers: 18 on the rule engine (pure, no DOM) and 3 render tests using
`renderToString`, which prove the UI actually mounts rather than merely compiling.

## Known limits (stated, not hidden)

- **Catalogue is small and static.** 5 CPUs, 5 boards, 5 GPUs. It is a rule-engine demo, not a shop.
- **Prices are indicative**, in INR, and not live.
- **No bottleneck modelling.** It will happily pair a Ryzen 5 with an RTX 4090 — that is a sensible
  build physically and a poor one for balance, and this tool does not pretend to judge it.
- **No persistence.** A refresh resets to the reference build.
- **Not every real-world conflict is modelled**: PCIe lane sharing, BIOS version requirements for
  newer CPUs, and radiator mounting space are all out of scope.

## Licence

MIT — see [LICENSE](LICENSE).
