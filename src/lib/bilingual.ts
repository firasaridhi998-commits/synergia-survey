/**
 * French + Tunisian Arabic presentation layer.
 * The STORED value of every answer stays the canonical string from questions.ts
 * (that is what reaches Google Sheets). Only what the respondent SEES is defined here.
 */
export type Bi = { fr: string; ar: string };

export const Q: Record<string, Bi> = {
  role: { fr: "Quel est votre métier ?", ar: "شنوة خدمتك؟" },
  experience: { fr: "Depuis combien de temps travaillez-vous dans le domaine ?", ar: "قدّاش عندك تخدم في المجال؟" },
  governorate: { fr: "Dans quel gouvernorat travaillez-vous ?", ar: "في أنهي ولاية تخدم؟" },
  challenges: { fr: "Quelles sont les pannes qui vous dérangent le plus et que vous refusez ?", ar: "شنية أكثر حاجة تقلق منها كي تجيك للقاراج و ما تحبش تقبلها ؟" },
  interests: { fr: "Quelles formations aimeriez-vous que Synergia propose ?", ar: "شنوة التكوينات اللي تحب Synergia توفّرهملك؟" },
  primary: { fr: "Parmi vos choix, laquelle aimeriez-vous suivre en priorité ?", ar: "من بين التكوينات اللي اخترتهم، شنوة أكثر تكوين تحب تعملو؟" },
  days: { fr: "Quels jours vous conviennent ?", ar: "شنوة الأيام اللي تناسبك؟" },
  hours: { fr: "Quel horaire vous convient ?", ar: "شنوة التوقيت اللي يناسبك؟" },
  duration: { fr: "Quelle durée de formation préférez-vous ?", ar: "قدّاش تحب تكون مدة التكوين؟" },
  format: { fr: "Comment souhaitez-vous que la formation se déroule ?", ar: "كيفاش تحب يكون التكوين؟" },
  payer: { fr: "Qui prend en charge les frais de formation ?", ar: "شكون يخلّص مصاريف التكوين؟" },
  intent: { fr: "Si la formation était proposée au bon prix et au bon moment, quelle est la probabilité que vous vous inscriviez ?", ar: "كان التكوين اللي تحب عليه متوفّر بالسعر والتوقيت المناسبين، قداش احتمال تسجّل؟" },
  barriers: { fr: "Qu'est-ce qui vous empêche le plus de suivre une formation ?", ar: "شنوة أكثر حاجة تمنعك باش تعمل تكوين؟" },
  expectations: { fr: "Qu'attendez-vous le plus d'une formation ?", ar: "شنوة أهم حاجة تحب تلقاها في التكوين؟" },
  distance: { fr: "À quelle distance de votre garage seriez-vous prêt à vous déplacer ?", ar: "قدّاش تنجم تبعد على الـ Garage باش تعمل تكوين؟" },
  contactTitle: { fr: "Souhaitez-vous qu'on fasse connaissance ?", ar: "تحب نعرفوك؟" },
  consent: { fr: "Souhaitez-vous que Synergia vous contacte ?", ar: "تحب Synergia تتصل بيك؟" },
};

export const HINT = {
  max3: { fr: "Choisissez jusqu'à 3", ar: "اختار حتى 3" } as Bi,
  several: { fr: "Plusieurs choix possibles", ar: "تنجم تختار أكثر من جواب" } as Bi,
  optional: { fr: "Nom et téléphone facultatifs. Vous pouvez continuer sans.", ar: "الاسم ورقم الهاتف اختياريين. تنجم تكمّل بدونهم." } as Bi,
  otherPlaceholder: { fr: "Précisez (facultatif)", ar: "اكتب الصعوبة (اختياري)" } as Bi,
  chooseGov: { fr: "Choisir le gouvernorat", ar: "اختار الولاية" } as Bi,
  needPhone: { fr: "Pour vous appeler, nous avons besoin de votre numéro ci-dessus.", ar: "باش نتصلو بيك نحتاجو رقم هاتفك فوق." } as Bi,
};

export const BTN = {
  start: { fr: "Commencer", ar: "ابدا" } as Bi,
  next: { fr: "Continuer", ar: "كمّل" } as Bi,
  back: { fr: "Retour", ar: "رجوع" } as Bi,
  send: { fr: "Envoyer", ar: "ابعث" } as Bi,
  retry: { fr: "Réessayer", ar: "عاود جرّب" } as Bi,
  sending: { fr: "Envoi…", ar: "نبعثو…" } as Bi,
};

