"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CONSENT_NO, CONSENT_YES, EMPTY_ANSWERS, EXCLUSIVE, GOVERNORATES, OPTIONS, OTHER,
  type Answers,
} from "@/lib/questions";
import { BTN, ERR, GOV_FR, HINT, Q, label, type Bi } from "@/lib/bilingual";
import { normalizePhone, phoneOk } from "@/lib/phone";

const ORDER = [
  "profile", "region", "pain", "interests", "primary", "time", "format",
  "money", "intent", "barriers", "expect", "distance", "contact",
] as const;
type Id = (typeof ORDER)[number];
type Step = "intro" | Id;

/* Photo plan: only some screens carry a photo, the rest stay clean for readability. */
const PHOTO: Partial<Record<Id, { name: string; alt: Bi }>> = {
  profile: { name: "profile", alt: { fr: "Stagiaires démontant une boîte de vitesses devant un écran de cours", ar: "متكوّنين يفكّو في بوات قدام شاشة الدرس" } },
  pain: { name: "pain", alt: { fr: "Pièces d'une boîte de vitesses démontée", ar: "قطع بوات مفكّكة" } },
  interests: { name: "interests", alt: { fr: "Mains sur un ensemble poulie-courroie de boîte automatique", ar: "أيدي تخدم على قطع بوات أوتوماتيك" } },
  format: { name: "format", alt: { fr: "Formateur Synergia en salle de cours", ar: "مدرّب Synergia في قاعة التكوين" } },
  expect: { name: "expect", alt: { fr: "Pièces de boîte automatique, fiche technique et ordinateur de diagnostic", ar: "قطع بوات أوتوماتيك وورقة تقنية و Diagnostic على الكمبيوتر" } },
};
const ALL_PHOTOS = [...Object.values(PHOTO).map((p) => p!.name), "thanks"];

const NAME_Q: Bi = { fr: "Nom et prénom", ar: "الاسم واللقب" };
const PHONE_Q: Bi = { fr: "Téléphone / WhatsApp", ar: "رقم الهاتف / WhatsApp" };

const GOV_SORTED = [...GOVERNORATES].sort((a, b) =>
  GOV_FR[a].replace(/^(Le|La) /, "").localeCompare(GOV_FR[b].replace(/^(Le|La) /, ""), "fr"),
);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const r = () => Math.random().toString(16).slice(2, 10).padEnd(8, "0");
  return `${r()}-${r()}-${r()}-${r()}`;
}
const clean = (v: string | null) => (v ?? "").replace(/[^A-Za-z0-9_\-. +]/g, "").slice(0, 60);

/* ---------- small building blocks (each language in its own direction-aware element) ---------- */

function Fr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span lang="fr" dir="ltr" className={className}>{children}</span>;
}
function Ar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span lang="ar" dir="rtl" className={className}>{children}</span>;
}

function Logo({ white = false, className = "" }: { white?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={white ? "/brand/synergia-logo-white.png" : "/brand/synergia-logo.png"}
      width={white ? 635 : 2190}
      height={white ? 161 : 553}
      alt="Synergia Business Solution"
      className={className}
    />
  );
}

