import { useId } from "react";

type Item = {
          t: string; // label
          x: number; // pill center x
          y: number; // pill center y
          w: number; // pill width
          s: -1 | 0 | 1; // side: left / bottom-center / right
          dx: number; // where the line leaves the logo
          i: keyof typeof ICONS;
};

const ICONS = {
          store: "M6 7h12l-1 12H7z M9 7a3 3 0 0 1 6 0",
          grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
          cal: "M5 6h14v14H5z M5 10h14 M9 4v4 M15 4v4",
          box: "M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9",
          scan: "M4 9V4h5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5 M8 12h8",
          truck: "M3 7h11v9H3z M14 10h4l3 3v3h-7 M7 18h.01 M17 18h.01",
          wrench: "M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9z",
          dollar: "M5 4h14v16H5z M12 8v8 M14.5 9.5c-1-1-4-1-4 .8s4 1 4 2.9-3 2-4 .9",
          calc: "M6 3h12v18H6z M9 7h6 M9 12h.01 M12 12h.01 M15 12h.01 M9 16h.01 M12 16h.01 M15 16h.01",
          bars: "M5 20v-8 M12 20V6 M19 20v-6 M3 20h18",
          shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z M9 12l2 2 4-4",
} as const;

const ITEMS: Item[] = [
          { t: "Online Storefront", x: 330, y: 60, w: 210, s: -1, dx: 45, i: "store" },
          { t: "Customer Portal", x: 670, y: 60, w: 200, s: 1, dx: 45, i: "grid" },
          { t: "Booking & Scheduling", x: 200, y: 140, w: 250, s: -1, dx: 75, i: "cal" },
          { t: "Inventory Management", x: 800, y: 140, w: 250, s: 1, dx: 75, i: "box" },
          { t: "Checkout & POS", x: 130, y: 225, w: 200, s: -1, dx: 0, i: "scan" },
          { t: "Dispatch & Delivery", x: 870, y: 225, w: 230, s: 1, dx: 0, i: "truck" },
          { t: "Service & Repair", x: 200, y: 310, w: 210, s: -1, dx: 75, i: "wrench" },
          { t: "Invoicing & Payments", x: 800, y: 310, w: 230, s: 1, dx: 75, i: "dollar" },
          { t: "Accounting (QuickBooks)", x: 230, y: 395, w: 290, s: -1, dx: 45, i: "calc" },
          { t: "Analytics & Reporting", x: 770, y: 395, w: 250, s: 1, dx: 45, i: "bars" },
          { t: "Rental Protection", x: 500, y: 470, w: 210, s: 0, dx: 0, i: "shield" },
];

const CX = 500;
const CY = 225;
const DOT_DURATION = 9; // seconds – bigger = slower

function buildPath(it: Item) {
          if (it.s === 0) {
                    const top = it.y - 22;
                    return { d: `M${CX} ${CY} V${top}`, len: top - CY, ex: CX, ey: top };
          }
          const ex = it.s < 0 ? it.x + it.w / 2 : it.x - it.w / 2;
          if (it.y === CY) {
                    return { d: `M${CX} ${CY} H${ex}`, len: Math.abs(ex - CX), ex, ey: it.y };
          }
          const sx = CX + it.s * it.dx;
          return {
                    d: `M${sx} ${CY} V${it.y} H${ex}`,
                    len: Math.abs(it.y - CY) + Math.abs(ex - sx),
                    ex,
                    ey: it.y,
          };
}

