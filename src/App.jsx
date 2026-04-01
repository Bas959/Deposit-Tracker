import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE;

// ── BRAND ─────────────────────────────────────────────────────────────────────
const B = {
  purple:      "#7B2FFF", purpleDark: "#5A1FCC", purpleLight: "#F3EEFF", purpleMid: "#E0D0FF",
  white:       "#FFFFFF", silver: "#D0CCD8", silverLight: "#F7F5FA",
  ink:         "#1A1428", inkMid: "#4A4460", inkLight: "#8C84A0", border: "#E8E4F0",
  green:       "#22c55e", amber: "#f59e0b", red: "#ef4444",
};

// Campus colour palettes
const CAM = {
  lon:  { col: "#7B2FFF", bg: "#FAF5FF", sep: "#E9D5FF", label: "London"      },
  sun:  { col: "#0891b2", bg: "#F0FDFF", sep: "#BAE6FD", label: "Sunderland"  },
  york: { col: "#D97706", bg: "#FFFBEB", sep: "#FDE68A", label: "York"        },
};

// ── UNIVERSITY CONFIG ─────────────────────────────────────────────────────────
const UNI = {
  sunderland: {
    id: "sunderland", shortName: "Sunderland", color: "#0891b2",
    fullName: "University of Sunderland",
    campus1: "lon", campus2: "sun",
    courses: [
      { name: "MSc Nursing Practice – London",      lon: 20, sun:  0 },
      { name: "MSc Public Health",                  lon: 20, sun: 40 },
      { name: "MSc Nursing",                        lon:  0, sun: 40 },
      { name: "MBA Business Administration",        lon: 15, sun: 25 },
      { name: "MSc Cybersecurity",                  lon:  0, sun: 20 },
      { name: "MSc Data Science",                   lon:  0, sun: 50 },
      { name: "MSc Computing",                      lon:  0, sun: 40 },
      { name: "MSc Engineering Management",         lon:  0, sun: 15 },
      { name: "MSc Digital Marketing & Analytics",  lon:  0, sun: 20 },
    ],
    otherCourses: [
      "OSPAP", "MA Education", "MA Marketing", "BSc (Hons) Nursing",
      "BSc (Hons) Nursing Practice (Top Up)", "BSc (Hons) Health and Social Care",
      "BEng Electronic & Electrical Engineering",
    ],
  },
  ysj: {
    id: "ysj", shortName: "York St John", color: "#D97706",
    fullName: "York St John University",
    campus1: "lon", campus2: "york",
    courses: [
      // London campus
      { name: "MBA (London)",                                                            lon: 10, york:  0 },
      { name: "MSc Global Healthcare Management",                                        lon:  5, york:  0 },
      { name: "MSc International Project Management",                                    lon:  5, york:  0 },
      { name: "MSc Digital Marketing",                                                   lon:  5, york:  0 },
      { name: "MSc Public Health (YSJ)",                                                 lon:  6, york:  0 },
      { name: "MSc Data Science (YSJ)",                                                  lon:  6, york:  0 },
      { name: "MSc Computer Science (London)",                                           lon:  6, york:  0 },
      { name: "MSc Computing (Top-up)",                                                  lon:  2, york:  0 },
      { name: "MSc Business Computing (Top-up)",                                         lon:  2, york:  0 },
      { name: "BA Global Business Management (Top-up)",                                  lon:  2, york:  0 },
      { name: "MSc Tourism & Hospitality",                                               lon:  3, york:  0 },
      { name: "MRes Management Studies",                                                 lon:  6, york:  0 },
      // York campus — YBS
      { name: "BA (Hons) Accounting and Finance",                                        lon:  0, york:  1 },
      { name: "BA (Hons) Business Management",                                           lon:  0, york:  1 },
      { name: "BA (Hons) International Business",                                        lon:  0, york:  1 },
      { name: "BA (Hons) International Tourism & Hospitality Mgmt with Foundation Year", lon:  0, york:  1 },
      { name: "Masters Business Administration (York)",                                  lon:  0, york: 10 },
      { name: "MBA Healthcare Management",                                               lon:  0, york: 10 },
      { name: "MSc Human Resource Management",                                           lon:  0, york:  5 },
      { name: "MSc Project Management",                                                  lon:  0, york:  5 },
      { name: "MSc International Business",                                              lon:  0, york:  5 },
      { name: "MRes in Business",                                                        lon:  0, york:  6 },
      { name: "MSc Marketing",                                                           lon:  0, york:  2 },
      { name: "MSc Strategic Digital Marketing",                                         lon:  0, york:  2 },
      // York campus — Arts
      { name: "MSc Product Design",                                                      lon:  0, york:  1 },
      // York campus — ELP
      { name: "BSc (Hons) Psychology",                                                   lon:  0, york:  1 },
      { name: "MA TESOL",                                                                lon:  0, york:  1 },
      { name: "MSc Psychology of Child & Adolescent Development",                        lon:  0, york:  1 },
      { name: "MA Education (YSJ)",                                                      lon:  0, york:  2 },
      { name: "MRes in Psychology",                                                      lon:  0, york:  1 },
      { name: "MRes in Education",                                                       lon:  0, york:  1 },
      { name: "MRes in Linguistics",                                                     lon:  0, york:  1 },
      // York campus — STH
      { name: "BSc (Hons) Computer Science (York)",                                      lon:  0, york:  1 },
      { name: "BSc (Hons) Software Engineering",                                         lon:  0, york:  1 },
      { name: "BSc Cyber Security",                                                      lon:  0, york:  1 },
      { name: "BSc (Hons) Biomedical Science",                                           lon:  0, york:  1 },
      { name: "MRes Social Science",                                                     lon:  0, york:  1 },
      { name: "MRes Science and Health",                                                 lon:  0, york:  1 },
      // York campus — Humanities
      { name: "MA International Politics and Security",                                  lon:  0, york:  1 },
      { name: "MRes Humanities",                                                         lon:  0, york:  1 },
      { name: "MSc Environmental Sustainability & Management",                           lon:  0, york:  1 },
    ],
    otherCourses: [],
  },
};