function Photo({ name, alt, className = "" }: { name: string; alt: Bi; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/img/${name}-1120.webp`}
      srcSet={`/img/${name}-560.webp 560w, /img/${name}-1120.webp 1120w`}
      sizes="(max-width: 576px) 100vw, 536px"
      width={1120}
      height={700}
      alt={`${alt.fr} / ${alt.ar}`}
      loading="lazy"
      decoding="async"
      className={`aspect-[16/10] w-full object-cover ${className}`}
    />
  );
}

function Check({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QBlock(props: { q: Bi; hint?: Bi; count?: string; children: ReactNode }) {
  const { q, hint, count, children } = props;
  return (
    <section className="mb-9">
      <h2>
        <Fr className="block text-[22px] font-bold leading-snug text-ink">{q.fr}</Fr>
        <Ar className="mt-1.5 block text-[19px] font-medium leading-snug text-tealDeep">{q.ar}</Ar>
      </h2>
      {hint ? (
        <p className="mb-4 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[14px] text-slate">
          {count && (
            <span dir="ltr" className="rounded-full bg-teal px-2.5 py-0.5 text-[12px] font-bold text-white">{count}</span>
          )}
          <Fr>{hint.fr}</Fr>
          <Ar className="ml-auto">{hint.ar}</Ar>
        </p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </section>
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
    <div role={multi ? "group" : "radiogroup"} className="grid gap-2.5">
      {options.map((o) => {
        const on = sel.includes(o);
        const off = full && !on;
        const b = label(o);
        return (
          <button
            key={o}
            type="button"
            dir="ltr"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            aria-disabled={off}
            onClick={() => toggle(o)}
            className={
              "flex min-h-[60px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[transform,background-color,border-color] duration-150 active:scale-[0.985] " +
              (on
                ? "border-teal bg-[#E6F4F5]"
                : off
                ? "border-line bg-white opacity-45"
                : "border-line bg-white [@media(hover:hover)]:hover:border-teal/60")
            }
          >
            <span
              className={
                "flex h-6 w-6 shrink-0 items-center justify-center border-2 " +
                (multi ? "rounded-md " : "rounded-full ") +
                (on ? "border-teal bg-teal" : "border-slate/40 bg-white")
              }
            >
              {on && <span className="pop flex"><Check /></span>}
            </span>
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">
              <Fr className="text-[16px] font-semibold leading-snug text-ink">{b.fr}</Fr>
              <Ar className={"ml-auto text-[15px] leading-snug " + (on ? "text-tealDeep" : "text-slate")}>{b.ar}</Ar>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const inputCls =
  "min-h-[58px] w-full rounded-2xl border-2 border-line bg-white px-4 text-[17px] text-ink placeholder:text-slate/60 focus:border-teal";
const keyboardScroll = (e: { currentTarget: HTMLElement }) => {
  const el = e.currentTarget;
  window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
};

function Wave() {
  const hs = [30, 55, 80, 45, 95, 62, 100, 48, 86, 58, 92, 40, 72, 50, 88, 34];
  return (
    <div className="flex h-9 items-center gap-[4px]" aria-hidden="true">
      {hs.map((h, i) => (
        <span
          key={i}
          className="wave-bar w-[4px] rounded-full"
          style={{ height: `${h}%`, background: i % 5 === 2 ? "#DC842C" : "#1898A0", animationDelay: `${(i % 6) * 0.14}s` }}
        />
      ))}
    </div>
  );
}

/* ---------- main component ---------- */

export default function Survey() {
  const [step, setStep] = useState<Step>("intro");
  const [a, setA] = useState<Answers>(EMPTY_ANSWERS);
  const [error, setError] = useState<Bi | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [trap, setTrap] = useState("");
  const [submissionId] = useState(newId);
  const [track, setTrack] = useState({ source: "direct", medium: "", campaign: "" });
  const top = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setTrack({
      source: clean(p.get("utm_source") ?? p.get("source")) || "direct",
      medium: clean(p.get("utm_medium") ?? p.get("medium")),
      campaign: clean(p.get("utm_campaign") ?? p.get("campaign")),
    });
  }, []);

  // Warm the photo cache once the respondent has started, so screens never pop in late.
  useEffect(() => {
    if (step === "intro") return;
    const run = () =>
      ALL_PHOTOS.forEach((n) => {
        const im = new Image();
        im.sizes = "(max-width: 576px) 100vw, 536px";
        im.srcset = `/img/${n}-560.webp 560w, /img/${n}-1120.webp 1120w`;
        im.src = `/img/${n}-560.webp`;
      });
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else window.setTimeout(run, 400);
  }, [step === "intro"]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo({ top: 0 });
    top.current?.focus({ preventScroll: true });
  }, [step, done]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((p) => ({ ...p, [k]: v }));
    setError(null);
  };
  const pick = <K extends keyof Answers>(k: K) => (v: string | string[]) => set(k, v as Answers[K]);

  const visible = (id: Id) => id !== "primary" || a.interests.length > 1;
  const ids = ORDER.filter(visible);
  const idx = step === "intro" ? -1 : ids.indexOf(step);
  const pct = step === "intro" ? 0 : ((idx + 1) / ids.length) * 100;

  function validate(id: Id): Bi | null {
    switch (id) {
      case "profile": return a.role && a.experience ? null : ERR.both;
      case "region": return a.governorate ? null : ERR.gov;
      case "pain": return a.challenges.length >= 1 ? null : ERR.atLeastOne;
      case "interests": return a.interests.length >= 1 ? null : ERR.atLeastOne;
      case "primary": return a.primary && a.interests.includes(a.primary) ? null : ERR.pick;
      case "time": return a.days.length && a.hours.length ? null : ERR.both;
      case "format": return a.duration && a.format ? null : ERR.both;
      case "money": return a.payer ? null : ERR.pick;
      case "intent": return a.intent ? null : ERR.pick;
      case "barriers": return a.barriers.length ? null : ERR.atLeastOne;
      case "expect": return a.expectations.length ? null : ERR.atLeastOne;
      case "distance": return a.distance ? null : ERR.pick;
      case "contact": return phoneOk(normalizePhone(a.phone)) ? null : ERR.phone;
    }
  }

  async function submit() {
    if (sending.current) return; // blocks double taps before state has updated
    sending.current = true;
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
      else setError(j?.error === "rate_limited" ? ERR.rate : j?.error === "invalid" ? ERR.invalid : ERR.failed);
    } catch {
      setError(ERR.offline);
    } finally {
      setBusy(false);
      sending.current = false;
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
    if (busy) return;
    setError(null);
    setStep(idx <= 0 ? "intro" : ids[idx - 1]);
  }

  function screen(id: Id): ReactNode {
    switch (id) {
      case "profile":
        return (<>
          <QBlock q={Q.role}><Choice options={OPTIONS.role} value={a.role} onChange={pick("role")} /></QBlock>
          <QBlock q={Q.experience}><Choice options={OPTIONS.experience} value={a.experience} onChange={pick("experience")} /></QBlock>
        </>);
      case "region":
        return (
          <QBlock q={Q.governorate}>
            <div className="relative">
              <select
                aria-label={`${Q.governorate.fr} / ${Q.governorate.ar}`}
                dir="ltr"
                value={a.governorate}
                onChange={(e) => set("governorate", e.target.value)}
                className={
                  "min-h-[60px] w-full appearance-none rounded-2xl border-2 bg-white pl-4 pr-12 text-[17px] font-semibold text-ink " +
                  (a.governorate ? "border-teal" : "border-line")
                }
              >
                <option value="">{HINT.chooseGov.fr} · {HINT.chooseGov.ar}</option>
                {GOV_SORTED.map((g) => (<option key={g} value={g}>{GOV_FR[g]} · {g}</option>))}
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 8l5 5 5-5" fill="none" stroke="#52677A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </QBlock>
        );
      case "pain":
        return (
          <QBlock q={Q.challenges} hint={HINT.max3} count={`${a.challenges.length}/3`}>
            <Choice multi max={3} options={OPTIONS.challenges} value={a.challenges} onChange={pick("challenges")} />
            {a.challenges.includes(OTHER) && (
              <input
                aria-label={`${HINT.otherPlaceholder.fr} / ${HINT.otherPlaceholder.ar}`}
                dir="auto"
                value={a.challengeOther}
                maxLength={200}
                onFocus={keyboardScroll}
                onChange={(e) => set("challengeOther", e.target.value)}
                placeholder={`${HINT.otherPlaceholder.fr} · ${HINT.otherPlaceholder.ar}`}
                className={`mt-3 ${inputCls}`}
              />
            )}
          </QBlock>
        );
      case "interests":
        return (
          <QBlock q={Q.interests} hint={HINT.several}>
            <Choice multi options={OPTIONS.interests} value={a.interests} onChange={(v) => {
              const list = v as string[];
              setA((p) => ({ ...p, interests: list, primary: list.includes(p.primary) ? p.primary : "" }));
              setError(null);
            }} />
          </QBlock>
        );
      case "primary":
        return <QBlock q={Q.primary}><Choice options={a.interests} value={a.primary} onChange={pick("primary")} /></QBlock>;
      case "time":
        return (<>
          <QBlock q={Q.days} hint={HINT.several}><Choice multi options={OPTIONS.days} value={a.days} onChange={pick("days")} /></QBlock>
          <QBlock q={Q.hours} hint={HINT.several}><Choice multi options={OPTIONS.hours} value={a.hours} onChange={pick("hours")} /></QBlock>
        </>);
      case "format":
        return (<>
          <QBlock q={Q.duration}><Choice options={OPTIONS.duration} value={a.duration} onChange={pick("duration")} /></QBlock>
          <QBlock q={Q.format}><Choice options={OPTIONS.format} value={a.format} onChange={pick("format")} /></QBlock>
        </>);
      case "money":
        return (<>
          <QBlock q={Q.payer}><Choice options={OPTIONS.payer} value={a.payer} onChange={pick("payer")} /></QBlock>
        </>);
      case "intent":
        return <QBlock q={Q.intent}><Choice options={OPTIONS.intent} value={a.intent} onChange={pick("intent")} /></QBlock>;
      case "barriers":
        return (
          <QBlock q={Q.barriers} hint={HINT.several}>
            <Choice multi options={OPTIONS.barriers} value={a.barriers} onChange={pick("barriers")} />
          </QBlock>
        );
      case "expect":
        return (
          <QBlock q={Q.expectations} hint={HINT.max3} count={`${a.expectations.length}/3`}>
            <Choice multi max={3} options={OPTIONS.expectations} value={a.expectations} onChange={pick("expectations")} />
          </QBlock>
        );
      case "distance":
        return <QBlock q={Q.distance}><Choice options={OPTIONS.distance} value={a.distance} onChange={pick("distance")} /></QBlock>;
      case "contact":
        return (<>
          <QBlock q={Q.contactTitle} hint={HINT.optional}>
            <label htmlFor="nm" className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px] font-semibold text-slate">
              <Fr>{NAME_Q.fr}</Fr><Ar>{NAME_Q.ar}</Ar>
            </label>
            <input id="nm" dir="auto" value={a.name} maxLength={80} autoComplete="name" onFocus={keyboardScroll}
              onChange={(e) => set("name", e.target.value)} className={`mb-4 ${inputCls}`} />
            <label htmlFor="ph" className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px] font-semibold text-slate">
              <Fr>{PHONE_Q.fr}</Fr><Ar>{PHONE_Q.ar}</Ar>
            </label>
            <input id="ph" dir="ltr" inputMode="tel" autoComplete="tel" maxLength={30} value={a.phone} onFocus={keyboardScroll}
              onChange={(e) => set("phone", e.target.value)} placeholder="98 123 456" className={inputCls} />
          </QBlock>
          <QBlock q={Q.consent}>
            <Choice options={[CONSENT_YES, CONSENT_NO]} value={a.consent} onChange={pick("consent")} />
            {a.consent === CONSENT_YES && !a.phone.trim() && (
              <p className="mt-3 text-[14px] text-slate">
                <Fr className="block">{HINT.needPhone.fr}</Fr>
                <Ar className="mt-0.5 block">{HINT.needPhone.ar}</Ar>
              </p>
            )}
          </QBlock>
          <div className="mb-6 rounded-2xl border border-line bg-white p-4 text-[13.5px] leading-relaxed text-slate">
            <Fr className="block">
              Vos réponses sont stockées de façon privée et utilisées par Synergia uniquement pour préparer de meilleures formations.
              Le nom et le téléphone sont facultatifs et l&apos;enquête n&apos;exige aucun consentement à être contacté.
              Vous pouvez demander la suppression de vos réponses à tout moment auprès de Synergia.
            </Fr>
            <Ar className="mt-2 block">
              إجاباتك تتخزّن بطريقة خاصة، وتستعملها Synergia كان باش تحضّر تكوينات أحسن للميكانيكيين.
              الاسم والهاتف اختياريين، والاستبيان ما يتطلبش موافقة على الاتصال بيك.
              تنجم تطلب حذف إجاباتك في أي وقت من Synergia.
            </Ar>
          </div>
        </>);
    }
  }

  /* ----- completion screen ----- */
  if (done) {
    const phone = normalizePhone(a.phone);
    const wantsCall = a.consent === CONSENT_YES;
    const nm = a.name.trim();
    return (
      <main className="min-h-dvh bg-ink text-white">
        <div ref={top} tabIndex={-1} className="screen-in mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] outline-none">
          <Logo white className="h-9 w-auto self-start" />
          <div className="my-auto py-8">
            <Photo name="thanks" alt={{ fr: "Accueil Synergia avec les certificats de formation", ar: "مدخل Synergia مع شهادات التكوين" }} className="mb-7 rounded-3xl" />
            <svg width="64" height="64" viewBox="0 0 64 64" className="mb-5" aria-hidden="true">
              <circle cx="32" cy="32" r="29" fill="none" stroke="#1898A0" strokeWidth="4" className="draw-ring" />
              <path d="M19 33l9 9 17-19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
            </svg>
            <h1>
              <Fr className="block text-[30px] font-bold leading-tight">{nm ? `Merci ${nm} !` : "Merci beaucoup !"}</Fr>
              <Ar className="mt-1 block text-[26px] font-semibold leading-tight">{nm ? `ميرسي ${nm}` : "ميرسي برشة"}</Ar>
            </h1>
            <p className="mt-5 text-[16.5px] leading-relaxed">
              <Fr className="block">Vos réponses sont enregistrées. Votre voix nous aide à choisir les prochaines formations, au bon prix et au bon moment.</Fr>
              <Ar className="mt-2 block text-white/90">إجاباتك تسجّلت. صوتك باش يساعدنا نختارو التكوينات الجاية ونوفروها بالسعر والتوقيت اللي يناسبوكم.</Ar>
            </p>
            {wantsCall && (
              <p className="mt-4 text-[15px] leading-relaxed text-white/80">
                {phone ? (<>
                  <Fr className="block">Nous vous appellerons sur le numéro indiqué.</Fr>
                  <Ar className="mt-1 block">باش نتصلو بيك على الرقم اللي كتبتو.</Ar>
                </>) : (<>
                  <Fr className="block">Vous n&apos;avez pas indiqué de numéro : nous ne pourrons pas vous appeler.</Fr>
                  <Ar className="mt-1 block">ما كتبتش رقم هاتف، موش باش نقدرو نتصلو بيك.</Ar>
                </>)}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ----- welcome screen ----- */
  if (step === "intro") {
    return (
      <main className="relative min-h-dvh bg-deep text-white md:grid md:grid-cols-2">
        <div className="absolute inset-0 md:static md:order-2 md:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/hero-1080.webp"
            srcSet="/img/hero-640.webp 640w, /img/hero-1080.webp 1080w"
            sizes="(max-width: 767px) 100vw, 50vw"
            width={1080}
            height={1440}
            alt="Boîte de vitesses automatique en cours de démontage pendant une formation Synergia / بوات أوتوماتيك قاعدين يفكّو فيها في تكوين Synergia"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 40%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 via-[42%] to-deep/5 md:hidden" />
        </div>
        <div ref={top} tabIndex={-1} className="screen-in relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] outline-none md:order-1 md:max-w-none md:justify-center md:px-14">
          <Logo white className="h-10 w-auto self-start md:mb-10" />
          <div className="mt-auto md:mt-0">
            <Wave />
            <h1 className="mt-3">
              <Fr className="block text-[30px] font-bold leading-[1.1] min-[380px]:text-[34px]">La Voix du Mécanicien</Fr>
              <Ar className="mt-1 block text-[30px] font-bold leading-[1.15] min-[380px]:text-[34px]">صوت الميكانيكي</Ar>
            </h1>
            <p className="mt-3">
              <Fr className="block text-[17px] font-medium leading-snug">Faites entendre votre voix pour les prochaines formations Synergia.</Fr>
              <Ar className="mt-1 block text-[17px] font-medium leading-snug">خلّي صوتك يساهم في تكوينات Synergia الجاية.</Ar>
            </p>
            <p className="mt-3 text-[13.5px] leading-snug text-white/85 [@media(max-height:600px)]:hidden">
              <Fr className="block">Vos réponses aident Synergia à comprendre vos vrais besoins et à préparer les prochaines formations.</Fr>
              <Ar className="mt-1 block">إجاباتك تعاونّا نفهمو شنوة تحتاجو فعلاً ونحضّرو التكوينات الجاية.</Ar>
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-[12.5px] text-white/90">
              <li className="rounded-full border border-white/25 px-3 py-1"><Fr>3 à 4 min</Fr> · <Ar>3 إلى 4 دقايق</Ar></li>
              <li className="rounded-full border border-white/25 px-3 py-1"><Fr>Réponses privées</Fr> · <Ar>إجاباتك خاصة</Ar></li>
            </ul>
            <button
              type="button"
              onClick={next}
              className="mt-5 flex min-h-[62px] w-full flex-col items-center justify-center rounded-2xl bg-orange text-ink transition-transform active:scale-[0.985] md:max-w-sm"
            >
              <Fr className="text-[18px] font-bold leading-tight">{BTN.start.fr}</Fr>
              <Ar className="text-[15px] font-semibold leading-tight">{BTN.start.ar}</Ar>
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ----- question screens ----- */
  const last = idx === ids.length - 1;
  const photo = PHOTO[step];
  const nextLabel = busy ? BTN.sending : last ? (error ? BTN.retry : BTN.send) : BTN.next;
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-5 py-3">
          <Logo className="h-7 w-auto" />
          <span dir="ltr" className="text-[14px] font-semibold tabular-nums text-slate" aria-label={`Question ${idx + 1} sur ${ids.length} / السؤال ${idx + 1} من ${ids.length}`}>
            {idx + 1} / {ids.length}
          </span>
        </div>
        <div className="h-1.5 w-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progression / تقدّم الاستبيان">
          <div className="h-full rounded-r-full bg-teal transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div ref={top} tabIndex={-1} className="mx-auto w-full max-w-xl flex-1 px-5 pb-6 pt-6 outline-none">
        <div key={step} className="screen-in">
          {photo && <Photo name={photo.name} alt={photo.alt} className="mb-7 rounded-3xl" />}
          {screen(step)}
        </div>
        {/* Honeypot: hidden from people, visible to bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
        </div>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-xl px-5 py-3">
          {error && (
            <div role="alert" className="mb-3 rounded-2xl border border-warn/30 bg-warn/5 px-4 py-2.5 text-[14px] leading-snug text-warn">
              <Fr className="block font-semibold">{error.fr}</Fr>
              <Ar className="mt-0.5 block">{error.ar}</Ar>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={back} disabled={busy}
              className="flex min-h-[60px] w-[32%] flex-col items-center justify-center rounded-2xl border-2 border-line bg-white text-ink transition-transform active:scale-[0.97] disabled:opacity-40">
              <Fr className="text-[15px] font-semibold leading-tight">{BTN.back.fr}</Fr>
              <Ar className="text-[14px] leading-tight text-slate">{BTN.back.ar}</Ar>
            </button>
            <button type="button" onClick={next} disabled={busy}
              className="flex min-h-[60px] flex-1 flex-col items-center justify-center rounded-2xl bg-orange text-ink transition-transform active:scale-[0.985] disabled:opacity-70">
              <Fr className="text-[17px] font-bold leading-tight">{nextLabel.fr}</Fr>
              <Ar className="text-[14.5px] font-semibold leading-tight">{nextLabel.ar}</Ar>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
