import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList, PieChart, Pie, Legend,
} from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE;

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  purple: "#6C27E8", purpleL: "#F0EAFF", purpleM: "#D8C8FF",
  teal:   "#0B7EA3", tealL:   "#E6F7FF",
  amber:  "#C96A00", amberL:  "#FFF4E0",
  rose:   "#BE123C", roseL:   "#FFF1F2",
  ink:    "#16112B", inkM:    "#4A4467", inkL: "#9490A8",
  border: "#EAE7F2", bg: "#F6F4FB", white: "#FFFFFF",
  green:  "#16A34A", red: "#DC2626", yellow: "#CA8A04",
};

// Preset campus colours available when adding universities
const CAMPUS_PRESETS = [
  { key: "london",     label: "London",      color: "#6C27E8" },
  { key: "sunderland", label: "Sunderland",  color: "#0B7EA3" },
  { key: "york",       label: "York",        color: "#C96A00" },
  { key: "hatfield",   label: "Hatfield",    color: "#BE123C" },
  { key: "campus1",    label: "Campus 1",    color: "#0D7C4A" },
  { key: "campus2",    label: "Campus 2",    color: "#7C3AED" },
];

// ── DEFAULT CONFIG (seeds Supabase on first load) ─────────────────────────────
const DEFAULT_CONFIG = [
  {
    id: "sunderland", name: "University of Sunderland", shortName: "University of Sunderland",
    color: T.teal, intakeLabel: "Aug – Nov 2026", hasTargets: true,
    campus1: { key: "lon", label: "London", color: T.purple },
    campus2: { key: "sun", label: "Sunderland", color: T.teal },
    coreCourses: [
      { name: "MSc Nursing Practice – London",      targets: { lon: 20, sun:  0 } },
      { name: "MSc Public Health",                  targets: { lon: 20, sun: 40 } },
      { name: "MSc Nursing",                        targets: { lon:  0, sun: 40 } },
      { name: "MBA Business Administration",        targets: { lon: 15, sun: 25 } },
      { name: "MSc Cybersecurity",                  targets: { lon:  0, sun: 20 } },
      { name: "MSc Data Science",                   targets: { lon:  0, sun: 50 } },
      { name: "MSc Computing",                      targets: { lon:  0, sun: 40 } },
      { name: "MSc Engineering Management",         targets: { lon:  0, sun: 15 } },
      { name: "MSc Digital Marketing & Analytics",  targets: { lon:  0, sun: 20 } },
    ],
    otherCourses: [
      "OSPAP", "MA Education", "MA Marketing", "BSc (Hons) Nursing",
      "BSc (Hons) Nursing (Top Up)", "BSc (Hons) Nursing Practice (Top Up)",
      "BSc (Hons) Health and Social Care", "BSc (Hons) Health and Social Care (Top Up)",
      "BEng Electronic & Electrical Engineering",
      "BA (Hons) Accounting and Financial Management",
      "BEng (Hons) Sustainable Design Engineering",
      "BSc (Hons) Computer Systems Engineering (Top-Up) Full-time",
      "LLM in International Human Rights", "MSc Finance and Management",
      "MSc Human Resource Management", "MSc International Business Management",
      "MSc International Business Management 15 Months", "MSc Project Management",
      "MSc Tourism and Hospitality", "MSc Fintech and Trading", "MSc Philosophy",
      "BA Business and Management (Top-Up)", "BEng (Hons) Mechanical Engineering",
      "BSc (Hons) Network Systems Engineering (Top-Up)",
      "MBA with Professional Experience",
      "International Project Management with Professional Experience",
      "BA (Hons) Business Management with Foundation Year",
      "Master of Business Administration (Professional Practice) - 12 Months Placement",
    ],
  },
  {
    id: "ysj", name: "York St John University", shortName: "York St John",
    color: T.amber, intakeLabel: "Sep 2026", hasTargets: true,
    campus1: { key: "lon", label: "London", color: T.purple },
    campus2: { key: "york", label: "York", color: T.amber },
    coreCourses: [
      { name: "MBA (London)",                                                    targets: { lon: 10, york:  0 } },
      { name: "MSc Global Healthcare Management",                                targets: { lon:  5, york:  0 } },
      { name: "MSc International Project Management",                            targets: { lon:  5, york:  0 } },
      { name: "MSc Digital Marketing",                                           targets: { lon:  5, york:  0 } },
      { name: "MSc Public Health (YSJ)",                                         targets: { lon:  6, york:  0 } },
      { name: "MSc Data Science (YSJ)",                                          targets: { lon:  6, york:  0 } },
      { name: "MSc Computer Science (London)",                                   targets: { lon:  6, york:  0 } },
      { name: "MSc Computing (Top-up)",                                          targets: { lon:  2, york:  0 } },
      { name: "MSc Business Computing (Top-up)",                                 targets: { lon:  2, york:  0 } },
      { name: "BA Global Business Management (Top-up)",                          targets: { lon:  2, york:  0 } },
      { name: "MSc Tourism & Hospitality",                                       targets: { lon:  3, york:  0 } },
      { name: "MRes Management Studies",                                         targets: { lon:  6, york:  0 } },
      { name: "BA (Hons) Accounting and Finance",                                targets: { lon:  0, york:  1 } },
      { name: "BA (Hons) Business Management",                                   targets: { lon:  0, york:  1 } },
      { name: "BA (Hons) International Business",                                targets: { lon:  0, york:  1 } },
      { name: "BA (Hons) Intl Tourism & Hospitality Mgmt with Foundation Year",  targets: { lon:  0, york:  1 } },
      { name: "Masters Business Administration (York)",                          targets: { lon:  0, york: 10 } },
      { name: "MBA Healthcare Management",                                       targets: { lon:  0, york: 10 } },
      { name: "MSc Human Resource Management",                                   targets: { lon:  0, york:  5 } },
      { name: "MSc Project Management",                                          targets: { lon:  0, york:  5 } },
      { name: "MSc International Business",                                      targets: { lon:  0, york:  5 } },
      { name: "MRes in Business",                                                targets: { lon:  0, york:  6 } },
      { name: "MSc Marketing",                                                   targets: { lon:  0, york:  2 } },
      { name: "MSc Strategic Digital Marketing",                                 targets: { lon:  0, york:  2 } },
      { name: "MSc Product Design",                                              targets: { lon:  0, york:  1 } },
      { name: "BSc (Hons) Psychology",                                           targets: { lon:  0, york:  1 } },
      { name: "MA TESOL",                                                        targets: { lon:  0, york:  1 } },
      { name: "MSc Psychology of Child & Adolescent Development",                targets: { lon:  0, york:  1 } },
      { name: "MA Education (YSJ)",                                              targets: { lon:  0, york:  2 } },
      { name: "MRes in Psychology",                                              targets: { lon:  0, york:  1 } },
      { name: "MRes in Education",                                               targets: { lon:  0, york:  1 } },
      { name: "MRes in Linguistics",                                             targets: { lon:  0, york:  1 } },
      { name: "BSc (Hons) Computer Science (York)",                              targets: { lon:  0, york:  1 } },
      { name: "BSc (Hons) Software Engineering",                                 targets: { lon:  0, york:  1 } },
      { name: "BSc Cyber Security",                                              targets: { lon:  0, york:  1 } },
      { name: "BSc (Hons) Biomedical Science",                                   targets: { lon:  0, york:  1 } },
      { name: "MRes Social Science",                                             targets: { lon:  0, york:  1 } },
      { name: "MRes Science and Health",                                         targets: { lon:  0, york:  1 } },
      { name: "MA International Politics and Security",                          targets: { lon:  0, york:  1 } },
      { name: "MRes Humanities",                                                 targets: { lon:  0, york:  1 } },
      { name: "MSc Environmental Sustainability & Management",                   targets: { lon:  0, york:  1 } },
    ],
    otherCourses: [
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
    ],
  },
  {
    id: "uh", name: "University of Hertfordshire", shortName: "Hertfordshire",
    color: T.rose, intakeLabel: "Hatfield Campus", hasTargets: false,
    campus1: { key: "hatfield", label: "Hatfield", color: T.rose },
    campus2: null,
    coreCourses: [
      { name: "MRes AI in Business" }, { name: "Master of Laws (LLM)" },
      { name: "MA Human Resource Management" },
      { name: "MSc Logistics and Supply Chain Management" },
      { name: "MSc Management with Logistics and Supply Chain Management" },
      { name: "MSc Power Electronics and Control" }, { name: "MA Education" },
      { name: "MSc Cyber Security" }, { name: "MSc Environmental Management for Agriculture" },
      { name: "MSc Management" }, { name: "MA Journalism & Media Communication" },
      { name: "MSc Management with Digital Marketing" }, { name: "Mental Health Nursing" },
      { name: "MRes Education" }, { name: "MSc Criminal Justice" },
      { name: "MRes in Digital Management" }, { name: "MSc Project Management" },
    ],
    otherCourses: [],
  },
  {
    id: "qa_ulster", name: "QA Ulster", shortName: "QA Ulster",
    color: "#0D7C4A", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "ulster_university", name: "Ulster University", shortName: "Ulster University",
    color: "#7C3AED", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "wolverhampton", name: "University of Wolverhampton", shortName: "Wolverhampton",
    color: "#0369A1", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "greenwich", name: "University of Greenwich", shortName: "Greenwich",
    color: "#B45309", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "sheffield_hallam", name: "Sheffield Hallam University", shortName: "Sheffield Hallam",
    color: "#9D174D", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "gloucestershire", name: "University of Gloucestershire", shortName: "Gloucestershire",
    color: "#065F46", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "roehampton", name: "University of Roehampton", shortName: "Roehampton",
    color: "#1E40AF", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "salford", name: "University of Salford", shortName: "Salford",
    color: "#7E22CE", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "bucks_new", name: "Buckinghamshire New University", shortName: "Bucks New",
    color: "#0F766E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "keele", name: "Keele University", shortName: "Keele",
    color: "#92400E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "aberdeen", name: "University of Aberdeen", shortName: "Aberdeen",
    color: "#0D7C4A", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "wrexham", name: "Wrexham University", shortName: "Wrexham",
    color: "#7C3AED", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "bpp", name: "BPP University", shortName: "BPP",
    color: "#0369A1", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "derby", name: "University of Derby", shortName: "Derby",
    color: "#B45309", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "leeds_trinity", name: "Leeds Trinity University", shortName: "Leeds Trinity",
    color: "#9D174D", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "edinburgh_napier", name: "Edinburgh Napier University", shortName: "Edinburgh Napier",
    color: "#065F46", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "glasgow_caledonian", name: "Glasgow Caledonian University", shortName: "Glasgow Caledonian",
    color: "#1E40AF", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "birmingham_city", name: "Birmingham City University", shortName: "Birmingham City",
    color: "#7E22CE", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "coventry", name: "Coventry University", shortName: "Coventry",
    color: "#0F766E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "robert_gordon", name: "Robert Gordon University", shortName: "Robert Gordon",
    color: "#92400E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "northumbria", name: "Northumbria University London", shortName: "Northumbria",
    color: "#0D7C4A", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "arden", name: "Arden University", shortName: "Arden",
    color: "#7C3AED", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "portsmouth", name: "University of Portsmouth", shortName: "Portsmouth",
    color: "#0369A1", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "manchester_met", name: "Manchester Metropolitan University", shortName: "Manchester Met",
    color: "#B45309", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "hull", name: "University of Hull", shortName: "Hull",
    color: "#9D174D", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "liverpool_hope", name: "Liverpool Hope University", shortName: "Liverpool Hope",
    color: "#065F46", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "huddersfield", name: "University of Huddersfield", shortName: "Huddersfield",
    color: "#1E40AF", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "northampton", name: "University of Northampton", shortName: "Northampton",
    color: "#7E22CE", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "london_met", name: "London Metropolitan University", shortName: "London Met",
    color: "#0F766E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "solent", name: "Solent University", shortName: "Solent",
    color: "#92400E", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "teesside", name: "Teesside University", shortName: "Teesside",
    color: "#0D7C4A", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
  {
    id: "east_london", name: "University of East London", shortName: "East London",
    color: "#7C3AED", intakeLabel: "London Campus", hasTargets: false,
    campus1: { key: "lon", label: "London", color: "#6C27E8" }, campus2: null,
    coreCourses: [], otherCourses: [],
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const ni  = (v) => parseInt(v) || 0;
const pct = (a, t) => t > 0 ? Math.min(100, Math.round((a / t) * 100)) : null;
const uid = () => Math.random().toString(36).slice(2, 8);

function getActual(actuals, uniId, section, courseName, campusKey) {
  const val = actuals?.[uniId]?.[section]?.[courseName]?.[campusKey];
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return Object.values(val).reduce((s, n) => s + (typeof n === 'number' ? n : 0), 0);
}

function getActualByCounsellor(actuals, uniId, section, courseName, campusKey, counsellor) {
  const val = actuals?.[uniId]?.[section]?.[courseName]?.[campusKey];
  if (!val || typeof val === 'number') return 0;
  return val[counsellor] || 0;
}

function setActualByCounsellor(prev, uniId, section, courseName, campusKey, counsellor, value) {
  const current = prev?.[uniId]?.[section]?.[courseName]?.[campusKey];
  const currentObj = (!current || typeof current === 'number')
    ? (current > 0 ? { Unattributed: current } : {})
    : { ...current };
  if (value === 0) { delete currentObj[counsellor]; } else { currentObj[counsellor] = value; }
  return {
    ...prev,
    [uniId]: {
      ...prev?.[uniId],
      [section]: {
        ...prev?.[uniId]?.[section],
        [courseName]: {
          ...prev?.[uniId]?.[section]?.[courseName],
          [campusKey]: currentObj,
        },
      },
    },
  };
}

function setActual(prev, uniId, section, courseName, campusKey, value) {
  return {
    ...prev,
    [uniId]: {
      ...prev[uniId],
      [section]: {
        ...prev[uniId]?.[section],
        [courseName]: {
          ...prev[uniId]?.[section]?.[courseName],
          [campusKey]: value,
        },
      },
    },
  };
}

// Migrate old column-based actuals to unified all_actuals format
function migrateActuals(oldData) {
  const result = {};
  // Sunderland
  if (oldData.actuals || oldData.other_actuals) {
    result.sunderland = {
      core:  oldData.actuals       || {},
      other: oldData.other_actuals || {},
    };
  }
  // YSJ
  if (oldData.ysj_actuals || oldData.ysj_other_actuals) {
    result.ysj = {
      core:  oldData.ysj_actuals       || {},
      other: oldData.ysj_other_actuals || {},
    };
  }
  // UH — convert flat { courseName: value } to { courseName: { hatfield: value } }
  if (oldData.uh_actuals && Object.keys(oldData.uh_actuals).length) {
    const converted = {};
    for (const [course, val] of Object.entries(oldData.uh_actuals)) {
      converted[course] = { hatfield: ni(val) };
    }
    result.uh = { core: converted, other: {} };
  }
  return result;
}

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
  if (readOnly) return <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: ni(value) ? 600 : 400, color: ni(value) ? accent : T.border }}>{ni(value) || "—"}</span>;
  return (
    <input type="number" min="0" value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder="0"
      style={{ width: 54, padding: "5px 4px", textAlign: "center", fontSize: 13, fontWeight: value ? 600 : 400, color: value ? accent : T.inkL, background: focus ? T.white : `${accent}12`, border: `1.5px solid ${focus ? accent : `${accent}30`}`, borderRadius: 6, outline: "none", fontFamily: "ui-monospace, monospace" }}
    />
  );
}

