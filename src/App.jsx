import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE;

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  purple:  "#6C27E8",
  purpleL: "#F0EAFF",
  purpleM: "#D8C8FF",
  header:  "#0C0720",
  teal:    "#0B7EA3",
  tealL:   "#E6F7FF",
  amber:   "#C96A00",
  amberL:  "#FFF4E0",
  ink:     "#16112B",
  inkM:    "#4A4467",
  inkL:    "#9490A8",
  border:  "#EAE7F2",
  bg:      "#F6F4FB",
  white:   "#FFFFFF",
  green:   "#16A34A",
  red:     "#DC2626",
  yellow:  "#CA8A04",
};

// Campus palette
const CAM = {
  lon:  { col: T.purple, bg: "#FAF7FF", sep: "#D8C8FF", label: "London"      },
  sun:  { col: T.teal,   bg: "#F0FAFF", sep: "#BAE6FD", label: "Sunderland"  },
  york: { col: T.amber,  bg: "#FFF9F0", sep: "#FDE68A", label: "York"        },
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const SUN_COURSES = [
  { name: "MSc Nursing Practice – London",      lon: 20, sun:  0 },
  { name: "MSc Public Health",                  lon: 20, sun: 40 },
  { name: "MSc Nursing",                        lon:  0, sun: 40 },
  { name: "MBA Business Administration",        lon: 15, sun: 25 },
  { name: "MSc Cybersecurity",                  lon:  0, sun: 20 },
  { name: "MSc Data Science",                   lon:  0, sun: 50 },
  { name: "MSc Computing",                      lon:  0, sun: 40 },
  { name: "MSc Engineering Management",         lon:  0, sun: 15 },
  { name: "MSc Digital Marketing & Analytics",  lon:  0, sun: 20 },
];

const SUN_OTHER = [
  "OSPAP", "MA Education", "MA Marketing", "BSc (Hons) Nursing",
  "BSc (Hons) Nursing (Top Up)",
  "BSc (Hons) Nursing Practice (Top Up)", "BSc (Hons) Health and Social Care",
  "BEng Electronic & Electrical Engineering",
  "BA (Hons) Accounting and Financial Management",
  "BEng (Hons) Sustainable Design Engineering",
  "BSc (Hons) Computer Systems Engineering (Top-Up) Full-time",
  "LLM in International Human Rights",
  "MSc Finance and Management",
  "MSc Human Resource Management",
  "MSc International Business Management",
  "MSc International Business Management 15 Months",
  "MSc Project Management",
  "MSc Tourism and Hospitality",
  "MSc Fintech and Trading",
  "MSc Philosophy",
  "BEng (Hons) Mechanical Engineering",
  "BSc (Hons) Network Systems Engineering (Top-Up)",
  "Master of Business Administration (Professional Practice) - 12 Months Placement",
];

const YSJ_COURSES = [
  { name: "MBA (London)",                                                     lon: 10, york:  0 },
  { name: "MSc Global Healthcare Management",                                 lon:  5, york:  0 },
  { name: "MSc International Project Management",                             lon:  5, york:  0 },
  { name: "MSc Digital Marketing",                                            lon:  5, york:  0 },
  { name: "MSc Public Health (YSJ)",                                          lon:  6, york:  0 },
  { name: "MSc Data Science (YSJ)",                                           lon:  6, york:  0 },
  { name: "MSc Computer Science (London)",                                    lon:  6, york:  0 },
  { name: "MSc Computing (Top-up)",                                           lon:  2, york:  0 },
  { name: "MSc Business Computing (Top-up)",                                  lon:  2, york:  0 },
  { name: "BA Global Business Management (Top-up)",                           lon:  2, york:  0 },
  { name: "MSc Tourism & Hospitality",                                        lon:  3, york:  0 },
  { name: "MRes Management Studies",                                          lon:  6, york:  0 },
  { name: "BA (Hons) Accounting and Finance",                                 lon:  0, york:  1 },
  { name: "BA (Hons) Business Management",                                    lon:  0, york:  1 },
  { name: "BA (Hons) International Business",                                 lon:  0, york:  1 },
  { name: "BA (Hons) Intl Tourism & Hospitality Mgmt with Foundation Year",   lon:  0, york:  1 },
  { name: "Masters Business Administration (York)",                           lon:  0, york: 10 },
  { name: "MBA Healthcare Management",                                        lon:  0, york: 10 },
  { name: "MSc Human Resource Management",                                    lon:  0, york:  5 },
  { name: "MSc Project Management",                                           lon:  0, york:  5 },
  { name: "MSc International Business",                                       lon:  0, york:  5 },
  { name: "MRes in Business",                                                 lon:  0, york:  6 },
  { name: "MSc Marketing",                                                    lon:  0, york:  2 },
  { name: "MSc Strategic Digital Marketing",                                  lon:  0, york:  2 },
  { name: "MSc Product Design",                                               lon:  0, york:  1 },
  { name: "BSc (Hons) Psychology",                                            lon:  0, york:  1 },
  { name: "MA TESOL",                                                         lon:  0, york:  1 },
  { name: "MSc Psychology of Child & Adolescent Development",                 lon:  0, york:  1 },
  { name: "MA Education (YSJ)",                                               lon:  0, york:  2 },
  { name: "MRes in Psychology",                                               lon:  0, york:  1 },
  { name: "MRes in Education",                                                lon:  0, york:  1 },
  { name: "MRes in Linguistics",                                              lon:  0, york:  1 },
  { name: "BSc (Hons) Computer Science (York)",                               lon:  0, york:  1 },
  { name: "BSc (Hons) Software Engineering",                                  lon:  0, york:  1 },
  { name: "BSc Cyber Security",                                               lon:  0, york:  1 },
  { name: "BSc (Hons) Biomedical Science",                                    lon:  0, york:  1 },
  { name: "MRes Social Science",                                              lon:  0, york:  1 },
  { name: "MRes Science and Health",                                          lon:  0, york:  1 },
  { name: "MA International Politics and Security",                           lon:  0, york:  1 },
  { name: "MRes Humanities",                                                  lon:  0, york:  1 },
  { name: "MSc Environmental Sustainability & Management",                    lon:  0, york:  1 },
];

const YSJ_OTHER = [
  "BA (Hons) Business Management (Level 6)", "BA (Hons) International Business (Level 6)",
  "BA (Hons) International Tourism and Hospitality Management", "BA (Hons) Marketing",
  "BA (Hons) Marketing (Level 6)", "BA (Hons) Film and TV Production (Level 6)",
  "BA (Hons) Fine Art", "BA (Hons) Games Design", "BA (Hons) Graphic Design",
  "BA (Hons) Graphic Design (Level 6)", "BA (Hons) Interior Design",
  "BA (Hons) Media Production", "BA (Hons) Media Production (Level 6)",
  "BA (Hons) Music Production", "BA (Hons) Music Production (Level 6)",
  "BA (Hons) Product Design", "BA (Hons) Product Design (Level 6)",
  "MA Graphic Design", "MA Media Production", "MA Music Production",
  "MA Virtual and Augmented Reality", "MRes in Arts",
  "BA (Hons) Children, Young People & Society (Level 6)",
  "BA (Hons) Early Years Education and Care (Level 6)",
  "BA (Hons) English Language and Linguistics (Level 6)",
  "BSc (Hons) Psychology (Level 6)", "Professional Doctorate in Counselling Psychology",
  "BSc (Hons) Computer Science (Level 6)", "BSc (Hons) Software Engineering (Level 6)",
  "BSc Cyber Security (Level 6)", "BSc Games Development",
  "BSc (Hons) Physical Education and Sports Coaching (Level 6)",
  "BSc (Hons) Sport and Exercise Science (Level 6)", "BA (Hons) Creative Writing",
  "BA (Hons) English Literature", "BA (Hons) English Literature (Level 6)",
  "BA (Hons) Media and Communication (Level 6)",
  "BA (Hons) Politics and International Relations (Level 6)",
  "MA Creative Writing", "MA Publishing", "MA Environment and Social Justice",
  "MA History", "MA Contemporary Literature", "MA Religion in Society",
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const buildT = (courses, c1, c2) =>
  Object.fromEntries(courses.map(c => [c.name, { [c1]: c[c1] || 0, [c2]: c[c2] || 0 }]));
const blankA = (courses, c1, c2) =>
  Object.fromEntries(courses.map(c => [c.name, { [c1]: "", [c2]: "" }]));
const blankO = (list, c1, c2) =>
  Object.fromEntries(list.map(k => [k, { [c1]: "", [c2]: "" }]));

const ni  = (v) => parseInt(v) || 0;
const pct = (a, t) => t > 0 ? Math.min(100, Math.round((a / t) * 100)) : null;

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
function Bar({ value, max, color, h = 5 }) {
  const w = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: T.border, borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s ease" }} />
    </div>
  );
}

function StatusBadge({ p }) {
  if (p === null) return <span style={{ color: T.inkL, fontSize: 11 }}>—</span>;
  const cfg = p >= 100 ? { bg: "#DCFCE7", col: "#166534", label: "Met ✓" }
            : p >= 70  ? { bg: "#FEF9C3", col: "#854D0E", label: "On Track" }
                       : { bg: "#FEE2E2", col: "#991B1B", label: "Behind" };
  return <span style={{ background: cfg.bg, color: cfg.col, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, whiteSpace: "nowrap" }}>{cfg.label}</span>;
}

function Num({ value, onChange, accent, readOnly }) {
  const [focus, setFocus] = useState(false);
  if (readOnly) return (
    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: ni(value) ? 600 : 400, color: ni(value) ? accent : T.border }}>
      {ni(value) || "—"}
    </span>
  );
  return (
    <input type="number" min="0" value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      placeholder="0"
      style={{ width: 54, padding: "5px 4px", textAlign: "center", fontSize: 13, fontWeight: value ? 600 : 400, color: value ? accent : T.inkL, background: focus ? T.white : `${accent}12`, border: `1.5px solid ${focus ? accent : `${accent}30`}`, borderRadius: 6, outline: "none", transition: "all .12s", fontFamily: "ui-monospace, monospace" }}
    />
  );
}

