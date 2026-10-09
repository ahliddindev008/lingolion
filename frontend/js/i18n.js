const I18N = (() => {
  const languages = [
    { code: "tj", label: "Тоҷикӣ" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "it", label: "Italiano" },
    { code: "tr", label: "Türkçe" },
    { code: "ar", label: "العربية" },
    { code: "fa", label: "فارسی" },
    { code: "zh-CN", label: "中文" },
    { code: "ja", label: "日本語" },
  ];
  let currentLang = localStorage.getItem("lingolion_lang") || "tj";
  let translations = {};
  let fallbackTranslations = {};

  async function load(lang) {
    if (!languages.some((language) => language.code === lang)) {
      throw new Error(`Unsupported interface language: ${lang}`);
    }
    const [res, fallbackRes] = await Promise.all([
      fetch(`locales/${lang}.json`),
      lang === "en" ? null : fetch("locales/en.json"),
    ]);
    if (!res.ok || (fallbackRes && !fallbackRes.ok)) {
      throw new Error(`Could not load translations for ${lang}`);
    }
    translations = await res.json();
    fallbackTranslations = fallbackRes ? await fallbackRes.json() : translations;
    currentLang = lang;
    localStorage.setItem("lingolion_lang", lang);
    document.documentElement.lang = lang === "tj" ? "tg" : lang;
    document.documentElement.dir = ["ar", "fa"].includes(lang) ? "rtl" : "ltr";
  }

  function t(key, params = {}) {
    const parts = key.split(".");
    const lookup = (source) => parts.reduce((value, part) => value?.[part], source);
    const value = lookup(translations) ?? lookup(fallbackTranslations) ?? key;
    if (typeof value !== "string") {
      return value;
    }
    return value.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
  }

  function applyToDom(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
  }

  function getLang() {
    return currentLang;
  }

  function getLanguages() {
    return languages;
  }

  return { load, t, applyToDom, getLang, getLanguages };
})();