function StatCard({ label, value, max, sub, accent, institution }) {
  const p = max ? pct(value, max) : null;
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 22px", flex: 1, minWidth: 150, boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,39,232,.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"}
    >
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: T.inkL, letterSpacing: ".07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: accent, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{value}</p>
      {max && <><div style={{ margin: "12px 0 6px" }}><Bar value={value} max={max} color={accent} h={6} /></div><p style={{ margin: 0, fontSize: 11, color: T.inkL }}><span style={{ color: accent, fontWeight: 700 }}>{p}%</span> of {max} {institution} seat caps</p></>}
      {sub && <p style={{ margin: "8px 0 0", fontSize: 11, color: T.inkL }}>{sub}</p>}
    </div>
  );
}

// ── TABLE STYLES ──────────────────────────────────────────────────────────────
const TH = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: T.inkM, borderBottom: `1.5px solid ${T.border}`, background: "#FAFAFA", whiteSpace: "nowrap" };
const TC = { textAlign: "center" };
const TD = { padding: "10px 14px", verticalAlign: "middle", fontSize: 13, borderBottom: `1px solid ${T.bg}` };

// ── DYNAMIC COURSE TABLE (with targets) ───────────────────────────────────────
function CourseTable({ uni, allActuals, onUpdate, editable, counsellors, getActualByCounsellor, setActualByCounsellor, setAllActuals, scheduleSave }) {
  const [expandedCell, setExpandedCell] = useState(null);
  const c1 = uni.campus1, c2 = uni.campus2;
  const courses = uni.coreCourses;

  const c1A = courses.reduce((s, c) => s + getActual(allActuals, uni.id, "core", c.name, c1.key), 0);
  const c2A = c2 ? courses.reduce((s, c) => s + getActual(allActuals, uni.id, "core", c.name, c2.key), 0) : 0;
  const c1T = courses.reduce((s, c) => s + ni(c.targets?.[c1.key]), 0);
  const c2T = c2 ? courses.reduce((s, c) => s + ni(c.targets?.[c2.key]), 0) : 0;
  const totalActual = courses.reduce((s, c) => {
    const lt = ni(c.targets?.[c1.key]), st = c2 ? ni(c.targets?.[c2.key]) : 0;
    const la = getActual(allActuals, uni.id, "core", c.name, c1.key);
    const sa = c2 ? getActual(allActuals, uni.id, "core", c.name, c2.key) : 0;
    return s + (lt > 0 ? la : 0) + (c2 && st > 0 ? sa : 0);
  }, 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg || "#FAF7FF", borderLeft: `2px solid ${c1.color}30` }}>{c1.label} Target</th>
            <th style={{ ...TH, ...TC, background: c1.bg || "#FAF7FF" }}>Actual</th>
            {c2 && <><th style={{ ...TH, ...TC, background: c2.bg || "#F0FAFF", borderLeft: `2px solid ${c2.color}30` }}>{c2.label} Target</th><th style={{ ...TH, ...TC, background: c2.bg || "#F0FAFF" }}>Actual</th></>}
            <th style={{ ...TH, ...TC, borderLeft: `1.5px solid ${T.border}` }}>Target</th>
            <th style={{ ...TH, ...TC }}>Actual</th>
            <th style={{ ...TH, minWidth: 130 }}>Progress</th>
            <th style={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => {
            const lt = ni(c.targets?.[c1.key]), st = c2 ? ni(c.targets?.[c2.key]) : 0;
            const la = getActual(allActuals, uni.id, "core", c.name, c1.key);
            const sa = c2 ? getActual(allActuals, uni.id, "core", c.name, c2.key) : 0;
            const tot = (lt > 0 ? la : 0) + (c2 && st > 0 ? sa : 0);
            const tgt = lt + st, p = pct(tot, tgt);
            const bar = p === null ? T.inkL : p >= 100 ? T.green : p >= 70 ? T.yellow : T.red;
            const bg1 = c1.bg || "#FAF7FF", bg2 = c2?.bg || "#F0FAFF";
            return (
              <tr key={c.name} style={{ background: i % 2 ? T.bg : T.white }}
                onMouseEnter={e => e.currentTarget.style.background = `${uni.color}10`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? T.bg : T.white}
              >
                <td style={{ ...TD, fontWeight: 500, color: T.ink }}>{c.name}</td>
                <td style={{ ...TD, ...TC, background: bg1, borderLeft: `2px solid ${c1.color}30` }}>
                  <Num value={c.targets?.[c1.key] ?? ""} accent={c1.color} onChange={() => {}} readOnly={true} />
                </td>
                <td style={{ ...TD, ...TC, background: bg1, verticalAlign: "top" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                        <span style={{ padding: "4px 8px", fontSize: 13, fontWeight: 700, color: T.purple, minWidth: 28, textAlign: "center" }}>{la}</span>
                        {editable && (
                          <button onClick={() => setExpandedCell(prev => prev === `${c.name}__${c1.key}` ? null : `${c.name}__${c1.key}`)}
                            style={{ padding: "4px 6px", background: expandedCell === `${c.name}__${c1.key}` ? T.purple : "transparent", border: "none", borderLeft: `1px solid ${T.border}`, cursor: "pointer", fontSize: 9, color: expandedCell === `${c.name}__${c1.key}` ? T.white : T.inkL }}>
                            {expandedCell === `${c.name}__${c1.key}` ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>
                    {editable && expandedCell === `${c.name}__${c1.key}` && (
                      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, minWidth: 160, zIndex: 10 }}>
                        {["Unattributed", ...counsellors].map(cn => {
                          const v = getActualByCounsellor(allActuals, uni.id, "core", c.name, c1.key, cn);
                          return (
                            <div key={cn} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, color: T.inkM, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn}</span>
                              <input type="number" min="0" value={v || ""} placeholder="0"
                                onChange={e => setAllActuals(prev => setActualByCounsellor(prev, uni.id, "core", c.name, c1.key, cn, ni(e.target.value)))}
                                onBlur={scheduleSave}
                                style={{ width: 44, padding: "3px 5px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, fontFamily: "ui-monospace, monospace", textAlign: "center" }} />
                            </div>
                          );
                        })}
                        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.inkM }}>Total</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: "ui-monospace, monospace" }}>{la}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                {c2 && <>
                  <td style={{ ...TD, ...TC, background: bg2, borderLeft: `2px solid ${c2.color}30` }}>
                    <Num value={c.targets?.[c2.key] ?? ""} accent={c2.color} onChange={() => {}} readOnly={true} />
                  </td>
                  <td style={{ ...TD, ...TC, background: bg2, verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                          <span style={{ padding: "4px 8px", fontSize: 13, fontWeight: 700, color: T.purple, minWidth: 28, textAlign: "center" }}>{sa}</span>
                          {editable && (
                            <button onClick={() => setExpandedCell(prev => prev === `${c.name}__${c2.key}` ? null : `${c.name}__${c2.key}`)}
                              style={{ padding: "4px 6px", background: expandedCell === `${c.name}__${c2.key}` ? T.purple : "transparent", border: "none", borderLeft: `1px solid ${T.border}`, cursor: "pointer", fontSize: 9, color: expandedCell === `${c.name}__${c2.key}` ? T.white : T.inkL }}>
                              {expandedCell === `${c.name}__${c2.key}` ? "▲" : "▼"}
                            </button>
                          )}
                        </div>
                      </div>
                      {editable && expandedCell === `${c.name}__${c2.key}` && (
                        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, minWidth: 160, zIndex: 10 }}>
                          {["Unattributed", ...counsellors].map(cn => {
                            const v = getActualByCounsellor(allActuals, uni.id, "core", c.name, c2.key, cn);
                            return (
                              <div key={cn} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 10, color: T.inkM, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn}</span>
                                <input type="number" min="0" value={v || ""} placeholder="0"
                                  onChange={e => setAllActuals(prev => setActualByCounsellor(prev, uni.id, "core", c.name, c2.key, cn, ni(e.target.value)))}
                                  onBlur={scheduleSave}
                                  style={{ width: 44, padding: "3px 5px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, fontFamily: "ui-monospace, monospace", textAlign: "center" }} />
                              </div>
                            );
                          })}
                          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: T.inkM }}>Total</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: "ui-monospace, monospace" }}>{sa}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </>}
                <td style={{ ...TD, ...TC, fontWeight: 600, color: T.inkM, borderLeft: `1.5px solid ${T.border}`, fontFamily: "ui-monospace, monospace" }}>{tgt || "—"}</td>
                <td style={{ ...TD, ...TC, fontWeight: 700, fontSize: 15, color: tot > 0 ? T.ink : T.border, fontFamily: "ui-monospace, monospace" }}>{tot || "—"}</td>
                <td style={{ ...TD, minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><Bar value={tot} max={tgt} color={bar} h={6} /></div>
                    <span style={{ fontSize: 11, color: T.inkL, width: 30, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{p ?? 0}%</span>
                  </div>
                </td>
                <td style={TD}><StatusBadge p={p} /></td>
              </tr>
            );
          })}
          <tr style={{ background: uni.color }}>
            <td style={{ ...TD, color: T.white, fontWeight: 700, fontSize: 13 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: "rgba(255,255,255,.8)", fontWeight: 700, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{c1T}</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.08)", fontFamily: "ui-monospace, monospace" }}>{c1A}</td>
            {c2 && <>
              <td style={{ ...TD, ...TC, color: "rgba(255,255,255,.8)", fontWeight: 700, background: "rgba(255,255,255,.06)", borderLeft: "2px solid rgba(255,255,255,.12)", fontFamily: "ui-monospace, monospace" }}>{c2T}</td>
              <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.06)", fontFamily: "ui-monospace, monospace" }}>{c2A}</td>
            </>}
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 700, borderLeft: "1.5px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{c1T + c2T}</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 18, fontFamily: "ui-monospace, monospace" }}>{totalActual}</td>
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

// ── OTHER COURSES TABLE ────────────────────────────────────────────────────────
function OtherTable({ uni, allActuals, onUpdate, editable, counsellors, getActualByCounsellor, setActualByCounsellor, setAllActuals, scheduleSave }) {
  const [expandedCell, setExpandedCell] = useState(null);
  const c1 = uni.campus1, c2 = uni.campus2;
  const courses = uni.otherCourses || [];
  const tot1 = courses.reduce((s, c) => s + getActual(allActuals, uni.id, "other", c, c1.key), 0);
  const tot2 = c2 ? courses.reduce((s, c) => s + getActual(allActuals, uni.id, "other", c, c2.key), 0) : 0;

  if (!courses.length) return (
    <div style={{ padding: "40px", textAlign: "center", color: T.inkL, fontSize: 13 }}>
      No other courses yet. Add courses from the Course Manager.
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>Course</th>
            <th style={{ ...TH, ...TC, background: c1.bg || "#FAF7FF", borderLeft: `2px solid ${c1.color}30` }}>{c1.label}</th>
            {c2 && <th style={{ ...TH, ...TC, background: c2.bg || "#F0FAFF", borderLeft: `2px solid ${c2.color}30` }}>{c2.label}</th>}
            <th style={{ ...TH, ...TC, borderLeft: `1.5px solid ${T.border}` }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => {
            const v1 = getActual(allActuals, uni.id, "other", c, c1.key);
            const v2 = c2 ? getActual(allActuals, uni.id, "other", c, c2.key) : 0;
            return (
              <tr key={c} style={{ background: i % 2 ? T.bg : T.white }}
                onMouseEnter={e => e.currentTarget.style.background = `${uni.color}10`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? T.bg : T.white}
              >
                <td style={{ ...TD, fontWeight: 500, color: T.ink }}>{c}</td>
                <td style={{ ...TD, ...TC, background: c1.bg || "#FAF7FF", borderLeft: `2px solid ${c1.color}30`, verticalAlign: "top" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                        <span style={{ padding: "4px 8px", fontSize: 13, fontWeight: 700, color: T.purple, minWidth: 28, textAlign: "center" }}>{v1}</span>
                        {editable && (
                          <button onClick={() => setExpandedCell(prev => prev === `${c}__${c1.key}` ? null : `${c}__${c1.key}`)}
                            style={{ padding: "4px 6px", background: expandedCell === `${c}__${c1.key}` ? T.purple : "transparent", border: "none", borderLeft: `1px solid ${T.border}`, cursor: "pointer", fontSize: 9, color: expandedCell === `${c}__${c1.key}` ? T.white : T.inkL }}>
                            {expandedCell === `${c}__${c1.key}` ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>
                    {editable && expandedCell === `${c}__${c1.key}` && (
                      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, minWidth: 160, zIndex: 10 }}>
                        {["Unattributed", ...counsellors].map(cn => {
                          const v = getActualByCounsellor(allActuals, uni.id, "other", c, c1.key, cn);
                          return (
                            <div key={cn} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, color: T.inkM, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn}</span>
                              <input type="number" min="0" value={v || ""} placeholder="0"
                                onChange={e => setAllActuals(prev => setActualByCounsellor(prev, uni.id, "other", c, c1.key, cn, ni(e.target.value)))}
                                onBlur={scheduleSave}
                                style={{ width: 44, padding: "3px 5px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, fontFamily: "ui-monospace, monospace", textAlign: "center" }} />
                            </div>
                          );
                        })}
                        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.inkM }}>Total</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: "ui-monospace, monospace" }}>{v1}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                {c2 && <td style={{ ...TD, ...TC, background: c2.bg || "#F0FAFF", borderLeft: `2px solid ${c2.color}30`, verticalAlign: "top" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                        <span style={{ padding: "4px 8px", fontSize: 13, fontWeight: 700, color: T.purple, minWidth: 28, textAlign: "center" }}>{v2}</span>
                        {editable && (
                          <button onClick={() => setExpandedCell(prev => prev === `${c}__${c2.key}` ? null : `${c}__${c2.key}`)}
                            style={{ padding: "4px 6px", background: expandedCell === `${c}__${c2.key}` ? T.purple : "transparent", border: "none", borderLeft: `1px solid ${T.border}`, cursor: "pointer", fontSize: 9, color: expandedCell === `${c}__${c2.key}` ? T.white : T.inkL }}>
                            {expandedCell === `${c}__${c2.key}` ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>
                    {editable && expandedCell === `${c}__${c2.key}` && (
                      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, minWidth: 160, zIndex: 10 }}>
                        {["Unattributed", ...counsellors].map(cn => {
                          const v = getActualByCounsellor(allActuals, uni.id, "other", c, c2.key, cn);
                          return (
                            <div key={cn} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, color: T.inkM, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn}</span>
                              <input type="number" min="0" value={v || ""} placeholder="0"
                                onChange={e => setAllActuals(prev => setActualByCounsellor(prev, uni.id, "other", c, c2.key, cn, ni(e.target.value)))}
                                onBlur={scheduleSave}
                                style={{ width: 44, padding: "3px 5px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, fontFamily: "ui-monospace, monospace", textAlign: "center" }} />
                            </div>
                          );
                        })}
                        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.inkM }}>Total</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: "ui-monospace, monospace" }}>{v2}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>}
                <td style={{ ...TD, ...TC, fontWeight: 700, fontSize: 15, color: v1 + v2 > 0 ? T.ink : T.border, borderLeft: `1.5px solid ${T.border}`, fontFamily: "ui-monospace, monospace" }}>{v1 + v2 || "—"}</td>
              </tr>
            );
          })}
          <tr style={{ background: uni.color }}>
            <td style={{ ...TD, color: T.white, fontWeight: 700 }}>TOTALS</td>
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.08)", borderLeft: "2px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{tot1}</td>
            {c2 && <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 16, background: "rgba(255,255,255,.06)", borderLeft: "2px solid rgba(255,255,255,.12)", fontFamily: "ui-monospace, monospace" }}>{tot2}</td>}
            <td style={{ ...TD, ...TC, color: T.white, fontWeight: 800, fontSize: 18, borderLeft: "1.5px solid rgba(255,255,255,.15)", fontFamily: "ui-monospace, monospace" }}>{tot1 + tot2}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ config, allActuals, counsellors, getActual, getActualByCounsellor, T }) {
  const [filterUni,    setFilterUni]    = useState(null);
  const [filterCourse, setFilterCourse] = useState(null);
  const [showOtherUnis, setShowOtherUnis] = useState(false);

  // ── Data helpers ────────────────────────────────────────────────────────────
  const getCourseActual = useCallback((uni, courseName, section = "core") => {
    const c1 = uni.campus1.key, c2 = uni.campus2?.key;
    return getActual(allActuals, uni.id, section, courseName, c1)
         + (c2 ? getActual(allActuals, uni.id, section, courseName, c2) : 0);
  }, [allActuals]);

  const getUniTotal = useCallback((uni) => {
    let t = 0;
    uni.coreCourses.forEach(c => {
      const name = typeof c === "string" ? c : c.name;
      t += getCourseActual(uni, name, "core");
    });
    (uni.otherCourses || []).forEach(name => { t += getCourseActual(uni, name, "other"); });
    return t;
  }, [getCourseActual]);

  // ── Chart data ───────────────────────────────────────────────────────────────

  // 1. Deposits by university — filtered by selected course
  // All universities with values (used for grand total and pie)
  const allUniData = config.map(uni => {
    let value;
    if (filterCourse) {
      const inCore  = uni.coreCourses.some(c => (typeof c === "string" ? c : c.name) === filterCourse);
      const inOther = (uni.otherCourses || []).includes(filterCourse);
      value = inCore  ? getCourseActual(uni, filterCourse, "core")
            : inOther ? getCourseActual(uni, filterCourse, "other") : 0;
    } else {
      value = getUniTotal(uni);
    }
    return { name: uni.shortName, shortName: uni.shortName, value, color: uni.color, id: uni.id };
  });

  // Bar chart: filter zeros, sort descending; fallback to primary unis if no data
  const uniBarData = allUniData.filter(u => u.value > 0).sort((a, b) => b.value - a.value);
  const uniBarDisplay = uniBarData.length > 0
    ? uniBarData
    : config.filter(u => u.hasTargets).map(u => ({ name: u.shortName, value: 0, color: u.color, id: u.id }));

  // 2. Top courses — filtered by selected university
  const allCourses = [];
  config.forEach(uni => {
    if (filterUni && uni.id !== filterUni) return;
    uni.coreCourses.forEach(c => {
      const name = typeof c === "string" ? c : c.name;
      const val  = getCourseActual(uni, name, "core");
      if (val > 0) allCourses.push({ name, value: val, color: uni.color, uni: uni.shortName });
    });
    (uni.otherCourses || []).forEach(name => {
      const val = getCourseActual(uni, name, "other");
      if (val > 0) allCourses.push({ name, value: val, color: uni.color, uni: uni.shortName });
    });
  });
  // Merge same-name courses across unis, sum values
  const courseMap = {};
  allCourses.forEach(({ name, value, color, uni }) => {
    if (!courseMap[name]) courseMap[name] = { name, value: 0, color, uni };
    courseMap[name].value += value;
  });
  const courseBarData = Object.values(courseMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  // 3. Target vs Actual — only for unis with targets
  const targetData = config
    .filter(u => u.hasTargets)
    .map(uni => {
      const target = uni.coreCourses.reduce((s, c) => {
        const t = c.targets || {};
        return s + ni(t[uni.campus1.key]) + ni(uni.campus2 ? t[uni.campus2.key] : 0);
      }, 0);
      const actual = uni.coreCourses.reduce((s, c) => {
        const name = typeof c === "string" ? c : c.name;
        const lt = ni(c.targets?.[uni.campus1.key]);
        const st = uni.campus2 ? ni(c.targets?.[uni.campus2.key]) : 0;
        return s + (lt > 0 ? getActual(allActuals, uni.id, "core", name, uni.campus1.key) : 0)
                 + (st > 0 && uni.campus2 ? getActual(allActuals, uni.id, "core", name, uni.campus2.key) : 0);
      }, 0);
      return { name: uni.shortName, Actual: actual, Target: target, color: uni.color };
    });

  // 4. Campus split — unis with 2 campuses
  const campusData = config
    .filter(u => u.campus2)
    .map(uni => {
      const c1Key = uni.campus1.key;
      const c2Key = uni.campus2.key;
      let c1Total = 0;
      let c2Total = 0;
      uni.coreCourses.forEach(c => {
        const name = typeof c === "string" ? c : c.name;
        c1Total += getActual(allActuals, uni.id, "core", name, c1Key);
        c2Total += getActual(allActuals, uni.id, "core", name, c2Key);
      });
      (uni.otherCourses || []).forEach(c => {
        const name = typeof c === "string" ? c : c.name;
        c1Total += getActual(allActuals, uni.id, "other", name, c1Key);
        c2Total += getActual(allActuals, uni.id, "other", name, c2Key);
      });
      return {
        name: uni.shortName,
        c1: uni.campus1.label,
        c2: uni.campus2.label,
        c1Total,
        c2Total,
        c1Color: uni.campus1.color || T.purple,
        c2Color: uni.campus2.color || T.teal,
      };
    })
    .filter(u => u.c1Total + u.c2Total > 0);

  // 5. Pie data — university share
  const grandTotal = allUniData.reduce((s, u) => s + u.value, 0);

  // Pie: top 5 universities by deposits + grouped Others
  const sortedForPie = [...allUniData].filter(u => u.value > 0).sort((a, b) => b.value - a.value);
  const pieTop = sortedForPie.slice(0, 5);
  const othersVal = sortedForPie.slice(5).reduce((s, u) => s + u.value, 0);
  const pieData = othersVal > 0
    ? [...pieTop, { name: "Others", value: othersVal, color: "#CBD5E1", id: "others" }]
    : pieTop;

  // ── Chart styles ─────────────────────────────────────────────────────────────
  const chartCard = {
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: "20px 20px 12px",
    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
  };
  const chartTitle = { margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: T.ink };
  const chartSub   = { margin: "0 0 16px", fontSize: 11, color: T.inkL };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: T.ink }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: 0, fontSize: 12, color: p.color || T.purple }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "28px 40px" }}>

      {/* Active filter chips */}
      {(filterUni || filterCourse) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.inkL, fontWeight: 600 }}>Filtering by:</span>
          {filterUni && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, background: `${config.find(u => u.id === filterUni)?.color}18`, border: `1px solid ${config.find(u => u.id === filterUni)?.color}40`, color: config.find(u => u.id === filterUni)?.color, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
              {config.find(u => u.id === filterUni)?.shortName}
              <button onClick={() => setFilterUni(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          )}
          {filterCourse && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, background: `${T.purple}15`, border: `1px solid ${T.purple}40`, color: T.purple, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
              {filterCourse}
              <button onClick={() => setFilterCourse(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          )}
          <button onClick={() => { setFilterUni(null); setFilterCourse(null); }} style={{ fontSize: 11, color: T.inkL, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear all</button>
        </div>
      )}

      {/* Row 1: Deposits by University + Pie */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>

        {/* Deposits by University */}
        <div style={{ ...chartCard, flex: 3, minWidth: 300 }}>
          <p style={chartTitle}>Deposits by University</p>
          <p style={chartSub}>
            {filterCourse ? `Showing deposits for "${filterCourse}"` : uniBarDisplay.length < allUniData.length ? `Showing ${uniBarDisplay.length} universities with deposits` : "Click a bar to filter the Courses chart"}
          </p>
          {(() => {
            const primary = uniBarDisplay.filter(u => PRIMARY_UNI_IDS.includes(u.id));
            const others  = uniBarDisplay.filter(u => !PRIMARY_UNI_IDS.includes(u.id));
            const maxVal  = uniBarDisplay[0]?.value || 1;

            const BarRow = ({ entry }) => (
              <div onClick={() => setFilterUni(prev => prev === entry.id ? null : entry.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "3px 0",
                  opacity: filterUni && filterUni !== entry.id ? 0.35 : 1, transition: "opacity .15s" }}>
                <span style={{ fontSize: 11, color: T.inkM, width: 130, textAlign: "right", flexShrink: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: filterUni === entry.id ? 700 : 400 }}>
                  {entry.name}
                </span>
                <div style={{ flex: 1, background: T.border, borderRadius: "0 4px 4px 0", height: 18, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(entry.value / maxVal * 100)}%`, height: "100%",
                    background: entry.color, borderRadius: "0 4px 4px 0", transition: "width .4s ease" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "ui-monospace, monospace",
                  color: entry.color, width: 28, flexShrink: 0 }}>{entry.value}</span>
              </div>
            );

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {primary.map(u => <BarRow key={u.id} entry={u} />)}
                {others.length > 0 && (
                  <>
                    <div onClick={() => setShowOtherUnis(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: T.inkL, width: 130, textAlign: "right", flexShrink: 0 }}>
                        Other Universities {showOtherUnis ? "▲" : "▼"}
                      </span>
                      <div style={{ flex: 1, height: 1, background: T.border }} />
                      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "ui-monospace, monospace",
                        color: T.inkL, width: 28, flexShrink: 0 }}>
                        {others.reduce((s, u) => s + u.value, 0)}
                      </span>
                    </div>
                    {showOtherUnis && others.map(u => <BarRow key={u.id} entry={u} />)}
                  </>
                )}
                {uniBarDisplay.length === 0 && (
                  <p style={{ fontSize: 12, color: T.inkL, textAlign: "center", padding: "20px 0" }}>No deposits recorded yet</p>
                )}
              </div>
            );
          })()}
        </div>

        {/* University share pie */}
        <div style={{ ...chartCard, flex: 1.2, minWidth: 220, display: "flex", flexDirection: "column" }}>
          <p style={chartTitle}>University Share</p>
          <p style={chartSub}>Proportion of total deposits</p>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {grandTotal > 0 ? (
              <PieChart width={200} height={180}>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <p style={{ color: T.inkL, fontSize: 12 }}>No data yet</p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {pieData.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: u.color }} />
                  <span style={{ fontSize: 11, color: T.inkM }}>{u.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: u.color, fontFamily: "ui-monospace, monospace" }}>
                  {u.value} {grandTotal > 0 ? `(${Math.round(u.value / grandTotal * 100)}%)` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Top Courses + Target vs Actual */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>

        {/* Top Courses */}
        <div style={{ ...chartCard, flex: 2, minWidth: 300 }}>
          <p style={chartTitle}>Top Courses by Deposits</p>
          <p style={chartSub}>
            {filterUni ? `Filtered to ${config.find(u => u.id === filterUni)?.shortName} — click a bar to filter the University chart` : "Showing top 15 courses — click a bar to filter the University chart"}
          </p>
          <ResponsiveContainer width="100%" height={Math.max(courseBarData.length * 28, 200)}>
            <BarChart data={courseBarData} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: T.inkL }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11, fill: T.inkM }} axisLine={false} tickLine={false}
                tickFormatter={v => v.length > 30 ? v.slice(0, 30) + "…" : v} />
              <Tooltip content={<CustomTooltip />} />
              <RBar dataKey="value" radius={[0, 6, 6, 0]} cursor="pointer"
                onClick={d => setFilterCourse(prev => prev === d.name ? null : d.name)}>
                {courseBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.color}
                    opacity={filterCourse && filterCourse !== entry.name ? 0.3 : 1} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: T.inkM, fontWeight: 600 }} />
              </RBar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Target vs Actual */}
        <div style={{ ...chartCard, flex: 1.5, minWidth: 260 }}>
          <p style={chartTitle}>Target vs Actual · Seat Caps</p>
          <p style={chartSub}>Core courses only — universities with targets</p>
          <ResponsiveContainer width="100%" height={Math.max(targetData.length * 60, 180)}>
            <BarChart data={targetData} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: T.inkL }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: T.inkM }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <RBar dataKey="Target" fill={T.border} radius={[0, 4, 4, 0]} opacity={0.6}>
                <LabelList dataKey="Target" position="right" style={{ fontSize: 10, fill: T.inkL }} />
              </RBar>
              <RBar dataKey="Actual" radius={[0, 4, 4, 0]}>
                {targetData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                <LabelList dataKey="Actual" position="right" style={{ fontSize: 10, fill: T.inkM, fontWeight: 600 }} />
              </RBar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Campus Split */}
      {campusData.length > 0 && (
        <div style={{ ...chartCard }}>
          <p style={chartTitle}>Campus Distribution</p>
          <p style={chartSub}>All deposits split by campus</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campusData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.inkM }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.inkL }} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const entry = campusData.find(d => d.name === label);
                if (!entry) return null;
                return (
                  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                    <p style={{ fontWeight: 700, color: T.ink, marginBottom: 6 }}>{label}</p>
                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.fill, margin: "2px 0" }}>
                        {i === 0 ? entry.c1 : entry.c2}: <strong>{p.value}</strong>
                      </p>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value, entry, index) => {
                if (campusData.length === 0) return value;
                return index === 0
                  ? campusData.map(d => d.c1).join(' / ')
                  : campusData.map(d => d.c2).join(' / ');
              }} />
              <RBar dataKey="c1Total" stackId="s" name={campusData[0]?.c1 || "Campus 1"} radius={[0, 0, 0, 0]}>
                {campusData.map((entry, i) => <Cell key={i} fill={entry.c1Color} />)}
                <LabelList dataKey="c1Total" position="inside" style={{ fontSize: 11, fill: "#fff", fontWeight: 600 }} />
              </RBar>
              <RBar dataKey="c2Total" stackId="s" name={campusData[0]?.c2 || "Campus 2"} radius={[4, 4, 0, 0]}>
                {campusData.map((entry, i) => <Cell key={i} fill={entry.c2Color} />)}
                <LabelList dataKey="c2Total" position="inside" style={{ fontSize: 11, fill: "#fff", fontWeight: 600 }} />
              </RBar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p style={{ margin: "16px 0 0", fontSize: 11, color: T.inkL, textAlign: "center" }}>
        Click any bar to cross-filter · Click again to clear · Use chips above to clear filters
      </p>

      <div style={{ marginTop: 16 }}>
        <CounsellorDashboard
          counsellors={counsellors}
          config={config}
          allActuals={allActuals}
          getActual={getActual}
          getActualByCounsellor={getActualByCounsellor}
          T={T}
        />
      </div>
    </div>
  );
}

// ── COURSE MANAGER PANEL ──────────────────────────────────────────────────────
function CourseManager({ config, onSave, onClose, counsellors, setCounsellors, embedded = false }) {
  const [draft, setDraft]         = useState(JSON.parse(JSON.stringify(config)));
  const [activeUni, setActiveUni] = useState(draft[0]?.id || "");
  const [newCourse, setNewCourse] = useState({ name: "", section: "core", targets: {} });
  const [newCounsellorName, setNewCounsellorName] = useState("");
  const [addingTo, setAddingTo]   = useState(null); // uniId
  const [addingUni, setAddingUni] = useState(false);
  const [newUni, setNewUni]       = useState({ name: "", shortName: "", color: T.teal, intakeLabel: "", hasTargets: true, campus1: { key: "", label: "", color: T.purple }, campus2: { key: "", label: "", color: T.teal } });
  const [editingCourse, setEditingCourse] = useState(null); // { uniId, section, index }
  const [editingUni, setEditingUni] = useState(null); // holds the uni object being edited
  const [saving, setSaving]       = useState(false);

  const uni = draft.find(u => u.id === activeUni);

  const deleteCourse = (uniId, section, idx) => {
    setDraft(d => d.map(u => u.id !== uniId ? u : {
      ...u,
      [`${section}Courses`]: u[`${section}Courses`].filter((_, i) => i !== idx),
    }));
  };

  const addCourse = (uniId) => {
    if (!newCourse.name.trim()) return;
    setDraft(d => d.map(u => {
      if (u.id !== uniId) return u;
      const section = newCourse.section;
      const course = section === "core" && u.hasTargets
        ? { name: newCourse.name.trim(), targets: { [u.campus1.key]: ni(newCourse.targets?.c1), ...(u.campus2 ? { [u.campus2.key]: ni(newCourse.targets?.c2) } : {}) } }
        : newCourse.name.trim();
      return { ...u, [`${section}Courses`]: [...(u[`${section}Courses`] || []), course] };
    }));
    setNewCourse({ name: "", section: "core", targets: {} });
    setAddingTo(null);
  };

  const addUniversity = () => {
    if (!newUni.name.trim() || !newUni.campus1.key.trim()) return;
    const id = newUni.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setDraft(d => [...d, { ...newUni, id, coreCourses: [], otherCourses: [], campus2: newUni.hasTargets ? newUni.campus2 : null }]);
    setAddingUni(false);
    setNewUni({ name: "", shortName: "", color: T.teal, intakeLabel: "", hasTargets: true, campus1: { key: "", label: "", color: T.purple }, campus2: { key: "", label: "", color: T.teal } });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose?.();
  };

  const inp = (val, onChange, placeholder = "") => (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", color: T.ink, background: T.white }} />
  );

  const inner = (
    <div style={{ display: "flex", flexDirection: "column", ...(embedded ? { flex: 1, overflow: "hidden" } : { width: 560, height: "100vh", background: T.white, boxShadow: "-4px 0 32px rgba(0,0,0,.12)", overflow: "hidden" }) }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800, color: T.ink }}>⚙ Course Manager</p>
            <p style={{ margin: 0, fontSize: 12, color: T.inkL }}>Add, edit or remove universities and courses</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: T.purple, color: T.white, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {!embedded && <button onClick={onClose} style={{ padding: "8px 12px", background: T.bg, color: T.inkM, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✕</button>}
          </div>
        </div>

        {/* University selector */}
        <div style={{ padding: "12px 24px", borderBottom: `1px solid ${T.border}`, flexShrink: 0, maxHeight: 280, overflowY: "auto" }}>
          {/* Primary universities */}
          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.inkL, letterSpacing: ".08em", textTransform: "uppercase" }}>Primary</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
            {draft.filter(u => u.hasTargets).map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, background: activeUni === u.id ? `${u.color}15` : "transparent", border: `1px solid ${activeUni === u.id ? u.color + "40" : "transparent"}`, cursor: "pointer" }}
                onClick={() => setActiveUni(u.id)}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: u.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: activeUni === u.id ? 700 : 500, color: activeUni === u.id ? u.color : T.ink }}>{u.name}</span>
                <button onClick={e => { e.stopPropagation(); setEditingUni(JSON.parse(JSON.stringify(u))); }}
                  style={{ padding: "2px 6px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.inkM }}>✏️</button>
                <button onClick={e => { e.stopPropagation(); if (window.confirm(`Remove ${u.name}?`)) { setDraft(d => d.filter(x => x.id !== u.id)); if (activeUni === u.id) setActiveUni(draft.find(x => x.id !== u.id)?.id || ""); }}}
                  style={{ padding: "2px 6px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.red }}>✕</button>
              </div>
            ))}
          </div>
          {/* Other universities */}
          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.inkL, letterSpacing: ".08em", textTransform: "uppercase" }}>Other Universities</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {draft.filter(u => !u.hasTargets).map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: activeUni === u.id ? `${u.color}12` : "transparent", border: `1px solid ${activeUni === u.id ? u.color + "30" : "transparent"}`, cursor: "pointer" }}
                onClick={() => setActiveUni(u.id)}>
                <div style={{ width: 7, height: 7, borderRadius: 99, background: u.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: activeUni === u.id ? 700 : 400, color: activeUni === u.id ? u.color : T.inkM }}>{u.name}</span>
                <button onClick={e => { e.stopPropagation(); setEditingUni(JSON.parse(JSON.stringify(u))); }}
                  style={{ padding: "2px 6px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.inkM }}>✏️</button>
                <button onClick={e => { e.stopPropagation(); if (window.confirm(`Remove ${u.name}?`)) { setDraft(d => d.filter(x => x.id !== u.id)); if (activeUni === u.id) setActiveUni(draft.find(x => x.id !== u.id)?.id || ""); }}}
                  style={{ padding: "2px 6px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.red }}>✕</button>
              </div>
            ))}
            <button onClick={() => setAddingUni(true)}
              style={{ marginTop: 4, padding: "7px 10px", background: "transparent", border: `1.5px dashed ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: T.inkL, textAlign: "left", fontFamily: "inherit" }}>
              + Add University
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>

          {/* Edit University Form */}
          {editingUni && (
            <div style={{ background: T.bg, borderRadius: 12, padding: "16px", marginBottom: 16, border: `1.5px solid ${T.purple}30` }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: T.ink }}>Edit University</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 2 }}>{inp(editingUni.name, v => setEditingUni(p => ({...p, name: v})), "Full name")}</div>
                  <div style={{ flex: 1 }}>{inp(editingUni.shortName, v => setEditingUni(p => ({...p, shortName: v})), "Short name")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {inp(editingUni.intakeLabel, v => setEditingUni(p => ({...p, intakeLabel: v})), "Intake label")}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: T.inkM }}>Colour:</span>
                    <input type="color" value={editingUni.color} onChange={e => setEditingUni(p => ({...p, color: e.target.value}))}
                      style={{ width: 36, height: 32, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer" }} />
                  </div>
                </div>
                <p style={{ margin: "4px 0 2px", fontSize: 12, fontWeight: 600, color: T.inkM }}>Campus 1</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {inp(editingUni.campus1.key, v => setEditingUni(p => ({...p, campus1: {...p.campus1, key: v}})), "Key (e.g. lon)")}
                  {inp(editingUni.campus1.label, v => setEditingUni(p => ({...p, campus1: {...p.campus1, label: v}})), "Label (e.g. London)")}
                  <input type="color" value={editingUni.campus1.color} onChange={e => setEditingUni(p => ({...p, campus1: {...p.campus1, color: e.target.value}}))}
                    style={{ width: 36, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", flexShrink: 0 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={!!editingUni.campus2} id="edit2campus"
                    onChange={e => setEditingUni(p => ({...p, campus2: e.target.checked ? (p.campus2 || { key: "", label: "", color: T.teal }) : null}))} />
                  <label htmlFor="edit2campus" style={{ fontSize: 12, color: T.inkM, cursor: "pointer" }}>Has a second campus</label>
                </div>
                {editingUni.campus2 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {inp(editingUni.campus2.key, v => setEditingUni(p => ({...p, campus2: {...p.campus2, key: v}})), "Key (e.g. york)")}
                    {inp(editingUni.campus2.label, v => setEditingUni(p => ({...p, campus2: {...p.campus2, label: v}})), "Label (e.g. York)")}
                    <input type="color" value={editingUni.campus2.color || T.teal} onChange={e => setEditingUni(p => ({...p, campus2: {...p.campus2, color: e.target.value}}))}
                      style={{ width: 36, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", flexShrink: 0 }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={editingUni.hasTargets} id="editHasTargets"
                    onChange={e => setEditingUni(p => ({...p, hasTargets: e.target.checked}))} />
                  <label htmlFor="editHasTargets" style={{ fontSize: 12, color: T.inkM, cursor: "pointer" }}>Has seat cap targets</label>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    setDraft(d => d.map(u => u.id === editingUni.id ? { ...u, ...editingUni } : u));
                    setEditingUni(null);
                  }} style={{ padding: "8px 16px", background: T.purple, color: T.white, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>Save Changes</button>
                  <button onClick={() => setEditingUni(null)} style={{ padding: "8px 14px", background: T.bg, color: T.inkM, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Add University Form */}
          {addingUni && (
            <div style={{ background: T.bg, borderRadius: 12, padding: "16px", marginBottom: 16, border: `1px solid ${T.border}` }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: T.ink }}>New University</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 2 }}>{inp(newUni.name, v => setNewUni(p => ({...p, name: v})), "Full name")}</div>
                  <div style={{ flex: 1 }}>{inp(newUni.shortName, v => setNewUni(p => ({...p, shortName: v})), "Short name")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {inp(newUni.intakeLabel, v => setNewUni(p => ({...p, intakeLabel: v})), "Intake label (e.g. Sep 2026)")}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: T.inkM }}>Colour:</span>
                    <input type="color" value={newUni.color} onChange={e => setNewUni(p => ({...p, color: e.target.value}))} style={{ width: 36, height: 32, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer" }} />
                  </div>
                </div>
                <p style={{ margin: "4px 0 6px", fontSize: 12, fontWeight: 600, color: T.inkM }}>Campus 1</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {inp(newUni.campus1.key, v => setNewUni(p => ({...p, campus1: {...p.campus1, key: v}})), "Key (e.g. london)")}
                  {inp(newUni.campus1.label, v => setNewUni(p => ({...p, campus1: {...p.campus1, label: v}})), "Label (e.g. London)")}
                  <input type="color" value={newUni.campus1.color} onChange={e => setNewUni(p => ({...p, campus1: {...p.campus1, color: e.target.value}}))} style={{ width: 36, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", flexShrink: 0 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={!!newUni.campus2} onChange={e => setNewUni(p => ({...p, campus2: e.target.checked ? { key: "", label: "", color: T.teal } : null}))} id="has2campus" />
                  <label htmlFor="has2campus" style={{ fontSize: 12, color: T.inkM, cursor: "pointer" }}>Has a second campus</label>
                </div>
                {newUni.campus2 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {inp(newUni.campus2.key, v => setNewUni(p => ({...p, campus2: {...p.campus2, key: v}})), "Key (e.g. york)")}
                    {inp(newUni.campus2.label, v => setNewUni(p => ({...p, campus2: {...p.campus2, label: v}})), "Label (e.g. York)")}
                    <input type="color" value={newUni.campus2?.color || T.teal} onChange={e => setNewUni(p => ({...p, campus2: {...p.campus2, color: e.target.value}}))} style={{ width: 36, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", flexShrink: 0 }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={newUni.hasTargets} onChange={e => setNewUni(p => ({...p, hasTargets: e.target.checked}))} id="hasTargets" />
                  <label htmlFor="hasTargets" style={{ fontSize: 12, color: T.inkM, cursor: "pointer" }}>Has seat cap targets</label>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addUniversity} style={{ padding: "8px 16px", background: T.purple, color: T.white, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>Add University</button>
                  <button onClick={() => setAddingUni(false)} style={{ padding: "8px 14px", background: T.bg, color: T.inkM, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* University course list */}
          {uni && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: uni.color }}>{uni.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.inkL }}>{uni.campus1.label}{uni.campus2 ? ` · ${uni.campus2.label}` : ""} · {uni.coreCourses.length + (uni.otherCourses?.length || 0)} courses</p>
                </div>
              </div>

              {/* Core Courses */}
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkM, letterSpacing: ".06em", textTransform: "uppercase" }}>Core Courses ({uni.coreCourses.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {uni.coreCourses.map((c, i) => {
                  const name = typeof c === "string" ? c : c.name;
                  const isEditing = editingCourse?.uniId === uni.id && editingCourse?.section === "core" && editingCourse?.index === i;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
                      {isEditing ? (
                        <input autoFocus value={name} style={{ flex: 1, padding: "4px 8px", border: `1px solid ${T.purple}`, borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.ink }}
                          onChange={e => {
                            setDraft(d => d.map(u => u.id !== uni.id ? u : {
                              ...u, coreCourses: u.coreCourses.map((cc, ci) => ci !== i ? cc : (typeof cc === "string" ? e.target.value : { ...cc, name: e.target.value }))
                            }));
                          }}
                          onBlur={() => setEditingCourse(null)}
                          onKeyDown={e => e.key === "Enter" && setEditingCourse(null)}
                        />
                      ) : (
                        <span style={{ flex: 1, fontSize: 13, color: T.ink }}>{name}</span>
                      )}
                      {uni.hasTargets && typeof c !== "string" && (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: T.inkL }}>{uni.campus1.label}:</span>
                          <input type="number" value={c.targets?.[uni.campus1.key] ?? 0} onChange={e => setDraft(d => d.map(u => u.id !== uni.id ? u : { ...u, coreCourses: u.coreCourses.map((cc, ci) => ci !== i ? cc : { ...cc, targets: { ...cc.targets, [uni.campus1.key]: ni(e.target.value) } }) }))}
                            style={{ width: 40, padding: "3px", textAlign: "center", fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: "ui-monospace, monospace", color: T.ink }} />
                          {uni.campus2 && <>
                            <span style={{ fontSize: 10, color: T.inkL }}>{uni.campus2.label}:</span>
                            <input type="number" value={c.targets?.[uni.campus2.key] ?? 0} onChange={e => setDraft(d => d.map(u => u.id !== uni.id ? u : { ...u, coreCourses: u.coreCourses.map((cc, ci) => ci !== i ? cc : { ...cc, targets: { ...cc.targets, [uni.campus2.key]: ni(e.target.value) } }) }))}
                              style={{ width: 40, padding: "3px", textAlign: "center", fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: "ui-monospace, monospace", color: T.ink }} />
                          </>}
                        </div>
                      )}
                      <button onClick={() => setEditingCourse({ uniId: uni.id, section: "core", index: i })} style={{ padding: "3px 7px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.inkM }}>✏️</button>
                      <button onClick={() => deleteCourse(uni.id, "core", i)} style={{ padding: "3px 7px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.red }}>✕</button>
                    </div>
                  );
                })}
              </div>

              {/* Other Courses */}
              {uni.hasTargets && (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkM, letterSpacing: ".06em", textTransform: "uppercase" }}>Other Courses ({uni.otherCourses?.length || 0})</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                    {(uni.otherCourses || []).map((c, i) => {
                      const isEditing = editingCourse?.uniId === uni.id && editingCourse?.section === "other" && editingCourse?.index === i;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
                          {isEditing ? (
                            <input autoFocus value={c} style={{ flex: 1, padding: "4px 8px", border: `1px solid ${T.purple}`, borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.ink }}
                              onChange={e => setDraft(d => d.map(u => u.id !== uni.id ? u : { ...u, otherCourses: u.otherCourses.map((cc, ci) => ci !== i ? cc : e.target.value) }))}
                              onBlur={() => setEditingCourse(null)} onKeyDown={e => e.key === "Enter" && setEditingCourse(null)}
                            />
                          ) : <span style={{ flex: 1, fontSize: 13, color: T.ink }}>{c}</span>}
                          <button onClick={() => setEditingCourse({ uniId: uni.id, section: "other", index: i })} style={{ padding: "3px 7px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.inkM }}>✏️</button>
                          <button onClick={() => deleteCourse(uni.id, "other", i)} style={{ padding: "3px 7px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, color: T.red }}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Add Course */}
              {addingTo === uni.id ? (
                <div style={{ background: T.bg, borderRadius: 10, padding: "12px", border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input autoFocus value={newCourse.name} onChange={e => setNewCourse(p => ({...p, name: e.target.value}))}
                      placeholder="Course name" onKeyDown={e => e.key === "Enter" && addCourse(uni.id)}
                      style={{ flex: 1, padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.ink }} />
                    {uni.hasTargets && (
                      <select value={newCourse.section} onChange={e => setNewCourse(p => ({...p, section: e.target.value}))}
                        style={{ padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.ink, background: T.white }}>
                        <option value="core">Core</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                  </div>
                  {uni.hasTargets && newCourse.section === "core" && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: T.inkM }}>{uni.campus1.label} target:</span>
                      <input type="number" value={newCourse.targets?.c1 || ""} onChange={e => setNewCourse(p => ({...p, targets: {...p.targets, c1: e.target.value}}))}
                        style={{ width: 50, padding: "4px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, textAlign: "center", fontFamily: "ui-monospace, monospace", color: T.ink }} />
                      {uni.campus2 && <>
                        <span style={{ fontSize: 12, color: T.inkM }}>{uni.campus2.label} target:</span>
                        <input type="number" value={newCourse.targets?.c2 || ""} onChange={e => setNewCourse(p => ({...p, targets: {...p.targets, c2: e.target.value}}))}
                          style={{ width: 50, padding: "4px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, textAlign: "center", fontFamily: "ui-monospace, monospace", color: T.ink }} />
                      </>}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => addCourse(uni.id)} style={{ padding: "7px 16px", background: uni.color, color: T.white, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>Add</button>
                    <button onClick={() => setAddingTo(null)} style={{ padding: "7px 12px", background: T.bg, color: T.inkM, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(uni.id)} style={{ padding: "8px 16px", background: T.white, color: uni.color, border: `1.5px dashed ${uni.color}50`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", width: "100%" }}>+ Add Course</button>
              )}
            </div>
          )}

          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.inkL, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Counsellors</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
              {counsellors.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", background: T.bg, borderRadius: 6 }}>
                  <span style={{ fontSize: 12, color: T.ink }}>{c}</span>
                  <button onClick={() => setCounsellors(cs => cs.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.red, fontSize: 12 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {inp(newCounsellorName, setNewCounsellorName, "Add counsellor name")}
              <button onClick={() => {
                const name = newCounsellorName.trim();
                if (name && !counsellors.includes(name)) {
                  setCounsellors(cs => [...cs, name]);
                  setNewCounsellorName("");
                }
              }} style={{ padding: "8px 14px", background: T.purple, color: T.white, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit", flexShrink: 0 }}>Add</button>
            </div>
          </div>
        </div>
      </div>
  );
  return embedded ? inner : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(22,17,43,.55)", backdropFilter: "blur(8px)", zIndex: 998, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }} onClick={onClose}>
      {inner}
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
        <input type="password" autoFocus value={val} onChange={e => { setVal(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && go()} placeholder="Passcode"
          style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `2px solid ${err ? T.red : T.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", marginBottom: err ? 8 : 14, color: T.ink, boxSizing: "border-box" }} />
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

// ── COUNSELLOR DASHBOARD ──────────────────────────────────────────────────────
function CounsellorDashboard({ counsellors, config, allActuals, getActual, getActualByCounsellor, T }) {
  const [expandedCounsellor, setExpandedCounsellor] = useState(null);

  const leaderboard = counsellors.map(cn => {
    const total = config.reduce((sum, uni) => {
      const c1k = uni.campus1.key, c2k = uni.campus2?.key;
      const sections = ["core", "other"];
      return sum + sections.reduce((s2, sec) => {
        const courses = sec === "core" ? uni.coreCourses : (uni.otherCourses || []);
        return s2 + courses.reduce((s3, c) => {
          const name = typeof c === "string" ? c : c.name;
          return s3 + getActualByCounsellor(allActuals, uni.id, sec, name, c1k, cn)
                    + (c2k ? getActualByCounsellor(allActuals, uni.id, sec, name, c2k, cn) : 0);
        }, 0);
      }, 0);
    }, 0);

    const byUni = config.map(uni => {
      const c1k = uni.campus1.key, c2k = uni.campus2?.key;
      const sections = ["core", "other"];
      const uTotal = sections.reduce((s2, sec) => {
        const courses = sec === "core" ? uni.coreCourses : (uni.otherCourses || []);
        return s2 + courses.reduce((s3, c) => {
          const name = typeof c === "string" ? c : c.name;
          return s3 + getActualByCounsellor(allActuals, uni.id, sec, name, c1k, cn)
                    + (c2k ? getActualByCounsellor(allActuals, uni.id, sec, name, c2k, cn) : 0);
        }, 0);
      }, 0);
      return { id: uni.id, name: uni.shortName, color: uni.color, total: uTotal };
    }).filter(u => u.total > 0);

    return { name: cn, total, byUni };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxTotal = leaderboard[0]?.total || 1;

  return (
    <div style={{ padding: "24px 32px" }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Counsellor Performance</p>
      <p style={{ fontSize: 12, color: T.inkM, marginBottom: 24 }}>Total deposits attributed per counsellor across all universities</p>
      {leaderboard.length === 0 && (
        <p style={{ fontSize: 13, color: T.inkL, textAlign: "center", padding: "40px 0" }}>No counsellor data yet. Enter deposits with counsellor attribution to see results here.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leaderboard.map((cn, i) => (
          <div key={cn.name} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div onClick={() => setExpandedCounsellor(prev => prev === cn.name ? null : cn.name)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.inkL, width: 24, flexShrink: 0 }}>#{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, width: 200, flexShrink: 0 }}>{cn.name}</span>
              <div style={{ flex: 1, background: T.bg, borderRadius: "0 4px 4px 0", height: 20, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(cn.total / maxTotal * 100)}%`, height: "100%", background: T.purple, borderRadius: "0 4px 4px 0", transition: "width .4s" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.purple, fontFamily: "ui-monospace, monospace", width: 36, textAlign: "right", flexShrink: 0 }}>{cn.total}</span>
              <span style={{ fontSize: 10, color: T.inkL, flexShrink: 0 }}>{expandedCounsellor === cn.name ? "▲" : "▼"}</span>
            </div>
            {expandedCounsellor === cn.name && (
              <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px 12px 56px", display: "flex", flexDirection: "column", gap: 5 }}>
                {cn.byUni.map(u => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: u.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: T.inkM, width: 160 }}>{u.name}</span>
                    <div style={{ flex: 1, background: T.bg, borderRadius: "0 4px 4px 0", height: 12, overflow: "hidden" }}>
                      <div style={{ width: `${Math.round(u.total / cn.total * 100)}%`, height: "100%", background: u.color, borderRadius: "0 4px 4px 0" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: u.color, fontFamily: "ui-monospace, monospace", width: 28, textAlign: "right" }}>{u.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DATA MANAGER ──────────────────────────────────────────────────────────────
function DataManager({ config, allActuals, setAllActuals, onClose, scheduleSave, embedded = false }) {
  const [search, setSearch] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editVal, setEditVal] = useState("");

  const rows = useMemo(() => {
    const out = [];
    config.forEach(uni => {
      ["core", "other"].forEach(section => {
        const courses = section === "core" ? (uni.coreCourses || []) : (uni.otherCourses || []);
        courses.forEach(c => {
          const courseName = typeof c === "string" ? c : c.name;
          [uni.campus1, uni.campus2].filter(Boolean).forEach(campus => {
            const val = allActuals?.[uni.id]?.[section]?.[courseName]?.[campus.key];
            if (!val) return;
            if (typeof val === "number") {
              if (val > 0) out.push({ key: `${uni.id}||${section}||${courseName}||${campus.key}||Unattributed`, uniName: uni.name, uniId: uni.id, section, courseName, campusLabel: campus.label, campusKey: campus.key, counsellor: "Unattributed", count: val });
            } else {
              Object.entries(val).forEach(([counsellor, count]) => {
                if (typeof count === "number" && count > 0)
                  out.push({ key: `${uni.id}||${section}||${courseName}||${campus.key}||${counsellor}`, uniName: uni.name, uniId: uni.id, section, courseName, campusLabel: campus.label, campusKey: campus.key, counsellor, count });
              });
            }
          });
        });
      });
    });
    return out;
  }, [config, allActuals]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.uniName.toLowerCase().includes(q) || r.courseName.toLowerCase().includes(q) ||
      r.campusLabel.toLowerCase().includes(q) || r.counsellor.toLowerCase().includes(q) ||
      String(r.count).includes(q)
    );
  }, [rows, search]);

  const startEdit = row => { setEditKey(row.key); setEditVal(String(row.count)); };

  const commitEdit = row => {
    const newCount = parseInt(editVal, 10);
    if (isNaN(newCount) || newCount < 0) { setEditKey(null); return; }
    setAllActuals(prev => setActualByCounsellor(prev, row.uniId, row.section, row.courseName, row.campusKey, row.counsellor, newCount));
    scheduleSave();
    setEditKey(null);
  };

  const deleteRow = row => {
    setAllActuals(prev => setActualByCounsellor(prev, row.uniId, row.section, row.courseName, row.campusKey, row.counsellor, 0));
    scheduleSave();
  };

  const thS = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.inkL, textTransform: "uppercase", letterSpacing: ".07em", textAlign: "left", borderBottom: `1.5px solid ${T.border}`, background: T.bg, position: "sticky", top: 0, zIndex: 1 };
  const tdS = { padding: "9px 14px", fontSize: 13, color: T.ink, borderBottom: `1px solid ${T.border}` };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", ...(embedded ? { flex: 1, overflow: "hidden" } : { width: "min(100vw, 980px)", height: "100%", background: T.white, boxShadow: "-8px 0 40px rgba(0,0,0,.15)" }) }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>Data Manager</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: T.inkM }}>{rows.length} entries across all universities</p>
          </div>
          <input placeholder="Search entries…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: "8px 14px", border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: 220, color: T.ink }} />
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thS}>University</th>
                <th style={thS}>Section</th>
                <th style={thS}>Course</th>
                <th style={thS}>Campus</th>
                <th style={thS}>Counsellor</th>
                <th style={{ ...thS, textAlign: "right" }}>Count</th>
                <th style={{ ...thS, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ ...tdS, textAlign: "center", color: T.inkL, padding: "40px 14px" }}>No entries found</td></tr>
              )}
              {filtered.map(row => (
                <tr key={row.key} style={{ background: editKey === row.key ? T.purpleL : "transparent" }}>
                  <td style={tdS}>{row.uniName}</td>
                  <td style={tdS}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: row.section === "core" ? T.purple : T.teal, background: row.section === "core" ? T.purpleL : T.tealL, padding: "2px 7px", borderRadius: 4 }}>
                      {row.section}
                    </span>
                  </td>
                  <td style={tdS}>{row.courseName}</td>
                  <td style={tdS}>{row.campusLabel}</td>
                  <td style={tdS}>{row.counsellor}</td>
                  <td style={{ ...tdS, textAlign: "right", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
                    {editKey === row.key ? (
                      <input type="number" min="0" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitEdit(row)}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(row); if (e.key === "Escape") setEditKey(null); }}
                        autoFocus
                        style={{ width: 64, padding: "4px 8px", border: `1.5px solid ${T.purple}`, borderRadius: 6, fontSize: 13, fontFamily: "ui-monospace, monospace", fontWeight: 700, textAlign: "right", outline: "none" }} />
                    ) : row.count}
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button onClick={() => startEdit(row)} style={{ padding: "4px 10px", background: T.purpleL, border: `1px solid ${T.purpleM}`, color: T.purple, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>Edit</button>
                      <button onClick={() => deleteRow(row)} style={{ padding: "4px 10px", background: "#FFF0F0", border: "1px solid #FFCDD2", color: "#E53935", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
  return embedded ? content : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", justifyContent: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {content}
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ tab, setTab, config, setConfig, counsellors, setCounsellors, allActuals, setAllActuals, scheduleSave, onClose }) {
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importData, setImportData] = useState(null);

  const handleExport = () => {
    const backup = { all_actuals: allActuals, course_config: config, counsellors, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `deposit-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.all_actuals || !data.course_config) { alert("Invalid backup file."); return; }
        let total = 0;
        Object.values(data.all_actuals).forEach(uni =>
          Object.values(uni).forEach(sec =>
            Object.values(sec).forEach(course =>
              Object.values(course).forEach(campus => {
                if (typeof campus === "object") Object.values(campus).forEach(n => { total += n; });
                else total += campus;
              }))));
        setImportPreview({ total, unis: data.course_config.length, exportedAt: data.exported_at || "Unknown" });
        setImportData(data);
      } catch { alert("Could not read file. Make sure it's a valid tracker export."); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const handleConfirmImport = () => {
    setAllActuals(importData.all_actuals);
    setConfig(importData.course_config);
    if (Array.isArray(importData.counsellors)) setCounsellors(importData.counsellors);
    scheduleSave();
    setImportPreview(null); setImportData(null);
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ padding: "12px 20px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: "transparent", color: tab === id ? T.purple : T.inkM, borderBottom: `2px solid ${tab === id ? T.purple : "transparent"}`, transition: "all .15s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 920, background: T.white, height: "100%", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,.2)" }}>

        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: T.ink, margin: 0 }}>Admin</p>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.inkL }}>✕</button>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.bg }}>
          {tabBtn("config", "🎓 Configuration")}
          {tabBtn("data", "📋 Data")}
          {tabBtn("backup", "💾 Backup")}
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {tab === "config" && (
            <CourseManager
              config={config} onSave={(newConfig) => {
                setConfig(newConfig);
                scheduleSave();
              }}
              counsellors={counsellors} setCounsellors={setCounsellors}
              embedded={true}
            />
          )}

          {tab === "data" && (
            <DataManager
              allActuals={allActuals} setAllActuals={setAllActuals}
              config={config}
              onClose={onClose} scheduleSave={scheduleSave}
              embedded={true}
            />
          )}

          {tab === "backup" && (
            <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 32, overflowY: "auto" }}>
              <div style={{ background: T.bg, borderRadius: 12, padding: "24px 28px", border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>↓ Export backup</p>
                <p style={{ fontSize: 13, color: T.inkM, margin: "0 0 16px" }}>Download a complete JSON snapshot of all deposits, universities, courses and counsellors. Save it somewhere safe after every major data entry session.</p>
                <button onClick={handleExport}
                  style={{ padding: "10px 22px", background: T.purple, color: T.white, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                  ↓ Export now
                </button>
              </div>

              <div style={{ background: T.bg, borderRadius: 12, padding: "24px 28px", border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>↑ Restore from backup</p>
                <p style={{ fontSize: 13, color: T.inkM, margin: "0 0 16px" }}>Upload a previously exported JSON file to fully restore the tracker. This overwrites all current data — only use a backup you trust.</p>
                <input ref={fileRef} type="file" accept=".json" hidden onChange={handleFileChange} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ padding: "10px 22px", background: T.white, color: T.inkM, border: `1.5px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                  ↑ Choose backup file
                </button>
                {importPreview && (
                  <div style={{ marginTop: 20, background: T.white, borderRadius: 10, padding: "18px 22px", border: `1.5px solid ${T.purple}40` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: "0 0 8px" }}>Preview — ready to import</p>
                    <p style={{ fontSize: 12, color: T.inkM, margin: "0 0 4px" }}>Exported: <strong>{importPreview.exportedAt}</strong></p>
                    <p style={{ fontSize: 12, color: T.inkM, margin: "0 0 16px" }}>{importPreview.total} deposits · {importPreview.unis} universities</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleConfirmImport}
                        style={{ padding: "9px 20px", background: T.purple, color: T.white, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                        Confirm restore
                      </button>
                      <button onClick={() => { setImportPreview(null); setImportData(null); }}
                        style={{ padding: "9px 16px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: T.inkM }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PRIMARY_UNI_IDS = ["sunderland", "ysj", "uh"];

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [config,      setConfig]      = useState([]);
  const [allActuals,  setAllActuals]  = useState({});
  const [activeView,   setActiveView]   = useState("dashboard"); // "dashboard" | uniId
  const [subTab,      setSubTab]      = useState("core");
  const [editable,    setEditable]    = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [showAdmin,   setShowAdmin]   = useState(false);
  const [adminTab,    setAdminTab]    = useState("config");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [updatedAt,   setUpdatedAt]   = useState(null);
  const [logo,        setLogo]        = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [depositForm, setDepositForm] = useState({ counsellor: "", uniId: "", section: "core", courseName: "", campusKey: "", count: 1 });

  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [showOthersBreakdown, setShowOthersBreakdown] = useState(false);

  const refs    = useRef({});
  refs.current  = { allActuals, config, logo };
  const timer   = useRef(null);
  const editRef = useRef(editable);
  const dropdownRef = useRef(null);
  useEffect(() => { editRef.current = editable; }, [editable]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowUniDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmtDate = d => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  // ── Load & realtime ─────────────────────────────────────────────────────────
  const migrateActualsV2 = (raw) => {
    if (!raw) return {};
    const out = {};
    for (const uniId of Object.keys(raw)) {
      out[uniId] = {};
      for (const section of Object.keys(raw[uniId] || {})) {
        out[uniId][section] = {};
        for (const course of Object.keys(raw[uniId][section] || {})) {
          out[uniId][section][course] = {};
          for (const campus of Object.keys(raw[uniId][section][course] || {})) {
            const val = raw[uniId][section][course][campus];
            if (typeof val === 'number') {
              out[uniId][section][course][campus] = val > 0 ? { Unattributed: val } : {};
            } else {
              out[uniId][section][course][campus] = val || {};
            }
          }
        }
      }
    }
    return out;
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("tracker_data").select("course_config, all_actuals, logo_data, counsellors").eq("id", 1).single();
      if (!data) { setLoading(false); return; }

      // Load config
      let cfg = data.course_config && data.course_config.length ? data.course_config : DEFAULT_CONFIG;
      setConfig(cfg);
      setActiveView("dashboard");

      // Load actuals — migrate from old format if needed
      let acts = data.all_actuals && Object.keys(data.all_actuals).length
        ? data.all_actuals
        : migrateActuals(data);
      const migratedActuals = migrateActualsV2(acts);
      setAllActuals(migratedActuals);

      if (data.logo_data) setLogo(data.logo_data);
      if (Array.isArray(data.counsellors)) setCounsellors(data.counsellors);
      if (data.updated_at) setUpdatedAt(fmtDate(data.updated_at));
      setLoading(false);

      // If we just migrated, save the new format
      if (!(data.all_actuals && Object.keys(data.all_actuals).length)) {
        await supabase.from("tracker_data").update({ all_actuals: acts, course_config: cfg }).eq("id", 1);
      }
    };
    load();

    const ch = supabase.channel("tracker_rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tracker_data" }, ({ new: row }) => {
        if (editRef.current) return;
        if (row.course_config?.length) setConfig(row.course_config);
        if (row.all_actuals && Object.keys(row.all_actuals).length) setAllActuals(row.all_actuals);
        if (row.logo_data) setLogo(row.logo_data);
        if (row.updated_at) setUpdatedAt(fmtDate(row.updated_at));
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    if (!refs.current.config || refs.current.config.length === 0) return;
    clearTimeout(timer.current);
    setSaving(true);
    timer.current = setTimeout(async () => {
      const now = new Date().toISOString(), r = refs.current;
      await supabase.from("tracker_data").update({
        all_actuals: r.allActuals, course_config: r.config,
        counsellors: counsellors,
        logo_data: r.logo, updated_at: now,
      }).eq("id", 1);
      setSaving(false);
      setUpdatedAt(fmtDate(now));
    }, 700);
  }, [counsellors]);

  const handleActualsUpdate = useCallback((newActuals) => {
    setAllActuals(newActuals);
    if (editRef.current) scheduleSave();
  }, [scheduleSave]);

  const handleSaveConfig = useCallback(async (newConfig) => {
    setConfig(newConfig);
    refs.current.config = newConfig;
    await supabase.from("tracker_data").update({ course_config: newConfig, updated_at: new Date().toISOString() }).eq("id", 1);
  }, []);

  const handleAddDeposit = () => {
    const { counsellor, uniId, section, courseName, campusKey, count } = depositForm;
    if (!counsellor || !uniId || !courseName || !campusKey || count < 1) return;
    const current = getActualByCounsellor(allActuals, uniId, section, courseName, campusKey, counsellor);
    const updated = setActualByCounsellor(allActuals, uniId, section, courseName, campusKey, counsellor, current + count);
    setAllActuals(updated);
    scheduleSave(updated, config);
    setDepositForm({ counsellor: "", uniId: "", section: "core", courseName: "", campusKey: "", count: 1 });
    setShowAddDeposit(false);
  };

  const handleLogo = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setLogo(r.result); if (editRef.current) scheduleSave(); };
    r.readAsDataURL(f);
  };

  // ── Computed totals ──────────────────────────────────────────────────────────
  const uniTotals = config.map(uni => {
    const c1 = uni.campus1, c2 = uni.campus2;
    // Full actuals — all campuses, core + other (for Overall Deposits card)
    const fullCore = uni.coreCourses.reduce((s, c) => {
      const name = typeof c === "string" ? c : c.name;
      return s + getActual(allActuals, uni.id, "core", name, c1.key)
               + (c2 ? getActual(allActuals, uni.id, "core", name, c2.key) : 0);
    }, 0);
    const fullOther = (uni.otherCourses || []).reduce((s, c) => {
      return s + getActual(allActuals, uni.id, "other", c, c1.key)
               + (c2 ? getActual(allActuals, uni.id, "other", c, c2.key) : 0);
    }, 0);
    // Core actuals — only targeted campuses (for Seat Caps progress)
    const coreActual = uni.coreCourses.reduce((s, c) => {
      const name = typeof c === "string" ? c : c.name;
      const lt = ni(c.targets?.[c1.key]);
      const st = c2 ? ni(c.targets?.[c2.key]) : 0;
      return s + (uni.hasTargets
        ? (lt > 0 ? getActual(allActuals, uni.id, "core", name, c1.key) : 0)
          + (c2 && st > 0 ? getActual(allActuals, uni.id, "core", name, c2.key) : 0)
        : getActual(allActuals, uni.id, "core", name, c1.key))
    }, 0);
    const target = uni.hasTargets ? uni.coreCourses.reduce((s, c) =>
      s + ni(c.targets?.[c1.key]) + (c2 ? ni(c.targets?.[c2.key]) : 0), 0) : 0;
    return {
      id: uni.id, name: uni.name, shortName: uni.shortName, color: uni.color,
      total: fullCore + fullOther,
      coreActual,
      target,
    };
  });

  const grandTotal    = uniTotals.reduce((s, u) => s + u.total, 0);
  const uniTab = (u, active) => (
    <button onClick={() => { setActiveView(u.id); setSubTab("core"); }}
      style={{ padding: "12px 22px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", borderRadius: "10px 10px 0 0", background: active ? T.white : "transparent", color: active ? u.color : T.inkL, borderBottom: active ? `3px solid ${u.color}` : "3px solid transparent", transition: "all .15s" }}>
      {u.shortName}
    </button>
  );
  const subBtn = (id, label) => (
    <button onClick={() => setSubTab(id)} style={{ padding: "7px 16px", border: `1px solid ${subTab === id ? T.purple : T.border}`, cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit", background: subTab === id ? T.purpleL : T.white, color: subTab === id ? T.purple : T.inkL, borderRadius: 7, transition: "all .15s" }}>
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

        {/* HEADER */}
        <div style={{ background: T.white, borderBottom: `3px solid ${T.purple}`, padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {logo
                ? <img src={logo} alt="Study Now" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain" }} />
                : <div style={{ width: 44, height: 44, borderRadius: 10, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: T.white, letterSpacing: "-.5px" }}>SN</span>
                  </div>
              }
              {editable && (
                <label style={{ position: "absolute", inset: 0, cursor: "pointer", borderRadius: 10, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0} title="Upload logo">
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saving ? <span style={{ fontSize: 11, color: T.inkL, fontStyle: "italic" }}>Saving…</span>
                    : updatedAt && <span style={{ fontSize: 11, color: T.inkL }}>Updated {updatedAt}</span>}
            {editable && (
              <button onClick={() => { setShowAdmin(true); setAdminTab("config"); }}
                style={{ padding: "8px 16px", background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: "inherit" }}>
                ⚙ Admin
              </button>
            )}
            {editable && (
              <button onClick={() => setShowAddDeposit(true)}
                style={{ padding: "8px 18px", background: T.purple, color: T.white, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                + Add Deposit
              </button>
            )}
            {editable
              ? <button onClick={() => setEditable(false)} style={{ background: T.green, border: "none", color: T.white, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>🔓 Lock</button>
              : <button onClick={() => setShowModal(true)} style={{ background: T.purple, border: "none", color: T.white, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#5720C8"}
                  onMouseLeave={e => e.currentTarget.style.background = T.purple}
                >🔒 Edit</button>
            }
          </div>
        </div>

        <div style={{ padding: "28px 40px" }}>

          {/* STATS ROW */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap", alignItems: "stretch" }}>
            {/* Overall Deposits */}
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 26px", flex: "0 0 240px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: T.inkL, letterSpacing: ".07em", textTransform: "uppercase" }}>Overall Deposits</p>
                <p style={{ margin: "0 0 4px", fontSize: 72, fontWeight: 800, color: T.purple, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{grandTotal}</p>
                <p style={{ margin: 0, fontSize: 12, color: T.inkL }}>Across all universities & courses</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 7 }}>
                {(() => {
                  const primary = uniTotals.filter(u => PRIMARY_UNI_IDS.includes(u.id));
                  const others = uniTotals.filter(u => !PRIMARY_UNI_IDS.includes(u.id));
                  const othersTotal = others.reduce((s, u) => s + u.total, 0);
                  const othersWithData = others.filter(u => u.total > 0).sort((a, b) => b.total - a.total);
                  return (
                    <>
                      {primary.map(u => (
                        <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 99, background: u.color }} />
                            <span style={{ fontSize: 11, color: T.inkM, fontWeight: 500 }}>{u.shortName}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: u.color, fontFamily: "ui-monospace, monospace" }}>{u.total}</span>
                        </div>
                      ))}
                      <div>
                        <div
                          onClick={() => othersTotal > 0 && setShowOthersBreakdown(v => !v)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: othersTotal > 0 ? "pointer" : "default" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 99, background: T.inkL }} />
                            <span style={{ fontSize: 11, color: T.inkM, fontWeight: 500 }}>Other Universities</span>
                            {othersTotal > 0 && (
                              <span style={{ fontSize: 9, color: T.inkL }}>{showOthersBreakdown ? "▲" : "▼"}</span>
                            )}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.inkL, fontFamily: "ui-monospace, monospace" }}>{othersTotal}</span>
                        </div>
                        {showOthersBreakdown && othersWithData.length > 0 && (
                          <div style={{ marginTop: 6, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 5, borderLeft: `2px solid ${T.border}` }}>
                            {othersWithData.map(u => (
                              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: 99, background: u.color }} />
                                  <span style={{ fontSize: 10, color: T.inkM }}>{u.shortName}</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: u.color, fontFamily: "ui-monospace, monospace" }}>{u.total}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                <div style={{ height: 1, background: T.border, margin: "2px 0" }} />
                <div style={{ display: "flex", borderRadius: 99, height: 5, overflow: "hidden", background: T.border }}>
                  {uniTotals.map(u => (
                    <div key={u.id} style={{ width: `${grandTotal > 0 ? Math.round(u.total / grandTotal * 100) : 0}%`, height: "100%", background: u.color }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Seat Caps cards — only for unis with targets */}
            {uniTotals.filter(u => config.find(c => c.id === u.id)?.hasTargets).map(u => (
              <StatCard key={u.id} label={`${u.shortName} · Seat Caps`} value={u.coreActual} max={u.target} accent={u.color} institution={u.shortName} />
            ))}
          </div>

          {/* NAVIGATION TABS */}
          <div style={{ borderBottom: `2px solid ${T.border}`, display: "flex", gap: 0, flexWrap: "wrap" }}>
            {/* Dashboard tab */}
            <button onClick={() => setActiveView("dashboard")}
              style={{ padding: "12px 22px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", borderRadius: "10px 10px 0 0", background: activeView === "dashboard" ? T.white : "transparent", color: activeView === "dashboard" ? T.purple : T.inkL, borderBottom: activeView === "dashboard" ? `3px solid ${T.purple}` : "3px solid transparent", transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
              📊 Dashboard
            </button>
            {config.filter(u => PRIMARY_UNI_IDS.includes(u.id)).map(u => uniTab(u, activeView === u.id))}

            {(() => {
              const others = config.filter(u => !PRIMARY_UNI_IDS.includes(u.id));
              if (!others.length) return null;
              const activeOther = others.find(u => u.id === activeView);
              return (
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button onClick={() => setShowUniDropdown(v => !v)}
                    style={{ padding: "12px 18px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", borderRadius: "10px 10px 0 0", background: activeOther ? T.white : "transparent", color: activeOther ? activeOther.color : T.inkL, borderBottom: activeOther ? `3px solid ${activeOther.color}` : "3px solid transparent", transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
                    {activeOther ? activeOther.shortName : "Other Universities"} ▾
                  </button>
                  {showUniDropdown && (
                    <div style={{ position: "absolute", top: "100%", left: 0, background: T.white, border: `1px solid ${T.border}`, borderRadius: "0 8px 8px 8px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 100, minWidth: 240, maxHeight: 320, overflowY: "auto" }}>
                      {others.map(u => (
                        <button key={u.id} onClick={() => { setActiveView(u.id); setSubTab("core"); setShowUniDropdown(false); }}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: activeView === u.id ? `${u.color}12` : "transparent", color: activeView === u.id ? u.color : T.ink, border: "none", borderLeft: `3px solid ${activeView === u.id ? u.color : "transparent"}`, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: activeView === u.id ? 700 : 400 }}>
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* DASHBOARD VIEW */}
          {activeView === "dashboard" && (
            <div style={{ background: T.white, borderRadius: "0 12px 12px 12px", border: `1px solid ${T.border}`, borderTop: "none", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
              <Dashboard config={config} allActuals={allActuals} counsellors={counsellors} getActual={getActual} getActualByCounsellor={getActualByCounsellor} T={T} />
            </div>
          )}

          {/* UNIVERSITY TABLE VIEW */}
          {activeView !== "dashboard" && (() => {
            const activeUniObj = config.find(u => u.id === activeView);
            if (!activeUniObj) return null;
            return (
              <div style={{ background: T.white, borderRadius: "0 12px 12px 12px", border: `1px solid ${T.border}`, borderTop: "none", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                {/* Panel toolbar */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFAFA", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {activeUniObj.hasTargets && subBtn("core", "Core Courses")}
                    {activeUniObj.hasTargets && subBtn("other", "Other Courses")}
                    {!activeUniObj.hasTargets && <span style={{ fontSize: 11, color: T.inkL, background: `${activeUniObj.color}15`, padding: "4px 10px", borderRadius: 99, fontWeight: 600, border: `1px solid ${activeUniObj.color}30` }}>{activeUniObj.campus1.label} Campus</span>}
                  </div>
                  <span style={{ fontSize: 11, color: T.inkL, background: `${activeUniObj.color}15`, padding: "4px 10px", borderRadius: 99, fontWeight: 600, border: `1px solid ${activeUniObj.color}30` }}>{activeUniObj.intakeLabel}</span>
                </div>
                {activeUniObj.hasTargets && subTab === "core" && (
                  <CourseTable uni={activeUniObj} allActuals={allActuals} onUpdate={handleActualsUpdate} editable={editable} counsellors={counsellors} getActualByCounsellor={getActualByCounsellor} setActualByCounsellor={setActualByCounsellor} setAllActuals={setAllActuals} scheduleSave={scheduleSave} />
                )}
                {activeUniObj.hasTargets && subTab === "other" && (
                  <OtherTable uni={activeUniObj} allActuals={allActuals} onUpdate={handleActualsUpdate} editable={editable} counsellors={counsellors} getActualByCounsellor={getActualByCounsellor} setActualByCounsellor={setActualByCounsellor} setAllActuals={setAllActuals} scheduleSave={scheduleSave} />
                )}
                {!activeUniObj.hasTargets && (
                  <OtherTable uni={{ ...activeUniObj, otherCourses: activeUniObj.coreCourses.map(c => typeof c === "string" ? c : c.name) }} allActuals={{ ...allActuals, [activeUniObj.id]: { other: allActuals[activeUniObj.id]?.core || {}, core: {} } }} onUpdate={newA => handleActualsUpdate({ ...allActuals, [activeUniObj.id]: { ...allActuals[activeUniObj.id], core: newA[activeUniObj.id]?.other || {} } })} editable={editable} counsellors={counsellors} getActualByCounsellor={getActualByCounsellor} setActualByCounsellor={setActualByCounsellor} setAllActuals={setAllActuals} scheduleSave={scheduleSave} />
                )}
              </div>
            );
          })()}

          <p style={{ margin: "16px 0 0", fontSize: 11, color: T.inkL, textAlign: "center" }}>
            Includes: Deposits · Sept 26 Deposits · Defer/Refund/Change Uni &nbsp;·&nbsp; Closed Lost excluded
          </p>
        </div>

        {/* ADD DEPOSIT MODAL */}
        {showAddDeposit && (() => {
          const selUni = config.find(u => u.id === depositForm.uniId);
          const courses = selUni ? [
            ...(selUni.coreCourses || []).map(c => ({ name: typeof c === "string" ? c : c.name, section: "core" })),
            ...(selUni.otherCourses || []).map(c => ({ name: c, section: "other" })),
          ] : [];
          const campuses = selUni ? [
            { key: selUni.campus1.key, label: selUni.campus1.label },
            ...(selUni.campus2 ? [{ key: selUni.campus2.key, label: selUni.campus2.label }] : []),
          ] : [];
          const isValid = depositForm.counsellor && depositForm.uniId && depositForm.courseName && depositForm.campusKey && depositForm.count >= 1;
          const sel = (field, value, extra = {}) => setDepositForm(p => ({ ...p, [field]: value, ...extra }));
          const selectStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: T.white, color: T.ink, outline: "none", cursor: "pointer" };
          const labelStyle = { fontSize: 11, fontWeight: 700, color: T.inkM, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5, display: "block" };

          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={e => e.target === e.currentTarget && setShowAddDeposit(false)}>
              <div style={{ background: T.white, borderRadius: 16, padding: "28px 32px", width: 480, boxShadow: "0 20px 60px rgba(0,0,0,.2)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: 0 }}>Add Deposit</p>
                    <p style={{ fontSize: 12, color: T.inkM, margin: "2px 0 0" }}>Record a new deposit against a counsellor and course</p>
                  </div>
                  <button onClick={() => setShowAddDeposit(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.inkL }}>✕</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Counsellor</label>
                    <select value={depositForm.counsellor} onChange={e => sel("counsellor", e.target.value)} style={selectStyle}>
                      <option value="">Select counsellor…</option>
                      {counsellors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>University</label>
                    <select value={depositForm.uniId} onChange={e => sel("uniId", e.target.value, { courseName: "", campusKey: "", section: "core" })} style={selectStyle}>
                      <option value="">Select university…</option>
                      {[...config].sort((a, b) => a.name.localeCompare(b.name)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>

                  {selUni && (
                    <div>
                      <label style={labelStyle}>Course</label>
                      <select value={depositForm.courseName} onChange={e => {
                        const found = courses.find(c => c.name === e.target.value);
                        sel("courseName", e.target.value, { section: found?.section || "core", campusKey: campuses.length === 1 ? campuses[0].key : "" });
                      }} style={selectStyle}>
                        <option value="">Select course…</option>
                        {courses.filter(c => c.section === "core").length > 0 && (
                          <optgroup label="Core Courses">
                            {courses.filter(c => c.section === "core").map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </optgroup>
                        )}
                        {courses.filter(c => c.section === "other").length > 0 && (
                          <optgroup label="Other Courses">
                            {courses.filter(c => c.section === "other").map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </optgroup>
                        )}
                        {courses.length === 0 && <option disabled>No courses set up yet</option>}
                      </select>
                    </div>
                  )}

                  {selUni && campuses.length > 1 && depositForm.courseName && (
                    <div>
                      <label style={labelStyle}>Campus</label>
                      <select value={depositForm.campusKey} onChange={e => sel("campusKey", e.target.value)} style={selectStyle}>
                        <option value="">Select campus…</option>
                        {campuses.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Deposits</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
                      <button onClick={() => sel("count", Math.max(1, depositForm.count - 1))}
                        style={{ padding: "8px 14px", background: T.bg, border: "none", cursor: "pointer", fontSize: 16, color: T.inkM, fontFamily: "inherit", borderRight: `1px solid ${T.border}` }}>−</button>
                      <span style={{ padding: "8px 20px", fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: "ui-monospace, monospace", minWidth: 48, textAlign: "center" }}>{depositForm.count}</span>
                      <button onClick={() => sel("count", depositForm.count + 1)}
                        style={{ padding: "8px 14px", background: T.bg, border: "none", cursor: "pointer", fontSize: 16, color: T.inkM, fontFamily: "inherit", borderLeft: `1px solid ${T.border}` }}>+</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                  <button onClick={() => setShowAddDeposit(false)}
                    style={{ padding: "10px 20px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: T.inkM }}>
                    Cancel
                  </button>
                  <button onClick={handleAddDeposit} disabled={!isValid}
                    style={{ padding: "10px 24px", background: isValid ? T.purple : T.border, color: T.white, border: "none", borderRadius: 8, cursor: isValid ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                    Save Deposit
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ADMIN PANEL */}
        {showAdmin && (
          <AdminPanel
            tab={adminTab} setTab={setAdminTab}
            config={config} setConfig={setConfig}
            counsellors={counsellors} setCounsellors={setCounsellors}
            allActuals={allActuals} setAllActuals={setAllActuals}
            scheduleSave={scheduleSave}
            onClose={() => setShowAdmin(false)}
          />
        )}

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