export const ERR = {
  pick: { fr: "Choisissez une réponse pour continuer.", ar: "اختار جواب باش تكمّل." } as Bi,
  both: { fr: "Répondez aux deux questions pour continuer.", ar: "جاوب على السؤالين باش تكمّل." } as Bi,
  gov: { fr: "Choisissez votre gouvernorat pour continuer.", ar: "اختار الولاية باش تكمّل." } as Bi,
  atLeastOne: { fr: "Choisissez au moins une réponse.", ar: "اختار جواب واحد على الأقل." } as Bi,
  phone: { fr: "Numéro de téléphone invalide. Écrivez des chiffres (ex. 98 123 456) ou laissez vide.", ar: "رقم الهاتف موش صحيح. اكتبو بالأرقام (مثال: 98 123 456) وإلا خليه فارغ." } as Bi,
  rate: { fr: "Trop de tentatives. Patientez un instant puis réessayez.", ar: "بعثت برشة محاولات. استنى شوية وعاود جرّب." } as Bi,
  invalid: { fr: "Une information n'est pas valide. Revenez en arrière, vérifiez vos réponses et réessayez.", ar: "فما معلومة موش صحيحة. ارجع وراجع إجاباتك وعاود جرّب." } as Bi,
  failed: { fr: "L'envoi a échoué et rien n'a été enregistré. Vos réponses sont toujours là, réessayez.", ar: "صار مشكل في الإرسال وما تسجّلتش. إجاباتك مازالت هنا، عاود جرّب." } as Bi,
  offline: { fr: "Pas de connexion Internet. Vérifiez votre réseau puis réessayez. Vos réponses sont conservées.", ar: "ما فماش اتصال بالإنترنت. تأكد من الشبكة وعاود جرّب. إجاباتك مازالت هنا." } as Bi,
};

const o = (fr: string, ar: string): Bi => ({ fr, ar });