const CSS = `
.rg-wrap{
  --rg-bg:#fdf6e3;--rg-ink:#1f2328;--rg-sub:#5b5547;--rg-pill:#f4e9cc;
  --rg-line:#e0d2ab;--rg-icon:#374151;--rg-dot:#ffd600;
  background:var(--rg-bg);color:var(--rg-ink);text-align:center;
  padding:48px 16px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
}
@media (prefers-color-scheme:dark){
  .rg-wrap{--rg-bg:#14171c;--rg-ink:#f1f3f5;--rg-sub:#a9b1bd;--rg-pill:#232830;--rg-line:#3a414c;--rg-icon:#cdd3dc}
}
.rg-wrap h2{font-size:clamp(28px,5vw,52px);line-height:1.15;margin:0 auto 16px;max-width:820px;font-weight:800}
.rg-wrap p{color:var(--rg-sub);max-width:520px;margin:0 auto 28px;line-height:1.5}
.rg-svg{width:100%;max-width:1000px;height:auto;display:block;margin:0 auto}
.rg-pill{fill:var(--rg-pill)}
.rg-lbl{fill:var(--rg-ink);font-size:16px;font-weight:600}
.rg-ic{fill:none;stroke:var(--rg-icon);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.rg-ln{fill:none;stroke:var(--rg-line);stroke-width:1.5;stroke-linejoin:round;
  stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:rg-draw 3s ease forwards}
@keyframes rg-draw{to{stroke-dashoffset:0}}
.rg-gear{transform-box:fill-box;transform-origin:center;animation:rg-spin 20s linear infinite}
@keyframes rg-spin{to{transform:rotate(360deg)}}
.rg-halo{transform-box:fill-box;transform-origin:center;animation:rg-breathe 3.5s ease-in-out infinite}
@keyframes rg-breathe{50%{opacity:.55;transform:scale(1.08)}}
.rg-ring{fill:none;stroke:var(--rg-dot);stroke-width:2;opacity:0;transform-box:fill-box;
  transform-origin:center;animation:rg-ping ${DOT_DURATION}s ease-out infinite}
@keyframes rg-ping{0%,82%{opacity:0;transform:scale(.6)}86%{opacity:.9}100%{opacity:0;transform:scale(1.5)}}
@media (prefers-reduced-motion:reduce){.rg-gear,.rg-halo,.rg-ring{animation:none}}
`;

