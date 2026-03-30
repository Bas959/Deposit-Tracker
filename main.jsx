import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE;

// ── COURSE CONFIG ─────────────────────────────────────────────────────────────
const COURSES = [
  { name: "MSc Nursing Practice – London"      },
  { name: "MSc Public Health"                  },
  { name: "MSc Nursing"                        },
  { name: "MBA Business Administration"        },
  { name: "MSc Cybersecurity"                  },
  { name: "MSc Data Science"                   },
  { name: "MSc Computing"                      },
  { name: "MSc Engineering Management"         },
  { name: "MSc Digital Marketing & Analytics"  },
];

// Default targets (used on first load if Supabase has none)
const DEFAULT_TARGETS = {
  "MSc Nursing Practice – London":     { lon: 20, sun:  0 },
  "MSc Public Health":                 { lon: 20, sun: 40 },
  "MSc Nursing":                       { lon:  0, sun: 40 },
  "MBA Business Administration":       { lon: 15, sun: 25 },
  "MSc Cybersecurity":                 { lon:  0, sun: 20 },
  "MSc Data Science":                  { lon:  0, sun: 50 },
  "MSc Computing":                     { lon:  0, sun: 40 },
  "MSc Engineering Management":        { lon:  0, sun: 15 },
  "MSc Digital Marketing & Analytics": { lon:  0, sun: 20 },
};

const OTHER_COURSES = [
  "OSPAP",
  "MA Education",
  "MA Marketing",
  "BSc (Hons) Nursing",
  "BSc (Hons) Nursing Practice (Top Up)",
  "BSc (Hons) Health and Social Care",
  "BEng Electronic & Electrical Engineering",
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const blank = (keys) => Object.fromEntries(keys.map((k) => [k, { lon: "", sun: "" }]));
const n = (v) => parseInt(v) || 0;
const pct = (a, t) => (t > 0 ? Math.min(100, Math.round((a / t) * 100)) : null);

function statusColor(p) {
  if (p === null) return { bg: "#f1f5f9", text: "#94a3b8", label: "—" };
  if (p >= 100)   return { bg: "#dcfce7", text: "#15803d", label: "Target Met ✓" };
  if (p >= 70)    return { bg: "#fef9c3", text: "#a16207", label: "On Track" };
  return                  { bg: "#fee2e2", text: "#b91c1c", label: "Behind" };
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color, height = 7 }) {
  const w = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 99, height, width: "100%", overflow: "hidden" }}>
      <div style={{
        width: `${w}%`, height: "100%", background: color,
        borderRadius: 99, transition: "width .4s cubic-bezier(.4,0,.2,1)"
      }} />
    </div>
  );
}

function Pill({ p }) {
  const s = statusColor(p);
  if (p === null) return <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>;
  return (
    <span style={{
      background: s.bg, color: s.text, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 99, letterSpacing: ".03em", whiteSpace: "nowrap"
    }}>
      {s.label}
    </span>
  );
}

function NumInput({ value, onChange, accent, readOnly }) {
  const [focus, setFocus] = useState(false);
  if (readOnly) {
    return (
      <span style={{
        fontFamily: "'DM Mono', monospace", fontWeight: n(value) ? 700 : 400,
        color: n(value) ? accent : "#cbd5e1", fontSize: 15,
      }}>
        {n(value) || "—"}
      </span>
    );
  }
  return (
    <input
      type="number" min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      placeholder="0"
      style={{
        width: 58, padding: "6px 6px", textAlign: "center", fontSize: 14,
        fontWeight: value ? 700 : 400,
        color: value ? accent : "#94a3b8",
        background: focus ? "#fff" : `${accent}0d`,
        border: `1.5px solid ${focus ? accent : `${accent}33`}`,
        borderRadius: 7, outline: "none", transition: "all .15s",
        fontFamily: "'DM Mono', monospace",
      }}
    />
  );
}

