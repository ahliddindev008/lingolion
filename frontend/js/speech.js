window.SpeechUtils = Object.freeze({
  languageCode(language) {
    const normalized = String(language || "").trim().toLocaleLowerCase();
    const codes = {
      english: "en-US", "английский": "en-US", deutsch: "de-DE", german: "de-DE",
      русский: "ru-RU", russian: "ru-RU", "тоҷикӣ": "tg-TJ", tajik: "tg-TJ",
      español: "es-ES", spanish: "es-ES", français: "fr-FR", french: "fr-FR",
      türkçe: "tr-TR", turkish: "tr-TR", arabic: "ar-SA", العربية: "ar-SA",
      فارسی: "fa-IR", persian: "fa-IR", 中文: "zh-CN", chinese: "zh-CN",
      日本語: "ja-JP", japanese: "ja-JP",
    };
    return codes[normalized] || (normalized.includes("-") ? language : "");
  },
});