const Workflow = () => {
          const uid = useId().replace(/:/g, "");
          const gradId = `rg-grad-${uid}`;
          const glowId = `rg-glow-${uid}`;

          return (
                    <section className="rg-wrap">
                              <style>{CSS}</style>

                              <h2>One platform. Every rental management workflow.</h2>
                              <p>
                                        Rent Gear unifies every part of your rental workflow – helping you
                                        eliminate chaos, serve customers faster, and grow with less effort.
                              </p>

                              <svg
                                        className="rg-svg"
                                        viewBox="0 0 1000 520"
                                        role="img"
                                        aria-label="Rent Gear workflow diagram"
                              >
                                        <defs>
                                                  <radialGradient id={gradId}>
                                                            <stop offset="0" stopColor="#ffdd00" stopOpacity=".55" />
                                                            <stop offset="1" stopColor="#ffdd00" stopOpacity="0" />
                                                  </radialGradient>
                                                  <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
                                                            <feGaussianBlur stdDeviation="3" />
                                                  </filter>
                                        </defs>

                                        {/* connecting lines (draw in on load) */}
                                        <g>
                                                  {ITEMS.map((it, n) => {
                                                            const { d, len } = buildPath(it);
                                                            return (
                                                                      <path
                                                                                key={it.t}
                                                                                id={`rg-p${n}-${uid}`}
                                                                                className="rg-ln"
                                                                                d={d}
                                                                                style={
                                                                                          {
                                                                                                    "--len": len,
                                                                                                    animationDelay: `${n * 0.25}s`,
                                                                                          } as React.CSSProperties
                                                                                }
                                                                      />
                                                            );
                                                  })}
                                        </g>

                                        {/* pills */}
                                        <g>
                                                  {ITEMS.map((it) => (
                                                            <g key={it.t}>
                                                                      <rect
                                                                                className="rg-pill"
                                                                                x={it.x - it.w / 2}
                                                                                y={it.y - 22}
                                                                                width={it.w}
                                                                                height={44}
                                                                                rx={22}
                                                                      />
                                                                      <g
                                                                                transform={`translate(${it.x - it.w / 2 + 16} ${it.y - 11}) scale(.92)`}
                                                                      >
                                                                                <path className="rg-ic" d={ICONS[it.i]} />
                                                                      </g>
                                                                      <text className="rg-lbl" x={it.x - it.w / 2 + 46} y={it.y + 5.5}>
                                                                                {it.t}
                                                                      </text>
                                                            </g>
                                                  ))}
                                        </g>

                                        {/* moving dots + arrival rings */}
                                        <g>
                                                  {ITEMS.map((it, n) => {
                                                            const { ex, ey } = buildPath(it);
                                                            return (
                                                                      <g key={it.t}>
                                                                                {[0, 1].map((k) => {
                                                                                          const begin = `${(2 + n * 0.6 + k * (DOT_DURATION / 2)).toFixed(2)}s`;
                                                                                          return (
                                                                                                    <g key={k} opacity={0}>
                                                                                                              <circle r={7} fill="var(--rg-dot)" opacity={0.55} filter={`url(#${glowId})`} />
                                                                                                              <circle r={3.6} fill="var(--rg-dot)" />
                                                                                                              <animateMotion
                                                                                                                        dur={`${DOT_DURATION}s`}
                                                                                                                        begin={begin}
                                                                                                                        repeatCount="indefinite"
                                                                                                                        calcMode="spline"
                                                                                                                        keyTimes="0;1"
                                                                                                                        keyPoints="0;1"
                                                                                                                        keySplines=".45 .05 .55 .95"
                                                                                                              >
                                                                                                                        <mpath href={`#rg-p${n}-${uid}`} />
                                                                                                              </animateMotion>
                                                                                                              <animate
                                                                                                                        attributeName="opacity"
                                                                                                                        values="0;1;1;0"
                                                                                                                        keyTimes="0;.08;.88;1"
                                                                                                                        dur={`${DOT_DURATION}s`}
                                                                                                                        begin={begin}
                                                                                                                        repeatCount="indefinite"
                                                                                                              />
                                                                                                    </g>
                                                                                          );
                                                                                })}
                                                                                <circle
                                                                                          className="rg-ring"
                                                                                          cx={ex}
                                                                                          cy={ey}
                                                                                          r={9}
                                                                                          style={{ animationDelay: `${2 + n * 0.6}s` }}
                                                                                />
                                                                      </g>
                                                            );
                                                  })}
                                        </g>

                                        {/* Rent Gear logo */}
                                        <ellipse className="rg-halo" cx={CX} cy={CY} rx={190} ry={120} fill={`url(#${gradId})`} />
                                        <rect x={395} y={187} width={210} height={76} rx={38} fill="#ffdd00" />
                                        <g transform={`translate(442 ${CY})`}>
                                                  <g className="rg-gear">
                                                            {Array.from({ length: 10 }).map((_, i) => (
                                                                      <rect
                                                                                key={i}
                                                                                x={-4}
                                                                                y={-27}
                                                                                width={8}
                                                                                height={10}
                                                                                rx={2}
                                                                                fill="#d6211f"
                                                                                transform={`rotate(${i * 36})`}
                                                                      />
                                                            ))}
                                                            <circle r={21} fill="#d6211f" />
                                                            <circle r={13} fill="#ffdd00" />
                                                            <circle r={6} fill="#1c1c1c" />
                                                  </g>
                                        </g>
                                        <text x={470} y={234} fontSize={26} fontWeight={800} fontFamily="Inter, system-ui, Arial, sans-serif">
                                                  <tspan fill="#d6211f">Rent</tspan>
                                                  <tspan fill="#1c1c1c" dx={6}>
                                                            Gear
                                                  </tspan>
                                        </text>
                              </svg>
                    </section>
          );
};

export default Workflow;