// Build default targets from course config
function buildDefaultTargets(courses, c1, c2) {
  return Object.fromEntries(courses.map(c => [c.name, { [c1]: c[c1] || 0, [c2]: c[c2] || 0 }]));
}

const blankActuals = (courses, c1, c2) =>
  Object.fromEntries(courses.map(c => [c.name, { [c1]: "", [c2]: "" }]));
const blankOther = (list) => Object.fromEntries(list.map(k => [k, { lon: "", sun: "" }]));

const n   = (v) => parseInt(v) || 0;
const pct = (a, t) => (t > 0 ? Math.min(100, Math.round((a / t) * 100)) : null);

function statusColor(p) {
  if (p === null) return { bg: B.silverLight, text: B.inkLight, label: "—" };
  if (p >= 100)   return { bg: "#dcfce7", text: "#15803d", label: "Target Met ✓" };
  if (p >= 70)    return { bg: "#fef9c3", text: "#a16207", label: "On Track" };
  return                  { bg: "#fee2e2", text: "#b91c1c", label: "Behind" };
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color, height = 7 }) {
  const w = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: B.purpleMid, borderRadius: 99, height, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Pill({ p }) {
  const s = statusColor(p);
  if (p === null) return <span style={{ color: B.inkLight, fontSize: 11 }}>—</span>;
  return <span style={{ background: s.bg, color: s.text, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function NumInput({ value, onChange, accent, readOnly }) {
  const [focus, setFocus] = useState(false);
  if (readOnly) return <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: n(value) ? 700 : 400, color: n(value) ? accent : B.border, fontSize: 15 }}>{n(value) || "—"}</span>;
  return (
    <input type="number" min="0" value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder="0"
      style={{ width: 58, padding: "6px", textAlign: "center", fontSize: 14, fontWeight: value ? 700 : 400, color: value ? accent : B.inkLight, background: focus ? B.white : B.purpleLight, border: `1.5px solid ${focus ? accent : B.purpleMid}`, borderRadius: 7, outline: "none", transition: "all .15s", fontFamily: "'DM Mono', monospace" }}
    />
  );
}

function KpiCard({ label, value, max, sub, color, size = "normal" }) {
  const p = max ? pct(value, max) : null;
  const big = size === "large";
  return (
    <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 16, padding: big ? "22px 28px" : "18px 22px", flex: 1, minWidth: big ? 180 : 140, boxShadow: "0 1px 4px rgba(123,47,255,.06)", transition: "box-shadow .2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(123,47,255,.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(123,47,255,.06)"}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: B.inkLight, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: big ? 44 : 34, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</div>
      {max && <><div style={{ marginTop: 12 }}><ProgressBar value={value} max={max} color={color} /></div><div style={{ fontSize: 11, color: B.inkLight, marginTop: 6 }}><span style={{ color, fontWeight: 700 }}>{p}%</span> of {max} target</div></>}
      {sub && !max && <div style={{ fontSize: 12, color: B.inkLight, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── TABLE STYLES ──────────────────────────────────────────────────────────────
const TH = { padding: "11px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: B.inkMid, borderBottom: `2px solid ${B.border}`, whiteSpace: "nowrap", background: B.silverLight };
const TC = { textAlign: "center" };
const TD = { padding: "11px 14px", verticalAlign: "middle", fontSize: 13, borderBottom: `1px solid ${B.silverLight}` };

// ── GENERIC UNIVERSITY TABLE ──────────────────────────────────────────────────
function UniCoreTable({ uni, actuals, onSetActuals, targets, onSetTargets, editable }) {
  const { courses, campus1: c1key, campus2: c2key } = uni;
  const c1 = CAM[c1key], c2 = CAM[c2key];
  const setA = (key, side, val) => onSetActuals(p => ({ ...p, [key]: { ...p[key], [side]: val } }));
  const setT = (key, side, val) => onSetTargets(p => ({ ...p, [key]: { ...p[key], [side]: val } }));
  const c1ActTot = courses.reduce((s, c) => s + n(actuals[c.name]?.[c1key]), 0);
  const c2ActTot = courses.reduce((s, c) => s + n(actuals[c.name]?.[c2key]), 0);
  const c1TgtTot = courses.reduce((s, c) => s + n(targets[c.name]?.[c1key]), 0);
  const c2TgtTot = courses.reduce((s, c) => s + n(targets[c.name]?.[c2key]), 0);
  const grandAct = c1ActTot + c2ActTot;
  const grandTgt = c1TgtTot + c2TgtTot;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>{c1.label}<br/>Target</th>
            <th style={{ ...TH, ...TC, background: c1.bg }}>{c1.label}<br/>Actual</th>
            <th style={{ ...TH, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>{c2.label}<br/>Target</th>
            <th style={{ ...TH, ...TC, background: c2.bg }}>{c2.label}<br/>Actual</th>
            <th style={{ ...TH, ...TC, borderLeft: `2px solid ${B.border}` }}>Total<br/>Target</th>
            <th style={{ ...TH, ...TC }}>Total<br/>Actual</th>
            <th style={{ ...TH, minWidth: 140 }}>Progress</th>
            <th style={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => {
            const lt = n(targets[c.name]?.[c1key]), st = n(targets[c.name]?.[c2key]);
            const la = n(actuals[c.name]?.[c1key]),  sa = n(actuals[c.name]?.[c2key]);
            const tot = la + sa, tgt = lt + st;
            const p   = pct(tot, tgt);
            const bar = p === null ? B.inkLight : p >= 100 ? B.green : p >= 70 ? B.amber : B.red;
            return (
              <tr key={c.name} style={{ background: i % 2 ? B.silverLight : B.white }}>
                <td style={{ ...TD, fontWeight: 600, color: B.ink }}>{c.name}</td>
                <td style={{ ...TD, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>
                  <NumInput value={targets[c.name]?.[c1key] ?? ""} accent={c1.col} onChange={v => setT(c.name, c1key, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c1.bg }}>
                  {lt > 0 ? <NumInput value={actuals[c.name]?.[c1key] || ""} accent={c1.col} onChange={v => setA(c.name, c1key, v)} readOnly={!editable} /> : <span style={{ color: B.border, fontSize: 12 }}>N/A</span>}
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>
                  <NumInput value={targets[c.name]?.[c2key] ?? ""} accent={c2.col} onChange={v => setT(c.name, c2key, v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg }}>
                  {st > 0 ? <NumInput value={actuals[c.name]?.[c2key] || ""} accent={c2.col} onChange={v => setA(c.name, c2key, v)} readOnly={!editable} /> : <span style={{ color: B.border, fontSize: 12 }}>N/A</span>}
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 700, borderLeft: `2px solid ${B.border}`, color: B.inkMid }}>{tgt || "—"}</td>
                <td style={{ ...TD, ...TC, fontWeight: 800, fontSize: 16, color: tot > 0 ? B.ink : B.border, fontFamily: "'DM Mono', monospace" }}>{tot || "—"}</td>
                <td style={{ ...TD, minWidth: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={tot} max={tgt} color={bar} /></div>
                    <span style={{ fontSize: 11, color: B.inkMid, width: 34, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>{p ?? 0}%</span>
                  </div>
                </td>
                <td style={TD}><Pill p={p} /></td>
              </tr>
            );
          })}
          <tr style={{ background: B.purple }}>
            <td style={{ ...TD, color: B.white, fontWeight: 800, fontSize: 14 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#e9d5ff", fontWeight: 700, background: "rgba(255,255,255,.1)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{c1TgtTot}</td>
            <td style={{ ...TD, ...TC, color: "#e9d5ff", fontWeight: 800, fontSize: 17, background: "rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>{c1ActTot}</td>
            <td style={{ ...TD, ...TC, color: "#fde68a", fontWeight: 700, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{c2TgtTot}</td>
            <td style={{ ...TD, ...TC, color: "#fde68a", fontWeight: 800, fontSize: 17, background: "rgba(255,255,255,.08)", fontFamily: "'DM Mono', monospace" }}>{c2ActTot}</td>
            <td style={{ ...TD, ...TC, color: B.white, fontWeight: 700, borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{grandTgt}</td>
            <td style={{ ...TD, ...TC, color: B.white, fontWeight: 800, fontSize: 19, fontFamily: "'DM Mono', monospace" }}>{grandAct}</td>
            <td style={{ ...TD }} colSpan={2}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,.2)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct(grandAct, grandTgt) ?? 0}%`, height: "100%", background: B.white, borderRadius: 99, transition: "width .4s" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontFamily: "'DM Mono', monospace", width: 38, textAlign: "right" }}>{pct(grandAct, grandTgt) ?? 0}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── SUNDERLAND OTHER COURSES TABLE ────────────────────────────────────────────
function SunderlandOtherTable({ otherAct, onSetOtherAct, editable }) {
  const c1 = CAM.lon, c2 = CAM.sun;
  const set   = (key, side, val) => onSetOtherAct(p => ({ ...p, [key]: { ...p[key], [side]: val } }));
  const lonT  = UNI.sunderland.otherCourses.reduce((s, c) => s + n(otherAct[c]?.lon), 0);
  const sunT  = UNI.sunderland.otherCourses.reduce((s, c) => s + n(otherAct[c]?.sun), 0);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>London</th>
            <th style={{ ...TH, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>Sunderland</th>
            <th style={{ ...TH, ...TC, borderLeft: `2px solid ${B.border}` }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {UNI.sunderland.otherCourses.map((c, i) => {
            const l = n(otherAct[c]?.lon), s = n(otherAct[c]?.sun);
            return (
              <tr key={c} style={{ background: i % 2 ? B.silverLight : B.white }}>
                <td style={{ ...TD, fontWeight: 600, color: B.ink }}>{c}</td>
                <td style={{ ...TD, ...TC, background: c1.bg, borderLeft: `2px solid ${c1.sep}` }}>
                  <NumInput value={otherAct[c]?.lon || ""} accent={c1.col} onChange={v => set(c, "lon", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: c2.bg, borderLeft: `2px solid ${c2.sep}` }}>
                  <NumInput value={otherAct[c]?.sun || ""} accent={c2.col} onChange={v => set(c, "sun", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 800, fontSize: 16, color: l + s > 0 ? B.ink : B.border, borderLeft: `2px solid ${B.border}`, fontFamily: "'DM Mono', monospace" }}>{l + s || "—"}</td>
              </tr>
            );
          })}
          <tr style={{ background: B.purple }}>
            <td style={{ ...TD, color: B.white, fontWeight: 800 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#e9d5ff", fontWeight: 800, fontSize: 17, background: "rgba(255,255,255,.1)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{lonT}</td>
            <td style={{ ...TD, ...TC, color: "#fde68a", fontWeight: 800, fontSize: 17, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{sunT}</td>
            <td style={{ ...TD, ...TC, color: B.white, fontWeight: 800, fontSize: 19, borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "'DM Mono', monospace" }}>{lonT + sunT}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── PASSCODE MODAL ────────────────────────────────────────────────────────────
function PasscodeModal({ onSuccess, onClose }) {
  const [value, setValue] = useState(""), [error, setError] = useState(false), [shake, setShake] = useState(false);
  const submit = () => {
    if (value === PASSCODE) { onSuccess(); }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 400); setValue(""); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,40,.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: B.white, borderRadius: 20, padding: "40px 44px", width: 390, boxShadow: "0 32px 80px rgba(123,47,255,.25)", transform: shake ? "translateX(-6px)" : "none", transition: "transform .07s" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: B.purple, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24 }}>🔒</div>
        <h2 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 21, fontWeight: 800, color: B.ink }}>Editor Access</h2>
        <p style={{ margin: "0 0 28px", textAlign: "center", fontSize: 13, color: B.inkMid, lineHeight: 1.5 }}>Enter your passcode to unlock editing.</p>
        <input type="password" autoFocus value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()} placeholder="Passcode"
          style={{ width: "100%", padding: "13px 16px", fontSize: 16, border: `2px solid ${error ? B.red : B.border}`, borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", marginBottom: error ? 8 : 16, color: B.ink }}
        />
        {error && <p style={{ color: B.red, fontSize: 12, margin: "0 0 16px", fontWeight: 500 }}>Incorrect passcode — please try again.</p>}
        <button onClick={submit} style={{ width: "100%", padding: "13px", background: B.purple, color: B.white, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = B.purpleDark}
          onMouseLeave={e => e.currentTarget.style.background = B.purple}
        >Unlock Editing</button>
        <button onClick={onClose} style={{ width: "100%", marginTop: 10, padding: "10px", background: "transparent", color: B.inkLight, border: "none", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
const SUN = UNI.sunderland;
const YSJ = UNI.ysj;

export default function App() {
  // Sunderland state
  const [sunActuals,  setSunActuals]  = useState(() => blankActuals(SUN.courses, "lon", "sun"));
  const [sunTargets,  setSunTargets]  = useState(() => buildDefaultTargets(SUN.courses, "lon", "sun"));
  const [sunOther,    setSunOther]    = useState(() => blankOther(SUN.otherCourses));
  // YSJ state
  const [ysjActuals,  setYsjActuals]  = useState(() => blankActuals(YSJ.courses, "lon", "york"));
  const [ysjTargets,  setYsjTargets]  = useState(() => buildDefaultTargets(YSJ.courses, "lon", "york"));
  // UI state
  const [uni,         setUni]         = useState("sunderland"); // active university tab
  const [subTab,      setSubTab]      = useState("core");
  const [editable,    setEditable]    = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [updatedAt,   setUpdatedAt]   = useState(null);
  const [logoData,    setLogoData]    = useState(null); // base64 logo

  // Refs for debounced save
  const refs = useRef({});
  refs.current = { sunActuals, sunTargets, sunOther, ysjActuals, ysjTargets, logoData };
  const saveTimer   = useRef(null);
  const editableRef = useRef(editable);
  useEffect(() => { editableRef.current = editable; }, [editable]);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("tracker_data").select("*").eq("id", 1).single();
      if (data) {
        if (data.actuals)       setSunActuals(data.actuals);
        if (data.targets && Object.keys(data.targets).length) setSunTargets(data.targets);
        if (data.other_actuals) setSunOther(data.other_actuals);
        if (data.ysj_actuals && Object.keys(data.ysj_actuals).length) setYsjActuals(data.ysj_actuals);
        if (data.ysj_targets && Object.keys(data.ysj_targets).length) setYsjTargets(data.ysj_targets);
        if (data.logo_data)     setLogoData(data.logo_data);
        if (data.updated_at)    setUpdatedAt(new Date(data.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
      }
      setLoading(false);
    };
    load();
    const channel = supabase.channel("tracker_realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tracker_data" }, ({ new: row }) => {
        if (!editableRef.current) {
          if (row.actuals)       setSunActuals(row.actuals);
          if (row.targets && Object.keys(row.targets).length) setSunTargets(row.targets);
          if (row.other_actuals) setSunOther(row.other_actuals);
          if (row.ysj_actuals && Object.keys(row.ysj_actuals).length) setYsjActuals(row.ysj_actuals);
          if (row.ysj_targets && Object.keys(row.ysj_targets).length) setYsjTargets(row.ysj_targets);
          if (row.logo_data)     setLogoData(row.logo_data);
          if (row.updated_at)    setUpdatedAt(new Date(row.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const now = new Date().toISOString();
      const r = refs.current;
      await supabase.from("tracker_data").update({
        actuals: r.sunActuals, targets: r.sunTargets, other_actuals: r.sunOther,
        ysj_actuals: r.ysjActuals, ysj_targets: r.ysjTargets,
        logo_data: r.logoData, updated_at: now,
      }).eq("id", 1);
      setSaving(false);
      setUpdatedAt(new Date(now).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
    }, 800);
  }, []);

  const mkSetter = (setter) => useCallback((u) => {
    setter(p => { const next = typeof u === "function" ? u(p) : u; if (editableRef.current) scheduleSave(); return next; });
  }, [scheduleSave]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSunActuals  = useCallback(u => { setSunActuals(p  => { const x = typeof u === "function" ? u(p)  : u; if (editableRef.current) scheduleSave(); return x; }); }, [scheduleSave]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSunTargets  = useCallback(u => { setSunTargets(p  => { const x = typeof u === "function" ? u(p)  : u; if (editableRef.current) scheduleSave(); return x; }); }, [scheduleSave]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSunOther    = useCallback(u => { setSunOther(p    => { const x = typeof u === "function" ? u(p)  : u; if (editableRef.current) scheduleSave(); return x; }); }, [scheduleSave]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleYsjActuals  = useCallback(u => { setYsjActuals(p  => { const x = typeof u === "function" ? u(p)  : u; if (editableRef.current) scheduleSave(); return x; }); }, [scheduleSave]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleYsjTargets  = useCallback(u => { setYsjTargets(p  => { const x = typeof u === "function" ? u(p)  : u; if (editableRef.current) scheduleSave(); return x; }); }, [scheduleSave]);

  // ── Logo upload ─────────────────────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result;
      setLogoData(b64);
      if (editableRef.current) scheduleSave();
    };
    reader.readAsDataURL(file);
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const sunLon = SUN.courses.reduce((s, c) => s + n(sunActuals[c.name]?.lon), 0);
  const sunSun = SUN.courses.reduce((s, c) => s + n(sunActuals[c.name]?.sun), 0);
  const sunTot = sunLon + sunSun;
  const sunTgt = SUN.courses.reduce((s, c) => s + n(sunTargets[c.name]?.lon) + n(sunTargets[c.name]?.sun), 0);
  const ysjLon = YSJ.courses.reduce((s, c) => s + n(ysjActuals[c.name]?.lon), 0);
  const ysjYork= YSJ.courses.reduce((s, c) => s + n(ysjActuals[c.name]?.york), 0);
  const ysjTot = ysjLon + ysjYork;
  const ysjTgt = YSJ.courses.reduce((s, c) => s + n(ysjTargets[c.name]?.lon) + n(ysjTargets[c.name]?.york), 0);
  const grandTot = sunTot + ysjTot;
  const grandTgt = sunTgt + ysjTgt;

  const uniBtn = (id, label, color) => (
    <button onClick={() => { setUni(id); setSubTab("core"); }} style={{ padding: "12px 28px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif", borderRadius: "10px 10px 0 0", background: uni === id ? B.white : "transparent", color: uni === id ? color : B.inkMid, borderBottom: uni === id ? `3px solid ${color}` : "3px solid transparent", transition: "all .15s" }}>
      {label}
    </button>
  );

  const subTabBtn = (id, label) => (
    <button onClick={() => setSubTab(id)} style={{ padding: "8px 18px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 6, background: subTab === id ? B.purpleLight : "transparent", color: subTab === id ? B.purple : B.inkMid, transition: "all .15s" }}>
      {label}
    </button>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: B.silverLight, flexDirection: "column", gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: B.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📊</div>
      <div style={{ fontSize: 16, color: B.inkMid, fontWeight: 600 }}>Loading tracker…</div>
    </div>
  );

  return (
    <>
      {showModal && <PasscodeModal onSuccess={() => { setEditable(true); setShowModal(false); }} onClose={() => setShowModal(false)} />}

      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: B.silverLight, minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <div style={{ background: B.purple, padding: "0 36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "20px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Logo area */}
              <div style={{ position: "relative" }}>
                {logoData
                  ? <img src={logoData} alt="Study Now" style={{ height: 44, width: 44, borderRadius: 10, objectFit: "contain", background: "rgba(255,255,255,.15)" }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontWeight: 900, fontSize: 14, color: B.silver, fontFamily: "'DM Sans', sans-serif" }}>SN</span>
                    </div>
                }
                {editable && (
                  <label title="Upload logo" style={{ position: "absolute", inset: 0, cursor: "pointer", borderRadius: 12, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <span style={{ fontSize: 18 }}>📷</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 3 }}>Study Now · Partner Universities</div>
                <div style={{ fontSize: 23, fontWeight: 800, color: B.white, letterSpacing: "-.02em" }}>Deposit Tracker</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {saving
                ? <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", fontStyle: "italic" }}>💾 Saving…</span>
                : updatedAt && <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", fontStyle: "italic" }}>Updated {updatedAt}</span>
              }
              {editable
                ? <button onClick={() => setEditable(false)} style={{ background: B.green, border: "none", color: B.white, padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>🔓 Editing — Lock</button>
                : <button onClick={() => setShowModal(true)} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: B.white, padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.15)"}
                  >🔒 Edit</button>
              }
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={{ background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: "6px 6px 0 0", letterSpacing: ".04em" }}>
              Sep 2026 & Jan 2027 Intake
            </span>
          </div>
        </div>

        {/* ── VIEW-ONLY BANNER ── */}
        {!editable && (
          <div style={{ background: B.purpleLight, borderBottom: `1px solid ${B.purpleMid}`, padding: "8px 36px", fontSize: 12, color: B.inkMid, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            👁️ View-only mode — click <strong style={{ color: B.purple, marginLeft: 3 }}>🔒 Edit</strong> and enter the passcode to update figures, targets, or upload a logo.
          </div>
        )}

        <div style={{ padding: "28px 36px" }}>

          {/* ── COMBINED OVERVIEW KPIs ── */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: B.inkLight, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Overall · Study Now</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <KpiCard label="Total Deposits" value={grandTot} max={grandTgt} color={B.purple} size="large" />
              <KpiCard label="Univ. of Sunderland" value={sunTot} max={sunTgt} color={SUN.color} />
              <KpiCard label="York St John"   value={ysjTot} max={ysjTgt} color={YSJ.color} />
              <KpiCard label="Other (Sunderland)" value={SUN.otherCourses.reduce((s, c) => s + n(sunOther[c]?.lon) + n(sunOther[c]?.sun), 0)} sub="no target set" color={B.inkLight} />
            </div>
          </div>

          <div style={{ height: 1, background: B.border, margin: "24px 0" }} />

          {/* ── UNIVERSITY TABS ── */}
          <div style={{ borderBottom: `2px solid ${B.border}`, display: "flex", gap: 2, marginBottom: 0 }}>
            {uniBtn("sunderland", "🎓 University of Sunderland", SUN.color)}
            {uniBtn("ysj",        "🎓 York St John University",  YSJ.color)}
          </div>

          <div style={{ background: B.white, borderRadius: "0 12px 12px 12px", border: `1px solid ${B.border}`, borderTop: "none", boxShadow: "0 2px 12px rgba(123,47,255,.06)" }}>

            {/* Sub-tab bar */}
            <div style={{ padding: "12px 16px 0", borderBottom: `1px solid ${B.border}`, display: "flex", gap: 6, background: B.silverLight, borderRadius: "0 12px 0 0" }}>
              {subTabBtn("core", "Core Courses")}
              {uni === "sunderland" && subTabBtn("other", "Other Courses")}
            </div>

            {/* Sunderland */}
            {uni === "sunderland" && subTab === "core" && (
              <UniCoreTable uni={SUN} actuals={sunActuals} onSetActuals={handleSunActuals} targets={sunTargets} onSetTargets={handleSunTargets} editable={editable} />
            )}
            {uni === "sunderland" && subTab === "other" && (
              <SunderlandOtherTable otherAct={sunOther} onSetOtherAct={handleSunOther} editable={editable} />
            )}

            {/* York St John */}
            {uni === "ysj" && subTab === "core" && (
              <UniCoreTable uni={YSJ} actuals={ysjActuals} onSetActuals={handleYsjActuals} targets={ysjTargets} onSetTargets={handleYsjTargets} editable={editable} />
            )}
          </div>

          <div style={{ marginTop: 18, fontSize: 11, color: B.inkLight, textAlign: "center", lineHeight: 1.7 }}>
            Groups included: Deposits · Sept 26 Deposits · Defer/Refund/Change Uni &nbsp;·&nbsp; Closed Lost excluded
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `1px solid ${B.border}`, padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: B.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: B.white, fontSize: 9, fontWeight: 900 }}>SN</span>
            </div>
            <span style={{ fontSize: 11, color: B.inkLight, fontWeight: 500 }}>Study Now · Internal Tool</span>
          </div>
          <span style={{ fontSize: 11, color: B.inkLight }}>© {new Date().getFullYear()} Study Now. All rights reserved.</span>
        </div>
      </div>
    </>
  );
}
