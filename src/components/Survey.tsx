"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CONSENT_NO, CONSENT_YES, EMPTY_ANSWERS, EXCLUSIVE, GOVERNORATES, OPTIONS, OTHER, TEXT,
  type Answers,
} from "@/lib/questions";
import { normalizePhone, phoneOk } from "@/lib/phone";

type Step = "intro" | (typeof ORDER)[number];
const ORDER = [
  "profile", "region", "pain", "interests", "primary", "time", "format",
  "money", "intent", "barriers", "expect", "distance", "contact",
] as const;

const ERR_PICK = "اختار جواب باش تكمّل.";
const ERRORS: Record<string, string> = {
  rate_limited: "بعثت برشة محاولات في وقت قصير. استنى شوية وعاود جرّب.",
  invalid: "فما معلومة موش صحيحة. ارجع وراجع إجاباتك وعاود جرّب.",
  default: "صار مشكل في إرسال الإجابات، وما تسجّلتش. إجاباتك مازالت هنا، عاود جرّب.",
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const r = () => Math.random().toString(16).slice(2, 10);
  return `${r()}-${r()}-${r()}-${r()}`;
}

const clean = (v: string | null) => (v ?? "").replace(/[^A-Za-z0-9_\-. +]/g, "").slice(0, 60);

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="#062A1A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Choice(props: {
  options: readonly string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  max?: number;
}) {
  const { options, value, onChange, multi = false, max } = props;
  const sel = Array.isArray(value) ? value : value ? [value] : [];
  const full = multi && max !== undefined && sel.length >= max;

  const toggle = (o: string) => {
    if (!multi) return onChange(o);
    if (sel.includes(o)) return onChange(sel.filter((x) => x !== o));
    if (EXCLUSIVE.includes(o)) return onChange([o]);
    if (full) return;
    onChange([...sel.filter((x) => !EXCLUSIVE.includes(x)), o]);
  };

  return (
    <div role={multi ? "group" : "radiogroup"} className="grid gap-3">
      {options.map((o) => {
        const on = sel.includes(o);
        const off = full && !on;
        return (
          <button
            key={o}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            aria-disabled={off}
            onClick={() => toggle(o)}
            className={
              "flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start text-[17px] font-semibold leading-snug transition-colors " +
              (on
                ? "border-brand bg-brand/15 text-white"
                : off
                ? "border-line bg-panel text-mist/50"
                : "border-line bg-panel text-white active:bg-raise")
            }
          >
            <span
              className={
                "flex h-6 w-6 shrink-0 items-center justify-center border-2 " +
                (multi ? "rounded-md " : "rounded-full ") +
                (on ? "border-brand bg-brand" : "border-mist/50")
              }
            >
              {on && <Check />}
            </span>
            <span className="flex-1">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function Q(props: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-[22px] font-extrabold leading-snug">{props.title}</h2>
      {props.hint && <p className="mb-4 text-[15px] text-mist">{props.hint}</p>}
      {!props.hint && <div className="mb-4" />}
      {props.children}
    </section>
  );
}

function Wave() {
  const heights = [28, 52, 76, 40, 92, 60, 100, 44, 84, 56, 96, 36, 70, 48, 88, 32, 64, 80, 40, 56];
  return (
    <div className="flex h-24 items-center gap-[5px]" aria-hidden="true">
      {heights.map((h, i) => (
        <div key={i} className="bar w-[5px] rounded-full bg-brand" style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.13}s`, opacity: 0.45 + (h / 100) * 0.55 }} />
      ))}
    </div>
  );
}

export default function Survey() {
  const [step, setStep] = useState<Step>("intro");
  const [a, setA] = useState<Answers>(EMPTY_ANSWERS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [trap, setTrap] = useState("");
  const [submissionId] = useState(newId);
  const [track, setTrack] = useState({ source: "direct", medium: "", campaign: "" });
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setTrack({
      source: clean(p.get("utm_source") ?? p.get("source")) || "direct",
      medium: clean(p.get("utm_medium") ?? p.get("medium")),
      campaign: clean(p.get("utm_campaign") ?? p.get("campaign")),
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    top.current?.focus({ preventScroll: true });
  }, [step, done]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((p) => ({ ...p, [k]: v }));
    setError(null);
  };
  const pick = <K extends keyof Answers>(k: K) => (v: string | string[]) => set(k, v as Answers[K]);

  const visible = (id: (typeof ORDER)[number]) => id !== "primary" || a.interests.length > 1;
  const ids = ORDER.filter(visible);
  const idx = step === "intro" ? -1 : ids.indexOf(step);
  const pct = step === "intro" ? 0 : ((idx + 1) / ids.length) * 100;

  function validate(id: (typeof ORDER)[number]): string | null {
    switch (id) {
      case "profile": return a.role && a.experience ? null : "جاوب على السؤالين باش تكمّل.";
      case "region": return a.governorate ? null : "اختار الولاية باش تكمّل.";
      case "pain": return a.challenges.length >= 1 ? null : "اختار حاجة وحدة على الأقل (حتى 3).";
      case "interests": return a.interests.length >= 1 ? null : "اختار تكوين واحد على الأقل.";
      case "primary": return a.primary && a.interests.includes(a.primary) ? null : ERR_PICK;
      case "time": return a.days.length && a.hours.length ? null : "جاوب على السؤالين باش تكمّل.";
      case "format": return a.duration && a.format ? null : "جاوب على السؤالين باش تكمّل.";
      case "money": return a.budget && a.payer ? null : "جاوب على السؤالين باش تكمّل.";
      case "intent": return a.intent ? null : ERR_PICK;
      case "barriers": return a.barriers.length ? null : "اختار جواب واحد على الأقل.";
      case "expect": return a.expectations.length ? null : "اختار حاجة وحدة على الأقل (حتى 3).";
      case "distance": return a.distance ? null : ERR_PICK;
      case "contact":
        return phoneOk(normalizePhone(a.phone)) ? null : "رقم الهاتف موش صحيح. اكتبو بالأرقام (مثال: 98 123 456) وإلا خليه فارغ.";
    }
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const payload = {
      ...a,
      id: submissionId,
      primary: a.interests.length === 1 ? a.interests[0] : a.primary,
      phone: normalizePhone(a.phone),
      consent: a.consent || CONSENT_NO,
      ...track,
      website: trap,
    };
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j: { ok?: boolean; error?: string } | null = await res.json().catch(() => null);
      if (res.ok && j?.ok) setDone(true);
      else setError(ERRORS[j?.error ?? ""] ?? ERRORS.default);
    } catch {
      setError("ما فماش اتصال بالإنترنت. تأكد من الشبكة وعاود جرّب. إجاباتك مازالت هنا.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step === "intro") return setStep(ids[0]);
    const msg = validate(step);
    if (msg) return setError(msg);
    if (idx === ids.length - 1) return void submit();
    setError(null);
    setStep(ids[idx + 1]);
  }
  function back() {
    setError(null);
    setStep(idx <= 0 ? "intro" : ids[idx - 1]);
  }

  function screen(id: (typeof ORDER)[number]): ReactNode {
    switch (id) {
      case "profile":
        return (<>
          <Q title={TEXT.role}><Choice options={OPTIONS.role} value={a.role} onChange={pick("role")} /></Q>
          <Q title={TEXT.experience}><Choice options={OPTIONS.experience} value={a.experience} onChange={pick("experience")} /></Q>
        </>);
      case "region":
        return (
          <Q title={TEXT.governorate}>
            <select
              aria-label={TEXT.governorate}
              value={a.governorate}
              onChange={(e) => set("governorate", e.target.value)}
              className="min-h-[58px] w-full rounded-2xl border border-line bg-panel px-4 text-[17px] font-semibold text-white"
            >
              <option value="">اختار الولاية</option>
              {GOVERNORATES.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </Q>
        );
      case "pain":
        return (
          <Q title={TEXT.challenges} hint={`اختار حتى 3 (اخترت ${a.challenges.length})`}>
            <Choice multi max={3} options={OPTIONS.challenges} value={a.challenges} onChange={pick("challenges")} />
            {a.challenges.includes(OTHER) && (
              <input
                aria-label="اكتب الصعوبة"
                value={a.challengeOther}
                maxLength={200}
                onChange={(e) => set("challengeOther", e.target.value)}
                placeholder="اكتب الصعوبة (اختياري)"
                className="mt-3 min-h-[58px] w-full rounded-2xl border border-line bg-panel px-4 text-[17px] text-white placeholder:text-mist/60"
              />
            )}
          </Q>
        );
      case "interests":
        return (
          <Q title={TEXT.interests} hint="تنجم تختار أكثر من تكوين">
            <Choice multi options={OPTIONS.interests} value={a.interests} onChange={(v) => {
              const list = v as string[];
              setA((p) => ({ ...p, interests: list, primary: list.includes(p.primary) ? p.primary : "" }));
              setError(null);
            }} />
          </Q>
        );
      case "primary":
        return (
          <Q title={TEXT.primary}>
            <Choice options={a.interests} value={a.primary} onChange={pick("primary")} />
          </Q>
        );
      case "time":
        return (<>
          <Q title={TEXT.days} hint="تنجم تختار أكثر من يوم">
            <Choice multi options={OPTIONS.days} value={a.days} onChange={pick("days")} />
          </Q>
          <Q title={TEXT.hours} hint="تنجم تختار أكثر من توقيت">
            <Choice multi options={OPTIONS.hours} value={a.hours} onChange={pick("hours")} />
          </Q>
        </>);
      case "format":
        return (<>
          <Q title={TEXT.duration}><Choice options={OPTIONS.duration} value={a.duration} onChange={pick("duration")} /></Q>
          <Q title={TEXT.format}><Choice options={OPTIONS.format} value={a.format} onChange={pick("format")} /></Q>
        </>);
      case "money":
        return (<>
          <Q title={TEXT.budget}><Choice options={OPTIONS.budget} value={a.budget} onChange={pick("budget")} /></Q>
          <Q title={TEXT.payer}><Choice options={OPTIONS.payer} value={a.payer} onChange={pick("payer")} /></Q>
        </>);
      case "intent":
        return <Q title={TEXT.intent}><Choice options={OPTIONS.intent} value={a.intent} onChange={pick("intent")} /></Q>;
      case "barriers":
        return (
          <Q title={TEXT.barriers} hint="تنجم تختار أكثر من جواب">
            <Choice multi options={OPTIONS.barriers} value={a.barriers} onChange={pick("barriers")} />
          </Q>
        );
      case "expect":
        return (
          <Q title={TEXT.expectations} hint={`اختار حتى 3 (اخترت ${a.expectations.length})`}>
            <Choice multi max={3} options={OPTIONS.expectations} value={a.expectations} onChange={pick("expectations")} />
          </Q>
        );
      case "distance":
        return <Q title={TEXT.distance}><Choice options={OPTIONS.distance} value={a.distance} onChange={pick("distance")} /></Q>;
      case "contact":
        return (<>
          <Q title="تحب نعرفوك؟" hint="الاسم ورقم الهاتف اختياريين. تنجم تكمّل بدونهم.">
            <label className="mb-1 block text-[15px] font-semibold text-mist" htmlFor="nm">{TEXT.name}</label>
            <input id="nm" value={a.name} maxLength={80} autoComplete="name" onChange={(e) => set("name", e.target.value)}
              className="mb-4 min-h-[58px] w-full rounded-2xl border border-line bg-panel px-4 text-[17px] text-white" />
            <label className="mb-1 block text-[15px] font-semibold text-mist" htmlFor="ph">{TEXT.phone}</label>
            <input id="ph" dir="ltr" inputMode="tel" autoComplete="tel" maxLength={30} value={a.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="98 123 456"
              style={{ textAlign: "right" }}
              className="min-h-[58px] w-full rounded-2xl border border-line bg-panel px-4 text-[17px] text-white placeholder:text-mist/50" />
          </Q>
          <Q title={TEXT.consent}>
            <Choice options={[CONSENT_YES, CONSENT_NO]} value={a.consent} onChange={pick("consent")} />
            {a.consent === CONSENT_YES && !a.phone.trim() && (
              <p className="mt-3 text-[15px] text-mist">باش نتصلو بيك نحتاجو رقم هاتفك. تنجم تكتبو فوق.</p>
            )}
          </Q>
          <p className="mb-6 rounded-2xl border border-line bg-panel p-4 text-[14px] leading-relaxed text-mist">
            إجاباتك تتخزّن بطريقة خاصة، وتستعملها Synergia كان باش تحضّر تكوينات أحسن للميكانيكيين.
            الاسم والهاتف اختياريين، والاستبيان ما يتطلبش موافقة على الاتصال بيك. تنجم تطلب حذف إجاباتك في أي وقت من Synergia.
          </p>
        </>);
    }
  }

  const shell = "mx-auto w-full max-w-xl px-5";

  if (done) {
    const phone = normalizePhone(a.phone);
    const wantsCall = a.consent === CONSENT_YES;
    return (
      <main className="min-h-dvh">
        <div ref={top} tabIndex={-1} className={`${shell} flex min-h-dvh flex-col justify-center py-12 outline-none`}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand"><Check /></div>
          <h1 className="mb-3 text-[32px] font-extrabold leading-tight">
            {a.name.trim() ? `ميرسي ${a.name.trim()}` : "ميرسي برشة"}
          </h1>
          <p className="mb-3 text-[18px] leading-relaxed">
            إجاباتك تسجّلت. صوتك باش يساعدنا نختارو التكوينات الجاية ونوفروها بالسعر والتوقيت اللي يناسبوكم.
          </p>
          {wantsCall && phone && <p className="text-[16px] text-mist">باش نتصلو بيك على الرقم اللي كتبتو.</p>}
          {wantsCall && !phone && <p className="text-[16px] text-mist">ما كتبتش رقم هاتف، آمّا نقدرو نتصلو بيك كان بعد ما تبعثلنا رقمك.</p>}
          <p className="mt-10 text-[15px] font-semibold text-brand">Synergia Business Solutions</p>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="min-h-dvh">
        <div ref={top} tabIndex={-1} className={`${shell} flex min-h-dvh flex-col justify-center py-10 outline-none`}>
          <p className="mb-8 text-[17px] font-extrabold tracking-wide text-white">Synergia <span className="font-medium text-mist">Business Solutions</span></p>
          <Wave />
          <h1 className="mb-4 mt-8 text-[44px] font-extrabold leading-[1.15]">صوت الميكانيكي</h1>
          <p className="mb-3 text-[22px] font-bold leading-snug">خلّي صوتك يساهم في تكوينات Synergia الجاية.</p>
          <p className="mb-8 text-[17px] leading-relaxed text-mist">نسألوك على خدمتك، الصعوبات اللي تواجهك، والتكوينات اللي تحب تعملهم.</p>
          <p className="mb-6 text-[15px] text-mist">يستغرق 3 إلى 4 دقايق. بدون تسجيل دخول.</p>
          <button type="button" onClick={next} className="min-h-[60px] w-full rounded-2xl bg-brand text-[19px] font-extrabold text-brandInk active:opacity-90">
            ابدا الاستبيان
          </button>
        </div>
      </main>
    );
  }

  const last = idx === ids.length - 1;
  return (
    <main className="min-h-dvh pb-40">
      <header className="sticky top-0 z-10 border-b border-line bg-navy/95 backdrop-blur">
        <div className={`${shell} flex items-center justify-between py-3`}>
          <span className="text-[16px] font-extrabold">Synergia</span>
          <span className="text-[14px] font-semibold text-mist" aria-live="polite">{idx + 1} / {ids.length}</span>
        </div>
        <div className="h-1 w-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="تقدّم الاستبيان">
          <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${pct}%`, marginInlineStart: 0 }} />
        </div>
      </header>

      <div ref={top} tabIndex={-1} className={`${shell} pt-8 outline-none`}>
        {screen(step)}
        {/* Honeypot: hidden from people, visible to bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-navy/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className={`${shell} py-3`}>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-warn/10 px-3 py-2 text-[15px] font-semibold text-warn">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={back} disabled={busy}
              className="min-h-[56px] rounded-2xl border border-line px-6 text-[17px] font-bold text-white disabled:opacity-40">
              رجوع
            </button>
            <button type="button" onClick={next} disabled={busy}
              className="min-h-[56px] flex-1 rounded-2xl bg-brand text-[18px] font-extrabold text-brandInk disabled:opacity-60">
              {busy ? "نبعثو في الإجابات..." : last ? (error ? "عاود جرّب" : "ابعث الإجابات") : "كمّل"}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