function KpiCard({ label, value, sub, color, max, icon }) {
  const p = max ? pct(value, max) : null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
      padding: "20px 24px", flex: 1, minWidth: 148,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)", transition: "box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
        {icon && <span style={{ fontSize: 18, opacity: .55 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</div>
      {max && (
        <>
          <div style={{ marginTop: 12 }}><ProgressBar value={value} max={max} color={color} /></div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            <span style={{ color, fontWeight: 700 }}>{p}%</span> of {max} target
          </div>
        </>
      )}
      {sub && !max && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── TABLE STYLES ──────────────────────────────────────────────────────────────
const TH = {
  padding: "11px 14px", textAlign: "left", fontWeight: 700, fontSize: 11,
  letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b",
  borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", background: "#f8fafc",
};
const TC  = { textAlign: "center" };
const TD  = { padding: "11px 14px", verticalAlign: "middle", fontSize: 13, borderBottom: "1px solid #f1f5f9" };

// ── CORE TABLE ────────────────────────────────────────────────────────────────
function CoreTable({ actuals, onSetActuals, targets, onSetTargets, editable }) {
  const lonActTot  = COURSES.reduce((s, c) => s + n(actuals[c.name]?.lon), 0);
  const sunActTot  = COURSES.reduce((s, c) => s + n(actuals[c.name]?.sun), 0);
  const grandAct   = lonActTot + sunActTot;
  const lonTgtTot  = COURSES.reduce((s, c) => s + n(targets[c.name]?.lon), 0);
  const sunTgtTot  = COURSES.reduce((s, c) => s + n(targets[c.name]?.sun), 0);
  const grandTgt   = lonTgtTot + sunTgtTot;

  const setActual = (key, side, val) => onSetActuals(p => ({ ...p, [key]: { ...p[key], [side]: val } }));
  const setTarget = (key, side, val) => onSetTargets(p => ({ ...p, [key]: { ...p[key], [side]: val } }));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: "#faf5ff", borderLeft: "2px solid #ede9fe" }}>London<br/>Target</th>
            <th style={{ ...TH, ...TC, background: "#faf5ff" }}>London<br/>Actual</th>
            <th style={{ ...TH, ...TC, background: "#f0fdff", borderLeft: "2px solid #e0f2fe" }}>Sunderland<br/>Target</th>
            <th style={{ ...TH, ...TC, background: "#f0fdff" }}>Sunderland<br/>Actual</th>
            <th style={{ ...TH, ...TC, borderLeft: "2px solid #e2e8f0" }}>Total<br/>Target</th>
            <th style={{ ...TH, ...TC }}>Total<br/>Actual</th>
            <th style={{ ...TH, minWidth: 140 }}>Progress</th>
            <th style={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {COURSES.map((c, i) => {
            const lt  = n(targets[c.name]?.lon);
            const st  = n(targets[c.name]?.sun);
            const la  = n(actuals[c.name]?.lon);
            const sa  = n(actuals[c.name]?.sun);
            const tot = la + sa;
            const tgt = lt + st;
            const p   = pct(tot, tgt);
            const bar = p === null ? "#94a3b8" : p >= 100 ? "#22c55e" : p >= 70 ? "#f59e0b" : "#ef4444";
            return (
              <tr key={c.name} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                <td style={{ ...TD, fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                <td style={{ ...TD, ...TC, background: "#fdf8ff", borderLeft: "2px solid #ede9fe" }}>
                  <NumInput value={targets[c.name]?.lon ?? ""} accent="#7c3aed" onChange={v => setTarget(c.name, "lon", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: "#fdf8ff" }}>
                  {lt > 0
                    ? <NumInput value={actuals[c.name]?.lon || ""} accent="#7c3aed" onChange={v => setActual(c.name, "lon", v)} readOnly={!editable} />
                    : <span style={{ color: "#ddd", fontSize: 12 }}>N/A</span>}
                </td>
                <td style={{ ...TD, ...TC, background: "#f0fdff", borderLeft: "2px solid #e0f2fe" }}>
                  <NumInput value={targets[c.name]?.sun ?? ""} accent="#0891b2" onChange={v => setTarget(c.name, "sun", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: "#f0fdff" }}>
                  {st > 0
                    ? <NumInput value={actuals[c.name]?.sun || ""} accent="#0891b2" onChange={v => setActual(c.name, "sun", v)} readOnly={!editable} />
                    : <span style={{ color: "#ddd", fontSize: 12 }}>N/A</span>}
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 700, borderLeft: "2px solid #e2e8f0", color: "#475569" }}>{tgt || "—"}</td>
                <td style={{ ...TD, ...TC, fontWeight: 800, fontSize: 16, color: tot > 0 ? "#1e3a5f" : "#cbd5e1", fontFamily: "'DM Mono', monospace" }}>
                  {tot || "—"}
                </td>
                <td style={{ ...TD, minWidth: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={tot} max={tgt} color={bar} /></div>
                    <span style={{ fontSize: 11, color: "#64748b", width: 34, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>
                      {p ?? 0}%
                    </span>
                  </div>
                </td>
                <td style={TD}><Pill p={p} /></td>
              </tr>
            );
          })}
          <tr style={{ background: "#1e3a5f" }}>
            <td style={{ ...TD, color: "#fff", fontWeight: 800, fontSize: 14 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#c4b5fd", fontWeight: 700, background: "rgba(124,58,237,.25)", borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>{lonTgtTot}</td>
            <td style={{ ...TD, ...TC, color: "#c4b5fd", fontWeight: 800, fontSize: 17, background: "rgba(124,58,237,.25)", fontFamily: "'DM Mono', monospace" }}>{lonActTot}</td>
            <td style={{ ...TD, ...TC, color: "#67e8f9", fontWeight: 700, background: "rgba(8,145,178,.25)", borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>{sunTgtTot}</td>
            <td style={{ ...TD, ...TC, color: "#67e8f9", fontWeight: 800, fontSize: 17, background: "rgba(8,145,178,.25)", fontFamily: "'DM Mono', monospace" }}>{sunActTot}</td>
            <td style={{ ...TD, ...TC, color: "#fff", fontWeight: 700, borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>{grandTgt}</td>
            <td style={{ ...TD, ...TC, color: "#fff", fontWeight: 800, fontSize: 19, fontFamily: "'DM Mono', monospace" }}>{grandAct}</td>
            <td style={{ ...TD }} colSpan={2}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}><ProgressBar value={grandAct} max={grandTgt} color="#60a5fa" height={8} /></div>
                <span style={{ color: "#93c5fd", fontSize: 13, fontFamily: "'DM Mono', monospace", width: 38, textAlign: "right" }}>
                  {pct(grandAct, grandTgt) ?? 0}%
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── OTHER COURSES TABLE ───────────────────────────────────────────────────────
function OtherTable({ otherAct, onSetOtherAct, editable }) {
  const set     = (key, side, val) => onSetOtherAct(p => ({ ...p, [key]: { ...p[key], [side]: val } }));
  const lonTot  = OTHER_COURSES.reduce((s, c) => s + n(otherAct[c]?.lon), 0);
  const sunTot  = OTHER_COURSES.reduce((s, c) => s + n(otherAct[c]?.sun), 0);
  const grandTot = lonTot + sunTot;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: "#faf5ff", borderLeft: "2px solid #ede9fe" }}>London</th>
            <th style={{ ...TH, ...TC, background: "#f0fdff", borderLeft: "2px solid #e0f2fe" }}>Sunderland</th>
            <th style={{ ...TH, ...TC, borderLeft: "2px solid #e2e8f0" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {OTHER_COURSES.map((c, i) => {
            const l = n(otherAct[c]?.lon), s = n(otherAct[c]?.sun);
            return (
              <tr key={c} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                <td style={{ ...TD, fontWeight: 600, color: "#1e293b" }}>{c}</td>
                <td style={{ ...TD, ...TC, background: "#fdf8ff", borderLeft: "2px solid #ede9fe" }}>
                  <NumInput value={otherAct[c]?.lon || ""} accent="#7c3aed" onChange={v => set(c, "lon", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, background: "#f0fdff", borderLeft: "2px solid #e0f2fe" }}>
                  <NumInput value={otherAct[c]?.sun || ""} accent="#0891b2" onChange={v => set(c, "sun", v)} readOnly={!editable} />
                </td>
                <td style={{ ...TD, ...TC, fontWeight: 800, fontSize: 16, color: l + s > 0 ? "#1e3a5f" : "#cbd5e1", borderLeft: "2px solid #e2e8f0", fontFamily: "'DM Mono', monospace" }}>
                  {l + s || "—"}
                </td>
              </tr>
            );
          })}
          <tr style={{ background: "#1e3a5f" }}>
            <td style={{ ...TD, color: "#fff", fontWeight: 800, fontSize: 14 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "#c4b5fd", fontWeight: 800, fontSize: 17, background: "rgba(124,58,237,.25)", borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>
              {lonTot}
            </td>
            <td style={{ ...TD, ...TC, color: "#67e8f9", fontWeight: 800, fontSize: 17, background: "rgba(8,145,178,.25)", borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>
              {sunTot}
            </td>
            <td style={{ ...TD, ...TC, color: "#fff", fontWeight: 800, fontSize: 19, borderLeft: "2px solid rgba(255,255,255,.1)", fontFamily: "'DM Mono', monospace" }}>
              {grandTot}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── PASSCODE MODAL ────────────────────────────────────────────────────────────
function PasscodeModal({ onSuccess, onClose }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (value === PASSCODE) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setValue("");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "40px 44px", width: 390,
          boxShadow: "0 32px 80px rgba(0,0,0,.22)",
          transform: shake ? "translateX(-6px)" : "none",
          transition: "transform .07s ease",
        }}
      >
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 14 }}>🔒</div>
        <h2 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 21, fontWeight: 800, color: "#1e293b" }}>
          Editor Access
        </h2>
        <p style={{ margin: "0 0 28px", textAlign: "center", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
          Enter the passcode to unlock editing.
        </p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Passcode"
          style={{
            width: "100%", padding: "13px 16px", fontSize: 16,
            border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`,
            borderRadius: 10, outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: error ? 8 : 16,
            transition: "border-color .15s",
          }}
        />
        {error && (
          <p style={{ color: "#ef4444", fontSize: 12, margin: "0 0 16px", fontWeight: 500 }}>
            Incorrect passcode — please try again.
          </p>
        )}
        <button
          onClick={submit}
          style={{
            width: "100%", padding: "13px", background: "#1e3a5f", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "background .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#1e40af"}
          onMouseLeave={e => e.currentTarget.style.background = "#1e3a5f"}
        >
          Unlock Editing
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 10, padding: "10px", background: "transparent",
            color: "#94a3b8", border: "none", borderRadius: 10, fontSize: 13,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [actuals,   setActuals]   = useState(() => blank(COURSES.map(c => c.name)));
  const [otherAct,  setOtherAct]  = useState(() => blank(OTHER_COURSES));
  const [targets,   setTargets]   = useState(() => ({ ...DEFAULT_TARGETS }));
  const [tab,       setTab]       = useState("core");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [editable,  setEditable]  = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  const actualsRef  = useRef(actuals);
  const otherActRef = useRef(otherAct);
  const targetsRef  = useRef(targets);
  const saveTimer   = useRef(null);
  const editableRef = useRef(editable);

  useEffect(() => { actualsRef.current  = actuals;  }, [actuals]);
  useEffect(() => { otherActRef.current = otherAct; }, [otherAct]);
  useEffect(() => { targetsRef.current  = targets;  }, [targets]);
  useEffect(() => { editableRef.current = editable; }, [editable]);

  // ── Load & subscribe ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("tracker_data")
        .select("*")
        .eq("id", 1)
        .single();

      if (data) {
        if (data.actuals)       setActuals(data.actuals);
        if (data.other_actuals) setOtherAct(data.other_actuals);
        if (data.targets && Object.keys(data.targets).length > 0) setTargets(data.targets);
        if (data.updated_at) {
          setUpdatedAt(new Date(data.updated_at).toLocaleString("en-GB", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
          }));
        }
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("tracker_realtime")
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "tracker_data"
      }, ({ new: row }) => {
        if (!editableRef.current) {
          if (row.actuals)       setActuals(row.actuals);
          if (row.other_actuals) setOtherAct(row.other_actuals);
          if (row.targets && Object.keys(row.targets).length > 0) setTargets(row.targets);
          if (row.updated_at) {
            setUpdatedAt(new Date(row.updated_at).toLocaleString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            }));
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── Debounced save ────────────────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const now = new Date().toISOString();
      await supabase
        .from("tracker_data")
        .update({
          actuals:       actualsRef.current,
          other_actuals: otherActRef.current,
          targets:       targetsRef.current,
          updated_at:    now,
        })
        .eq("id", 1);
      setSaving(false);
      setUpdatedAt(new Date(now).toLocaleString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      }));
    }, 800);
  }, []);

  const handleSetActuals = useCallback((updater) => {
    setActuals(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      actualsRef.current = next;
      if (editableRef.current) scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  const handleSetOtherAct = useCallback((updater) => {
    setOtherAct(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      otherActRef.current = next;
      if (editableRef.current) scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  const handleSetTargets = useCallback((updater) => {
    setTargets(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      targetsRef.current = next;
      if (editableRef.current) scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Derived totals ────────────────────────────────────────────────────────
  const lonTot    = COURSES.reduce((s, c) => s + n(actuals[c.name]?.lon), 0);
  const sunTot    = COURSES.reduce((s, c) => s + n(actuals[c.name]?.sun), 0);
  const grandTot  = lonTot + sunTot;
  const lonTgt    = COURSES.reduce((s, c) => s + n(targets[c.name]?.lon), 0);
  const sunTgt    = COURSES.reduce((s, c) => s + n(targets[c.name]?.sun), 0);
  const grandTgt  = lonTgt + sunTgt;
  const otherTot  = OTHER_COURSES.reduce((s, c) => s + n(otherAct[c]?.lon) + n(otherAct[c]?.sun), 0);

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "10px 22px", border: "none", cursor: "pointer",
        fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        borderRadius: "10px 10px 0 0",
        background: tab === id ? "#fff" : "transparent",
        color: tab === id ? "#1e3a5f" : "#64748b",
        borderBottom: tab === id ? "2px solid #1e3a5f" : "2px solid transparent",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#f8fafc", flexDirection: "column", gap: 16
      }}>
        <div style={{ fontSize: 44 }}>📊</div>
        <div style={{ fontSize: 16, color: "#64748b", fontWeight: 600 }}>Loading tracker…</div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <PasscodeModal
          onSuccess={() => { setEditable(true); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
          padding: "30px 36px 26px", color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 6 }}>
                University of Sunderland · Aug – Nov 2026 Intake
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.025em" }}>
                Deposit Tracker
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {saving
                ? <span style={{ fontSize: 11, color: "#93c5fd", fontStyle: "italic" }}>💾 Saving…</span>
                : updatedAt && <span style={{ fontSize: 11, color: "#93c5fd", fontStyle: "italic" }}>Updated {updatedAt}</span>
              }
              {editable ? (
                <button
                  onClick={() => setEditable(false)}
                  style={{
                    background: "#22c55e", border: "none", color: "#fff",
                    padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                    fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  🔓 Editing — Lock
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)",
                    color: "#fff", padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                    fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.24)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.14)"}
                >
                  🔒 Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── VIEW-ONLY BANNER ── */}
        {!editable && (
          <div style={{
            background: "#fef9c3", borderBottom: "1px solid #fde68a",
            padding: "8px 36px", fontSize: 12, color: "#92400e",
            fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>👁️</span>
            View-only mode — click <strong style={{ marginLeft: 3 }}>🔒 Edit</strong> and enter the passcode to update figures or targets.
          </div>
        )}

        <div style={{ padding: "28px 36px" }}>

          {/* ── KPIs ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
            <KpiCard label="Total Deposits" value={grandTot} max={grandTgt}  color="#2563eb" icon="🎓" />
            <KpiCard label="London"         value={lonTot}   max={lonTgt}    color="#7c3aed" icon="🏛️" />
            <KpiCard label="Sunderland"     value={sunTot}   max={sunTgt}    color="#0891b2" icon="🎯" />
            <KpiCard label="Other Courses"  value={otherTot} sub="no target set" color="#64748b" icon="📋" />
          </div>

          {/* ── TABS ── */}
          <div style={{ borderBottom: "2px solid #e2e8f0", display: "flex", gap: 2 }}>
            {tabBtn("core",  "Core Courses")}
            {tabBtn("other", "Other Courses")}
          </div>

          <div style={{
            background: "#fff", borderRadius: "0 12px 12px 12px",
            border: "1px solid #e2e8f0", borderTop: "none",
            overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          }}>
            {tab === "core" && (
              <CoreTable
                actuals={actuals}    onSetActuals={handleSetActuals}
                targets={targets}    onSetTargets={handleSetTargets}
                editable={editable}
              />
            )}
            {tab === "other" && (
              <OtherTable otherAct={otherAct} onSetOtherAct={handleSetOtherAct} editable={editable} />
            )}
          </div>

          <div style={{ marginTop: 18, fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.7 }}>
            Groups included: Deposits · Sept 26 Deposits · Defer/Refund/Change Uni
            &nbsp;·&nbsp; Closed Lost excluded
          </div>
        </div>
      </div>
    </>
  );
}