// ── ACTUAL DEPOSITS CARD ──────────────────────────────────────────────────────
function ActualDepositsCard({ views }) {
  const [active, setActive] = useState(0);
  const v = views[active];
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px", flex: "0 0 260px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", display: "flex", flexDirection: "column" }}>
      <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.inkL, letterSpacing: ".07em", textTransform: "uppercase" }}>Actual Deposits</p>
      {/* Toggle pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
        {views.map((view, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "4px 11px", border: `1.5px solid ${active === i ? view.accent : T.border}`,
            borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: active === i ? `${view.accent}15` : T.white,
            color: active === i ? view.accent : T.inkL,
            fontFamily: "inherit", transition: "all .15s",
          }}>
            {view.label}
          </button>
        ))}
      </div>
      {/* Big number */}
      <p style={{ margin: "0 0 5px", fontSize: 60, fontWeight: 800, color: v.accent, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>
        {v.value}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: T.inkL, fontWeight: 500 }}>{v.sublabel}</p>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, max, sub, accent }) {
  const p = max ? pct(value, max) : null;
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 22px", flex: 1, minWidth: 150, transition: "box-shadow .2s", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,39,232,.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"}
    >
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: T.inkL, letterSpacing: ".07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: accent, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{value}</p>
      {max && (
        <>
          <div style={{ margin: "12px 0 6px" }}><Bar value={value} max={max} color={accent} h={6} /></div>
          <p style={{ margin: 0, fontSize: 11, color: T.inkL }}><span style={{ color: accent, fontWeight: 700 }}>{p}%</span> of {max}</p>
        </>
      )}
      {sub && <p style={{ margin: "8px 0 0", fontSize: 11, color: T.inkL }}>{sub}</p>}
    </div>
  );
}

