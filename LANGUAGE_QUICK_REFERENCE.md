# 🌐 Lingolion 12-Language Support — Quick Reference

## ✅ System Status
**All 12 languages fully implemented, integrated, and production-ready.**

---

## 📋 The 12 Languages

```
1. Tajik (tj) 🇹🇯         7. Italian (it) 🇮🇹
2. Russian (ru) 🇷🇺       8. Turkish (tr) 🇹🇷
3. English (en) 🇬🇧       9. Arabic (ar) 🇸🇦 [RTL]
4. German (de) 🇩🇪        10. Persian (fa) 🇮🇷 [RTL]
5. French (fr) 🇫🇷        11. Chinese (zh-CN) 🇨🇳
6. Spanish (es) 🇪🇸       12. Japanese (ja) 🇯🇵
```

---

## 🚀 Quick Start

### For End Users:
1. Login to Lingolion
2. Go to Settings ⚙️
3. Click "Change Language"
4. Select from 12 options
5. Done! Interface updates immediately

### For Developers:

**To add new text to UI:**

1. Add to `frontend/locales/en.json`:
```json
{
  "my_feature": {
    "title": "My Feature"
  }
}
```

2. Add same structure to 11 other language files

3. Use in HTML:
```html
<h2 data-i18n="my_feature.title"></h2>
```

---

## 📁 File Locations

| Purpose | Location |
|---------|----------|
| Translation Files | `frontend/locales/*.json` (12 files) |
| i18n Engine | `frontend/js/i18n.js` |
| App Integration | `frontend/js/app.js` |
| Language Selector HTML | `frontend/index.html` |
| Onboarding | `frontend/js/views/onboarding.js` |

---

## 🔧 Common Tasks

### Add Translation for New Button
```json
// locales/en.json
{
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
```

```html
<button data-i18n="buttons.submit"></button>
```

### Add Parameterized Text
```json
// locales/en.json
{
  "messages": {
    "welcome": "Welcome, {name}!"
  }
}
```

```javascript
const msg = I18N.t("messages.welcome", { name: "Alice" });
// Result: "Welcome, Alice!"
```

### Check Current Language
```javascript
const lang = I18N.getLang();  // Returns "fa", "en", etc.

if (lang === "ar" || lang === "fa") {
  // RTL language specific code
}
```

### Manually Apply Translations to DOM
```javascript
const element = document.getElementById("myModal");
I18N.applyToDom(element);  // Updates all data-i18n in this element
```

---

## 🎨 Special Features

### RTL Automatic Setup
- Arabic & Persian: Automatically set to `dir="rtl"`
- Layout flips, text aligns right
- No manual CSS changes needed

### Fallback System
- English is fallback for missing translations
- If English missing too, key name is shown
- Never blank text in UI

### Persistence
- Saved in database (user profile)
- Also saved in browser localStorage
- Survives logout/login

---

## 📊 API Integration

### Backend Support
```
User model field: interface_language (String)
Endpoint: PUT /profile/me { interface_language: "fa" }
```

---

## ✨ Language Codes

```javascript
"tj"    // Tajik (Default)
"ru"    // Russian
"en"    // English
"de"    // German
"fr"    // French
"es"    // Spanish
"it"    // Italian
"tr"    // Turkish
"ar"    // Arabic
"fa"    // Persian
"zh-CN" // Chinese Simplified
"ja"    // Japanese
```

---

## 🐛 Quick Fixes

| Issue | Solution |
|-------|----------|
| Language not changing | Clear localStorage: `localStorage.clear()` |
| Text shows key name | Add translation to `locales/en.json` |
| RTL broken | Check `dir="rtl"` in DevTools |
| Changes not showing | Hard refresh: Ctrl+Shift+Delete then Ctrl+R |

---

## 📝 DOM Attributes

```html
data-i18n                  <!-- Updates textContent -->
data-i18n-placeholder      <!-- Updates placeholder -->
data-i18n-title            <!-- Updates title -->
data-i18n-aria-label       <!-- Updates aria-label -->
```

---

## 🎯 Complete Feature List

- ✅ 12 languages with full translations
- ✅ Language switcher in Settings
- ✅ Language selection during signup
- ✅ RTL support (Arabic, Persian)
- ✅ Parameter interpolation
- ✅ Fallback to English
- ✅ Persistent selection
- ✅ All 12 languages in onboarding
- ✅ Database profile storage
- ✅ HTML lang attribute
- ✅ Proper text direction
- ✅ No missing translations

---

## 🚀 System Ready for:
- ✅ International users
- ✅ Multiple language communities
- ✅ RTL language users
- ✅ Adding more languages (if needed)
- ✅ Translating new features

---

**Version:** 1.0 | **Status:** ✅ COMPLETE | **Date:** 2026-10-07
