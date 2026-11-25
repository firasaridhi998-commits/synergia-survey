export const OTHER = "أخرى";

export const GOVERNORATES = [
  "أريانة", "باجة", "بن عروس", "بنزرت", "قابس", "قفصة", "جندوبة", "القيروان",
  "القصرين", "قبلي", "الكاف", "المهدية", "منوبة", "مدنين", "المنستير", "نابل",
  "صفاقس", "سيدي بوزيد", "سليانة", "سوسة", "تطاوين", "توزر", "تونس", "زغوان",
] as const;

export const OPTIONS = {
  role: ["ميكانيكي", "تقني Diagnostic", "كهربائي سيارات", "صاحب Garage", "ميكانيكي نخدم وحدي", "متربص / طالب في الميكانيك", "خدمة أخرى"],
  experience: ["أقل من عام", "1–2 سنين", "3–5 سنين", "6–10 سنين", "أكثر من 10 سنين"],
  challenges: ["Diagnostic متاع الأعطال", "Boîte Automatique", "Électricité و Électronique", "سيارات Hybrid و Électrique", "Schémas électriques", "تحديد العطب الحقيقي", "تقنيات جديدة في الميكانيك", "أخرى"],
  interests: ["Boîtes Automatiques", "Diagnostic Automobile", "Véhicules Électriques", "Véhicules Hybrides", "Électricité Automobile", "Injection Électronique", "Climatisation Automobile", "Moteurs Thermiques", "أخرى"],
  days: ["وسط الأسبوع", "السبت", "الأحد", "Flexible"],
  hours: ["الصباح (08:00–12:00)", "بعد الظهر (13:00–17:00)", "العشية (17:00–20:00)"],
  duration: ["نهار واحد", "يومين", "3–5 أيام", "حصص موزعة على عدة أسابيع"],
  format: ["تطبيق عملي على سيارات حقيقية", "Théorie + Pratique", "Bootcamp مكثّف"],
  payer: ["أنا", "Garage / الشركة", "نتقاسموا المصاريف", "مازلت ما قررتش"],
  intent: ["أكيد نحب نسجّل", "ممكن نسجّل", "نحب نعرف تفاصيل أكثر", "موش مهتم حالياً"],
  barriers: ["الخدمة ما تخلّينيش نفرغ", "الأسعار غالية", "المركز بعيد عليّا", "ما نجمش نسكّر الـ Garage", "التكوين نظري برشة", "صعوبة إيجاد تكوين باهي", "ما عنديش مانع"],
  expectations: ["تطبيق عملي على سيارات حقيقية", "معدات Diagnostic", "مدرّب عندو خبرة", "شهادة", "مجموعات صغيرة", "متابعة بعد التكوين"],
  distance: ["نفس المنطقة", "أقل من 30 كم", "30–60 كم", "أكثر من 60 كم", "أي ولاية إذا التكوين يستحق"],
} as const;

/** Choosing one of these clears the other choices in the same question. */
export const EXCLUSIVE: string[] = ["Flexible", "ما عنديش مانع"];

export const CONSENT_YES = "إي، نحب Synergia تتصل بيا.";
export const CONSENT_NO = "لا، نحب نشارك في الاستبيان فقط.";

export const TEXT = {
  role: "شنوة خدمتك؟",
  experience: "قدّاش عندك تخدم في المجال؟",
  governorate: "في أنهي ولاية تخدم؟",
  challenges: "شنوة أكثر حاجات تقلقك في خدمتك اليومية؟",
  interests: "شنوة التكوينات اللي تحب Synergia توفّرهملك؟",
  primary: "من بين التكوينات اللي اخترتهم، شنوة أكثر تكوين تحب تعملو؟",
  days: "شنوة الأيام اللي تناسبك؟",
  hours: "شنوة التوقيت اللي يناسبك؟",
  duration: "قدّاش تحب تكون مدة التكوين؟",
  format: "كيفاش تحب يكون التكوين؟",
  payer: "شكون يخلّص مصاريف التكوين؟",
  intent: "كان التكوين اللي تحب عليه متوفّر بالسعر والتوقيت المناسبين، قداش احتمال تسجّل؟",
  barriers: "شنوة أكثر حاجة تمنعك باش تعمل تكوين؟",
  expectations: "شنوة أهم حاجة تحب تلقاها في التكوين؟",
  distance: "قدّاش تنجم تبعد على الـ Garage باش تعمل تكوين؟",
  name: "الاسم واللقب",
  phone: "رقم الهاتف / WhatsApp",
  consent: "تحب Synergia تتصل بيك؟",
} as const;

export type Answers = {
  role: string;
  experience: string;
  governorate: string;
  challenges: string[];
  challengeOther: string;
  interests: string[];
  primary: string;
  days: string[];
  hours: string[];
  duration: string;
  format: string;
  payer: string;
  intent: string;
  barriers: string[];
  expectations: string[];
  distance: string;
  name: string;
  phone: string;
  consent: string;
};

export const EMPTY_ANSWERS: Answers = {
  role: "", experience: "", governorate: "", challenges: [], challengeOther: "",
  interests: [], primary: "", days: [], hours: [], duration: "", format: "",
  payer: "", intent: "", barriers: [], expectations: [],
  distance: "", name: "", phone: "", consent: "",
};