// ── DONUT CHART ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 100 }) {
  const r = 38, cx = 50, cy = 50, stroke = 10;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  const slices = segments.map(seg => {
    const dash = total > 0 ? (seg.value / total) * circ : 0;
    const gap  = circ - dash;
    const slice = { ...seg, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8E4F0" strokeWidth={stroke} />
        : slices.map((sl, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={sl.color} strokeWidth={stroke}
              strokeDasharray={`${sl.dash} ${sl.gap}`}
              strokeDashoffset={-sl.offset}
              strokeLinecap="butt"
            />
          ))
      }
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" />
    </svg>
  );
}

// ── CYCLING HERO CARD ─────────────────────────────────────────────────────────
function HeroCard({ slides }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back
  const [anim, setAnim] = useState(false);

  const go = (next) => {
    setDir(next > idx ? 1 : -1);
    setAnim(true);
    setTimeout(() => { setIdx(next); setAnim(false); }, 160);
  };
  const prev = () => go((idx - 1 + slides.length) % slides.length);
  const next = () => go((idx + 1) % slides.length);

  const s = slides[idx];
  const p = s.max ? pct(s.value, s.max) : null;

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", minWidth: 220, flex: "0 0 240px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", position: "relative", overflow: "hidden" }}>
      {/* Slide content */}
      <div style={{ opacity: anim ? 0 : 1, transform: anim ? `translateY(${dir * 8}px)` : "translateY(0)", transition: "opacity .16s ease, transform .16s ease" }}>
        <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: T.inkL, letterSpacing: ".08em", textTransform: "uppercase" }}>{s.label}</p>
        {s.isPie ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 28 }}>
            <DonutChart segments={s.segments} size={90} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {s.segments.map((seg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: T.inkM, fontWeight: 500 }}>{seg.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: seg.color, fontFamily: "ui-monospace, monospace", marginLeft: 4 }}>{seg.value}</span>
                  {s.total > 0 && <span style={{ fontSize: 10, color: T.inkL }}>({Math.round(seg.value / s.total * 100)}%)</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 52, fontWeight: 800, color: s.accent, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{s.value}</p>
            {s.max && (
              <>
                <div style={{ margin: "14px 0 6px" }}><Bar value={s.value} max={s.max} color={s.accent} h={7} /></div>
                <p style={{ margin: 0, fontSize: 11, color: T.inkL }}><span style={{ color: s.accent, fontWeight: 700 }}>{p}%</span> of {s.max} target</p>
              </>
            )}
            {s.sub && <p style={{ margin: "8px 0 0", fontSize: 11, color: T.inkL }}>{s.sub}</p>}
          </>
        )}
      </div>

      {/* Nav arrows */}
      <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 4 }}>
        <button onClick={prev} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkM }}>‹</button>
        <button onClick={next} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkM }}>›</button>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 20, left: 24, display: "flex", gap: 4 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 99, border: "none", background: i === idx ? s.accent : T.border, cursor: "pointer", padding: 0, transition: "all .2s" }} />
        ))}
      </div>
    </div>
  );
}