/** Keyed by the canonical stored value. Arabic = what mechanics read; French = primary line. */
export const OPT: Record<string, Bi> = {
  // role
  "ميكانيكي": o("Mécanicien", "ميكانيكي"),
  "تقني Diagnostic": o("Technicien diagnostic", "تقني Diagnostic"),
  "كهربائي سيارات": o("Électricien automobile", "كهربائي سيارات"),
  "صاحب Garage": o("Propriétaire de garage", "صاحب Garage"),
  "ميكانيكي نخدم وحدي": o("Mécanicien indépendant", "ميكانيكي نخدم وحدي"),
  "متربص / طالب في الميكانيك": o("Stagiaire / Étudiant en mécanique", "متربص / طالب في الميكانيك"),
  "خدمة أخرى": o("Autre métier", "خدمة أخرى"),
  // experience
  "أقل من عام": o("Moins d'un an", "أقل من عام"),
  "1–2 سنين": o("1 à 2 ans", "1–2 سنين"),
  "3–5 سنين": o("3 à 5 ans", "3–5 سنين"),
  "6–10 سنين": o("6 à 10 ans", "6–10 سنين"),
  "أكثر من 10 سنين": o("Plus de 10 ans", "أكثر من 10 سنين"),
  // challenges
  "Diagnostic متاع الأعطال": o("Diagnostic des pannes", "Diagnostic متاع الأعطال"),
  "Boîte Automatique": o("Boîte automatique", "البوات الأوتوماتيك"),
  "Électricité و Électronique": o("Électricité et électronique", "الكهرباء و الإلكترونيك"),
  "سيارات Hybrid و Électrique": o("Véhicules hybrides et électriques", "سيارات Hybrid و Électrique"),
  "Schémas électriques": o("Schémas électriques", "المخططات الكهربائية"),
  "تحديد العطب الحقيقي": o("Identifier la vraie panne", "تحديد العطب الحقيقي"),
  "تقنيات جديدة في الميكانيك": o("Nouvelles technologies en mécanique", "تقنيات جديدة في الميكانيك"),
  "أخرى": o("Autre", "أخرى"),
  // interests
  "Boîtes Automatiques": o("Boîtes automatiques", "البوات الأوتوماتيك"),
  "Diagnostic Automobile": o("Diagnostic automobile", "تشخيص أعطال السيارات"),
  "Véhicules Électriques": o("Véhicules électriques", "السيارات الكهربائية"),
  "Véhicules Hybrides": o("Véhicules hybrides", "السيارات الهجينة (Hybrid)"),
  "Électricité Automobile": o("Électricité automobile", "كهرباء السيارات"),
  "Injection Électronique": o("Injection électronique", "الـ Injection الإلكتروني"),
  "Climatisation Automobile": o("Climatisation automobile", "تكييف السيارات (Clim)"),
  "Moteurs Thermiques": o("Moteurs thermiques", "المحركات الحرارية"),
  // days / hours
  "وسط الأسبوع": o("En semaine", "وسط الأسبوع"),
  "السبت": o("Samedi", "السبت"),
  "الأحد": o("Dimanche", "الأحد"),
  "Flexible": o("Flexible", "أي نهار يناسب"),
  "الصباح (08:00–12:00)": o("Matin (08h00–12h00)", "الصباح (08:00–12:00)"),
  "بعد الظهر (13:00–17:00)": o("Après-midi (13h00–17h00)", "بعد الظهر (13:00–17:00)"),
  "العشية (17:00–20:00)": o("Fin de journée (17h00–20h00)", "العشية (17:00–20:00)"),
  // duration / format
  "نهار واحد": o("Une journée", "نهار واحد"),
  "يومين": o("Deux jours", "يومين"),
  "3–5 أيام": o("3 à 5 jours", "3–5 أيام"),
  "حصص موزعة على عدة أسابيع": o("Séances réparties sur plusieurs semaines", "حصص موزعة على عدة أسابيع"),
  "تطبيق عملي على سيارات حقيقية": o("Pratique sur de vraies voitures", "تطبيق عملي على سيارات حقيقية"),
  "Théorie + Pratique": o("Théorie + Pratique", "نظري + تطبيقي"),
  "Bootcamp مكثّف": o("Bootcamp intensif", "Bootcamp مكثّف"),
  // payer / intent
  "أنا": o("Moi-même", "أنا"),
  "Garage / الشركة": o("Garage / Entreprise", "Garage / الشركة"),
  "نتقاسموا المصاريف": o("Frais partagés", "نتقاسموا المصاريف"),
  "مازلت ما قررتش": o("Pas encore décidé", "مازلت ما قررتش"),
  "أكيد نحب نسجّل": o("Oui, certainement", "أكيد نحب نسجّل"),
  "ممكن نسجّل": o("Peut-être", "ممكن نسجّل"),
  "نحب نعرف تفاصيل أكثر": o("Je veux plus de détails", "نحب نعرف تفاصيل أكثر"),
  "موش مهتم حالياً": o("Pas intéressé pour le moment", "موش مهتم حالياً"),
  // barriers / expectations / distance
  "الخدمة ما تخلّينيش نفرغ": o("Mon travail ne me laisse pas le temps", "الخدمة ما تخلّينيش نفرغ"),
  "الأسعار غالية": o("Les prix sont trop élevés", "الأسعار غالية"),
  "المركز بعيد عليّا": o("Le centre est trop loin", "المركز بعيد عليّا"),
  "ما نجمش نسكّر الـ Garage": o("Je ne peux pas fermer mon garage", "ما نجمش نسكّر الـ Garage"),
  "التكوين نظري برشة": o("Formation trop théorique", "التكوين نظري برشة"),
  "صعوبة إيجاد تكوين باهي": o("Difficile de trouver une bonne formation", "صعوبة إيجاد تكوين باهي"),
  "ما عنديش مانع": o("Aucun obstacle", "ما عنديش مانع"),
  "معدات Diagnostic": o("Équipements de diagnostic", "معدات Diagnostic"),
  "مدرّب عندو خبرة": o("Formateur expérimenté", "مدرّب عندو خبرة"),
  "شهادة": o("Certificat", "شهادة"),
  "مجموعات صغيرة": o("Petits groupes", "مجموعات صغيرة"),
  "متابعة بعد التكوين": o("Suivi après la formation", "متابعة بعد التكوين"),
  "نفس المنطقة": o("Même région", "نفس المنطقة"),
  "أقل من 30 كم": o("Moins de 30 km", "أقل من 30 كم"),
  "30–60 كم": o("30 à 60 km", "30–60 كم"),
  "أكثر من 60 كم": o("Plus de 60 km", "أكثر من 60 كم"),
  "أي ولاية إذا التكوين يستحق": o("N'importe quel gouvernorat si la formation en vaut la peine", "أي ولاية إذا التكوين يستحق"),
  // contact consent
  "إي، نحب Synergia تتصل بيا.": o("Oui, je souhaite que Synergia me contacte.", "إي، نحب Synergia تتصل بيا."),
  "لا، نحب نشارك في الاستبيان فقط.": o("Non, je souhaite seulement participer à l'enquête.", "لا، نحب نشارك في الاستبيان فقط."),
};

export const GOV_FR: Record<string, string> = {
  "أريانة": "Ariana", "باجة": "Béja", "بن عروس": "Ben Arous", "بنزرت": "Bizerte",
  "قابس": "Gabès", "قفصة": "Gafsa", "جندوبة": "Jendouba", "القيروان": "Kairouan",
  "القصرين": "Kasserine", "قبلي": "Kébili", "الكاف": "Le Kef", "المهدية": "Mahdia",
  "منوبة": "La Manouba", "مدنين": "Médenine", "المنستير": "Monastir", "نابل": "Nabeul",
  "صفاقس": "Sfax", "سيدي بوزيد": "Sidi Bouzid", "سليانة": "Siliana", "سوسة": "Sousse",
  "تطاوين": "Tataouine", "توزر": "Tozeur", "تونس": "Tunis", "زغوان": "Zaghouan",
};

export const label = (value: string): Bi => OPT[value] ?? { fr: value, ar: value };
