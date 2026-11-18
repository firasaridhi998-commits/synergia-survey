const AR = "٠١٢٣٤٥٦٧٨٩";
const FA = "۰۱۲۳۴۵۶۷۸۹";

/** Converts Arabic digits to 0-9 and removes spaces, dots, dashes and brackets. */
export function normalizePhone(value: string): string {
  let s = value
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)));
  s = s.replace(/[\s().\-]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  return s;
}

/** Empty is allowed (phone is optional). Otherwise 8-15 digits, optional leading +. */
export function phoneOk(s: string): boolean {
  return s === "" || /^\+?\d{8,15}$/.test(s);
}