// ── TABLE STYLES ──────────────────────────────────────────────────────────────
const TH = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: T.inkM, borderBottom: `1.5px solid ${T.border}`, background: "#FAFAFA", whiteSpace: "nowrap" };
const TC = { textAlign: "center" };
const TD = { padding: "10px 14px", verticalAlign: "middle", fontSize: 13, borderBottom: `1px solid ${T.bg}` };

// ── COURSE TABLE ──────────────────────────────────────────────────────────────
function CourseTable({ courses, actuals, onSetActuals, targets, onSetTargets, c1k, c2k, editable }) {
  const c1 = CAM[c1k], c2 = CAM[c2k];
  const setA = (key, s, v) => onSetActuals(p => ({ ...p, [key]: { ...p[key], [s]: v } }));
  const setT = (key, s, v) => onSetTargets(p => ({ ...p, [key]: { ...p[key], [s]: v } }));
  const c1A = courses.reduce((s, c) => s + ni(actuals[c.name]?.[c1k]), 0);
  const c2A = courses.reduce((s, c) => s + ni(actuals[c.name]?.[c2k]), 0);
  const c1T = courses.reduce((s, c) => s + ni(targets[c.name]?.[c1k]), 0);
  const c2T = courses.reduce((s, c) => s + ni(targets[c.name]?.[c2k]), 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>{c1.label} Target</th>
            <th style={{ ...TH, ...TC, background: c1.bg }}>Actual</th>
            <th style={{ ...TH, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>{c2.label} Target</th>
            <th style={{ ...TH, ...TC, background: c2.bg }}>Actual</th>
            <th style={{ ...TH, ...TC, borderLeft: `1.5px solid ${T.border}` }}>Target</th>
            <th style={{ ...TH, ...TC }}>Actual</th>
            <th style={{ ...TH, minWidth: 130 }}>Progress</th>
            <th style={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => {
            const lt = ni(targets[c.name]?.[c1k]), st = ni(targets[c.name]?.[c2k]);
            const la = ni(actuals[c.name]?.[c1k]), sa = ni(actuals[c.name]?.[c2k]);
            // Only count actuals toward progress if that campus has a target set
            const tot = (lt > 0 ? la : 0) + (st > 0 ? sa : 0);
            const tgt = lt + st, p = pct(tot, tgt);
            const barCol = p === null ? T.inkL : p >= 100 ? T.green : p >= 70 ? T.yellow : T.red;
            return (
              <tr key={c.name} style={{ background: i % 2 ? T.bg : T.white, transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0EAFF"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? T.bg : T.white}
              >
                <td style={{ ...TD, fontWeight: 500, color: T.ink, maxWidth: 260 }}>{c.name}</td>
                <td style={{ ...TD, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>
                  <Num value={targets[c.name]?.[c1k] ?? ""} accent={c1.col} onChange={v => setT(c.name, c1k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c1.bg }}>
                  <Num value={actuals[c.name]?.[c1k] || ""} accent={c1.col} onChange={v => setA(c.name, c1k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>
                  <Num value={targets[c.name]?.[c2k] ?? ""} accent={c2.col} onChange={v => setT(c.name, c2k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg }}>
                  <Num value={actuals[c.name]?.[c2k] || ""} accent={c2.col} onChange={v => setA(c.name, c2k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 600, color: T.inkM, borderLeft: `1.5px solid ${T.border}`, fontFamily: "ui-monospace, monospace" }}>{tgt || "—"}</td>
                <td style={{ ...TD, ...TC, fontWeight: 700, fontSize: 15, color: tot > 0 ? T.ink : T.border, fontFamily: "ui-monospace, monospace" }}>{tot || "—"}</td>
                <td style={{ ...TD, minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><Bar value={tot} max={tgt} color={barCol} h={6} /></div>
                    <span style={{ fontSize: 11, color: T.inkL, width: 30, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{p ?? 0}%</span>
                  </div>
                </td>
                <td style={TD}><StatusBadge p={p} /></td>
              </tr>
            );
          })}
          {/* Totals */}
          <tr style={{ background: T.purple }}>
            <td style={{ ...TD, color: T.white, fontWeight: 700, fontSize: 13 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#DDD6FE", fontWeight: 700, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{c1T}</td>
            <td style={{ ...TD, ...TC, color: "#DDD6FE", fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.08)", fontFamily: "ui-monospace, monospace" }}>{c1A}</td>
            <td style={{ ...TD, ...TC, color: "#FDE68A", fontWeight: 700, background: "rgba(255,255,255,.06)", borderLeft: "2px solid rgba(255,255,255,.12)", fontFamily: "ui-monospace, monospace" }}>{c2T}</td>
            <td style={{ ...TD, ...TC, color: "#FDE68A", fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.06)", fontFamily: "ui-monospace, monospace" }}>{c2A}</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 700, borderLeft: "1.5px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{c1T + c2T}</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 18, fontFamily: "ui-monospace, monospace" }}>{c1A + c2A}</td>
            <td colSpan={2} style={TD}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,.2)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct(c1A + c2A, c1T + c2T) ?? 0}%`, height: "100%", background: T.white, borderRadius: 99, transition: "width .4s" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12, fontFamily: "ui-monospace, monospace", width: 36, textAlign: "right" }}>{pct(c1A + c2A, c1T + c2T) ?? 0}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── OTHER COURSES TABLE ───────────────────────────────────────────────────────
function OtherTable({ list, actuals, onSet, c1k, c2k, editable }) {
  const c1 = CAM[c1k], c2 = CAM[c2k];
  const set  = (key, s, v) => onSet(p => ({ ...p, [key]: { ...p[key], [s]: v } }));
  const tot1 = list.reduce((s, c) => s + ni(actuals[c]?.[c1k]), 0);
  const tot2 = list.reduce((s, c) => s + ni(actuals[c]?.[c2k]), 0);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>{c1.label}</th>
            <th style={{ ...TH, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>{c2.label}</th>
            <th style={{ ...TH, ...TC, borderLeft: `1.5px solid ${T.border}` }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => {
            const v1 = ni(actuals[c]?.[c1k]), v2 = ni(actuals[c]?.[c2k]);
            return (
              <tr key={c} style={{ background: i % 2 ? T.bg : T.white }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0EAFF"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? T.bg : T.white}
              >
                <td style={{ ...TD, fontWeight: 500, color: T.ink }}>{c}</td>
                <td style={{ ...TD, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>
                  <Num value={actuals[c]?.[c1k] || ""} accent={c1.col} onChange={v => set(c, c1k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>
                  <Num value={actuals[c]?.[c2k] || ""} accent={c2.col} onChange={v => set(c, c2k, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 700, fontSize: 15, color: v1 + v2 > 0 ? T.ink : T.border, borderLeft: `1.5px solid ${T.border}`, fontFamily: "ui-monospace, monospace" }}>{v1 + v2 || "—"}</td>
              </tr>
            );
          })}
          <tr style={{ background: T.purple }}>
            <td style={{ ...TD, color: T.white, fontWeight: 700 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#DDD6FE", fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{tot1}</td>
            <td style={{ ...TD, ...TC, color: "#FDE68A", fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.06)", borderLeft: "2px solid rgba(255,255,255,.12)", fontFamily: "ui-monospace, monospace" }}>{tot2}</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 18, borderLeft: "1.5px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{tot1 + tot2}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── PASSCODE MODAL ────────────────────────────────────────────────────────────
function PasscodeModal({ onSuccess, onClose }) {
  const [val, setVal] = useState(""), [err, setErr] = useState(false), [shake, setShake] = useState(false);
  const go = () => {
    if (val === PASSCODE) { onSuccess(); }
    else { setErr(true); setShake(true); setTimeout(() => setShake(false), 380); setVal(""); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(22,17,43,.6)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 18, padding: "36px 40px", width: 370, boxShadow: "0 24px 64px rgba(108,39,232,.2)", transform: shake ? "translateX(-5px)" : "none", transition: "transform .06s" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>🔒</div>
        <h2 style={{ margin: "0 0 6px", textAlign: "center", fontSize: 20, fontWeight: 800, color: T.ink }}>Editor Access</h2>
        <p style={{ margin: "0 0 24px", textAlign: "center", fontSize: 13, color: T.inkL }}>Enter your passcode to enable editing.</p>
        <input type="password" autoFocus value={val}
          onChange={e => { setVal(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && go()} placeholder="Passcode"
          style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `2px solid ${err ? T.red : T.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", marginBottom: err ? 8 : 14, color: T.ink, boxSizing: "border-box" }}
        />
        {err && <p style={{ color: T.red, fontSize: 12, margin: "0 0 14px", fontWeight: 500 }}>Incorrect — please try again.</p>}
        <button onClick={go} style={{ width: "100%", padding: "12px", background: T.purple, color: T.white, border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.background = "#5720C8"}
          onMouseLeave={e => e.currentTarget.style.background = T.purple}
        >Unlock Editing</button>
        <button onClick={onClose} style={{ width: "100%", marginTop: 8, padding: "9px", background: "transparent", color: T.inkL, border: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── INTAKE BADGE ──────────────────────────────────────────────────────────────
function IntakeToggle({ value, onChange }) {
  const opts = [{ id: "sep26", label: "Sep 2026" }, { id: "jan27", label: "Jan 2027" }];
  return (
    <div style={{ display: "inline-flex", background: T.bg, borderRadius: 8, padding: 3, border: `1px solid ${T.border}` }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{ padding: "6px 16px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: value === o.id ? T.white : "transparent", color: value === o.id ? T.amber : T.inkL, boxShadow: value === o.id ? "0 1px 3px rgba(0,0,0,.1)" : "none", transition: "all .15s" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  // Sunderland
  const [sunA, setSunA] = useState(() => blankA(SUN_COURSES, "lon", "sun"));
  const [sunT, setSunT] = useState(() => buildT(SUN_COURSES, "lon", "sun"));
  const [sunO, setSunO] = useState(() => blankO(SUN_OTHER, "lon", "sun"));
  // YSJ Sep 2026 only
  const [ysjA_s, setYsjA_s] = useState(() => blankA(YSJ_COURSES, "lon", "york"));
  const [ysjT_s, setYsjT_s] = useState(() => buildT(YSJ_COURSES, "lon", "york"));
  const [ysjO_s, setYsjO_s] = useState(() => blankO(YSJ_OTHER, "lon", "york"));
  // UI
  const [activeUni,    setActiveUni]    = useState("sun");
  const [subTab,       setSubTab]       = useState("core");
  const [editable,     setEditable]     = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [updatedAt,    setUpdatedAt]    = useState(null);
  const [logo,         setLogo]         = useState(null);

  const refs    = useRef({});
  refs.current  = { sunA, sunT, sunO, ysjA_s, ysjT_s, ysjO_s, logo };
  const timer   = useRef(null);
  const editRef = useRef(editable);
  useEffect(() => { editRef.current = editable; }, [editable]);

  const fmtDate = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  // ── Load & subscribe ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("tracker_data").select("*").eq("id", 1).single();
      if (data) {
        const s = (fn, v) => v && Object.keys(v).length && fn(v);
        s(setSunA,   data.actuals);
        s(setSunT,   data.targets);
        s(setSunO,   data.other_actuals);
        s(setYsjA_s, data.ysj_actuals);
        s(setYsjT_s, data.ysj_targets);
        s(setYsjO_s, data.ysj_other_actuals);
        if (data.logo_data) setLogo(data.logo_data);
        if (data.updated_at) setUpdatedAt(fmtDate(data.updated_at));
      }
      setLoading(false);
    };
    load();
    const ch = supabase.channel("rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tracker_data" }, ({ new: row }) => {
        if (editRef.current) return;
        const s = (fn, v) => v && Object.keys(v).length && fn(v);
        s(setSunA,   row.actuals);       s(setSunT,   row.targets);
        s(setSunO,   row.other_actuals); s(setYsjA_s, row.ysj_actuals);
        s(setYsjT_s, row.ysj_targets);  s(setYsjO_s, row.ysj_other_actuals);
        if (row.logo_data) setLogo(row.logo_data);
        if (row.updated_at) setUpdatedAt(fmtDate(row.updated_at));
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const save = useCallback(() => {
    clearTimeout(timer.current);
    setSaving(true);
    timer.current = setTimeout(async () => {
      const now = new Date().toISOString(), r = refs.current;
      await supabase.from("tracker_data").update({
        actuals: r.sunA, targets: r.sunT, other_actuals: r.sunO,
        ysj_actuals: r.ysjA_s, ysj_targets: r.ysjT_s, ysj_other_actuals: r.ysjO_s,
        logo_data: r.logo, updated_at: now,
      }).eq("id", 1);
      setSaving(false);
      setUpdatedAt(fmtDate(now));
    }, 700);
  }, []);

  const wrap = (setter) => useCallback((u) => {
    setter(p => { const x = typeof u === "function" ? u(p) : u; if (editRef.current) save(); return x; });
  }, [save]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hSunA   = useCallback(u => { setSunA(p   => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hSunT   = useCallback(u => { setSunT(p   => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hSunO   = useCallback(u => { setSunO(p   => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hYsjAs  = useCallback(u => { setYsjA_s(p => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hYsjTs  = useCallback(u => { setYsjT_s(p => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hYsjOs  = useCallback(u => { setYsjO_s(p => { const x=typeof u==="function"?u(p):u; if(editRef.current)save(); return x; }); }, [save]);

  const handleLogo = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setLogo(r.result); if (editRef.current) save(); };
    r.readAsDataURL(f);
  };

  // ── Totals ────────────────────────────────────────────────────────────────────
  // Core only — used for progress cards (like-for-like vs targets)
  const sunCoreTot  = SUN_COURSES.reduce((s, c) => s + (ni(sunT[c.name]?.lon) > 0 ? ni(sunA[c.name]?.lon) : 0) + (ni(sunT[c.name]?.sun) > 0 ? ni(sunA[c.name]?.sun) : 0), 0);
  const sunTgt      = SUN_COURSES.reduce((s, c) => s + ni(sunT[c.name]?.lon)  + ni(sunT[c.name]?.sun),  0);

  const ysjsCoreT   = YSJ_COURSES.reduce((s, c) => s + (ni(ysjT_s[c.name]?.lon) > 0 ? ni(ysjA_s[c.name]?.lon) : 0) + (ni(ysjT_s[c.name]?.york) > 0 ? ni(ysjA_s[c.name]?.york) : 0), 0);
  const ysjsTgt     = YSJ_COURSES.reduce((s, c) => s + ni(ysjT_s[c.name]?.lon) + ni(ysjT_s[c.name]?.york), 0);

  // Full totals (core + other) — used for Actual Deposits switcher card only
  const sunOtherTot = SUN_OTHER.reduce((s, c) => s + ni(sunO[c]?.lon) + ni(sunO[c]?.sun), 0);
  const sunTot      = SUN_COURSES.reduce((s, c) => s + ni(sunA[c.name]?.lon) + ni(sunA[c.name]?.sun), 0) + sunOtherTot;

  const ysjsOtherT  = YSJ_OTHER.reduce((s, c) => s + ni(ysjO_s[c]?.lon) + ni(ysjO_s[c]?.york), 0);
  const ysjsTot     = YSJ_COURSES.reduce((s, c) => s + ni(ysjA_s[c.name]?.lon) + ni(ysjA_s[c.name]?.york), 0) + ysjsOtherT;

  const grandTot = sunTot + ysjsTot;           // full actuals — for switcher
  const grandTgt = sunTgt + ysjsTgt;           // core targets
  const grandCore = sunCoreTot + ysjsCoreT;    // core actuals — for progress cards

  const uniTab = (id, label, accent, active) => (
    <button onClick={() => { setActiveUni(id); setSubTab("core"); }}
      style={{ padding: "14px 28px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: active ? T.white : "transparent", color: active ? accent : T.inkL, borderBottom: active ? `3px solid ${accent}` : "3px solid transparent", transition: "all .15s", borderRadius: "10px 10px 0 0", letterSpacing: ".01em" }}>
      {label}
    </button>
  );

  const subBtn = (id, label) => (
    <button onClick={() => setSubTab(id)}
      style={{ padding: "7px 16px", border: `1px solid ${subTab === id ? T.purple : T.border}`, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit", background: subTab === id ? T.purpleL : T.white, color: subTab === id ? T.purple : T.inkL, borderRadius: 7, transition: "all .15s" }}>
      {label}
    </button>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📊</div>
      <p style={{ margin: 0, fontSize: 15, color: T.inkM, fontWeight: 600 }}>Loading…</p>
    </div>
  );

  return (
    <>
      {showModal && <PasscodeModal onSuccess={() => { setEditable(true); setShowModal(false); }} onClose={() => setShowModal(false)} />}

      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bg, minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <div style={{ background: T.white, borderBottom: `3px solid ${T.purple}`, padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Logo */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {logo
                ? <img src={logo} alt="Study Now" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain" }} />
                : <div style={{ width: 44, height: 44, borderRadius: 10, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: T.white, letterSpacing: "-.5px" }}>SN</span>
                  </div>
              }
              {editable && (
                <label style={{ position: "absolute", inset: 0, cursor: "pointer", borderRadius: 10, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  title="Upload logo"
                >
                  <span style={{ fontSize: 16 }}>📷</span>
                  <input type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
                </label>
              )}
            </div>
            <div>
              <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: T.inkL, letterSpacing: ".12em", textTransform: "uppercase" }}>Study Now</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: "-.03em" }}>Deposit Tracker</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {saving
              ? <span style={{ fontSize: 11, color: T.inkL, fontStyle: "italic" }}>Saving…</span>
              : updatedAt && <span style={{ fontSize: 11, color: T.inkL }}>Updated {updatedAt}</span>
            }
            {editable
              ? <button onClick={() => setEditable(false)} style={{ background: T.green, border: "none", color: T.white, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>🔓 Lock</button>
              : <button onClick={() => setShowModal(true)} style={{ background: T.purple, border: "none", color: T.white, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#5720C8"}
                  onMouseLeave={e => e.currentTarget.style.background = T.purple}
                >🔒 Edit</button>
            }
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ padding: "32px 40px" }}>

          {/* STATS ROW */}
          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap", alignItems: "stretch" }}>
            <ActualDepositsCard views={[
              { label: "All",          value: grandTot, accent: T.purple, sublabel: "Total across all universities" },
              { label: "Sunderland",   value: sunTot,   accent: T.teal,   sublabel: "University of Sunderland · Aug–Nov 2026" },
              { label: "York St John", value: ysjsTot,  accent: T.amber,  sublabel: "York St John · September 2026 intake" },
            ]} />
            <HeroCard slides={[
              { label: "Study Now · All vs Target", value: grandCore, max: grandTgt, accent: T.purple },
              { label: "University of Sunderland",  value: sunCoreTot, max: sunTgt,  accent: T.teal   },
              { label: "York St John · Sep 2026",   value: ysjsCoreT,  max: ysjsTgt, accent: T.amber  },
              { label: "Breakdown", isPie: true,
                segments: [
                  { label: "Sunderland",   value: sunTot,  color: T.teal  },
                  { label: "York St John", value: ysjsTot, color: T.amber },
                ],
                total: grandTot, accent: T.purple,
              },
            ]} />
          </div>
          {/* Row 2: Individual target cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 36, flexWrap: "wrap" }}>
            <StatCard label="Univ. of Sunderland"    value={sunCoreTot} max={sunTgt}  accent={T.teal}  />
            <StatCard label="York St John · Sep 2026" value={ysjsCoreT}  max={ysjsTgt} accent={T.amber} />
          </div>

          {/* UNIVERSITY TABS */}
          <div style={{ borderBottom: `2px solid ${T.border}`, display: "flex", gap: 0, marginBottom: 0 }}>
            {uniTab("sun", "University of Sunderland", T.teal,   activeUni === "sun")}
            {uniTab("ysj", "York St John University",  T.amber,  activeUni === "ysj")}
          </div>

          {/* CONTENT PANEL */}
          <div style={{ background: T.white, borderRadius: "0 12px 12px 12px", border: `1px solid ${T.border}`, borderTop: "none", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>

            {/* Panel toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFAFA", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {subBtn("core", "Core Courses")}
                {subBtn("other", "Other Courses")}
              </div>
              {activeUni === "sun" && (
                <span style={{ fontSize: 11, color: T.inkL, background: T.tealL, padding: "4px 10px", borderRadius: 99, fontWeight: 600 }}>Aug – Nov 2026</span>
              )}
              {activeUni === "ysj" && (
                <span style={{ fontSize: 11, color: T.inkL, background: T.amberL, padding: "4px 10px", borderRadius: 99, fontWeight: 600 }}>Sep 2026</span>
              )}
            </div>

            {/* Table content */}
            {activeUni === "sun" && subTab === "core" && (
              <CourseTable courses={SUN_COURSES} actuals={sunA} onSetActuals={hSunA} targets={sunT} onSetTargets={hSunT} c1k="lon" c2k="sun" editable={editable} />
            )}
            {activeUni === "sun" && subTab === "other" && (
              <OtherTable list={SUN_OTHER} actuals={sunO} onSet={hSunO} c1k="lon" c2k="sun" editable={editable} />
            )}
            {activeUni === "ysj" && subTab === "core" && (
              <CourseTable courses={YSJ_COURSES} actuals={ysjA_s} onSetActuals={hYsjAs} targets={ysjT_s} onSetTargets={hYsjTs} c1k="lon" c2k="york" editable={editable} />
            )}
            {activeUni === "ysj" && subTab === "other" && (
              <OtherTable list={YSJ_OTHER} actuals={ysjO_s} onSet={hYsjOs} c1k="lon" c2k="york" editable={editable} />
            )}
          </div>

          <p style={{ margin: "16px 0 0", fontSize: 11, color: T.inkL, textAlign: "center" }}>
            Includes: Deposits · Sept 26 Deposits · Defer/Refund/Change Uni &nbsp;·&nbsp; Closed Lost excluded
          </p>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.white, fontSize: 8, fontWeight: 900 }}>SN</span>
            </div>
            <span style={{ fontSize: 11, color: T.inkL }}>Study Now · Internal Tool</span>
          </div>
          <span style={{ fontSize: 11, color: T.inkL }}>© {new Date().getFullYear()} Study Now</span>
        </div>
      </div>
    </>
  );
}
