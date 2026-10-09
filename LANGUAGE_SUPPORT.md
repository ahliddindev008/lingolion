# Lingolion — 12-Language Support Documentation

## ✅ System Overview

Your application has **complete multilingual support** for **12 languages** across the entire interface.

## 🌍 Supported Languages

| # | Code | Language | Native Name | Status |
|---|------|----------|-------------|--------|
| 1 | `tj` | Tajik | Тоҷикӣ | ✅ Active (Default) |
| 2 | `ru` | Russian | Русский | ✅ Active |
| 3 | `en` | English | English | ✅ Active |
| 4 | `de` | German | Deutsch | ✅ Active |
| 5 | `fr` | French | Français | ✅ Active |
| 6 | `es` | Spanish | Español | ✅ Active |
| 7 | `it` | Italian | Italiano | ✅ Active |
| 8 | `tr` | Turkish | Türkçe | ✅ Active |
| 9 | `ar` | Arabic | العربية | ✅ Active (RTL) |
| 10 | `fa` | Persian/Farsi | فارسی | ✅ Active (RTL) |
| 11 | `zh-CN` | Chinese (Simplified) | 简体中文 | ✅ Active |
| 12 | `ja` | Japanese | 日本語 | ✅ Active |

## 📁 File Structure

```
frontend/
├── locales/
│   ├── ar.json          # Arabic translations
│   ├── de.json          # German translations
│   ├── en.json          # English translations (Fallback)
│   ├── es.json          # Spanish translations
│   ├── fa.json          # Persian translations
│   ├── fr.json          # French translations
│   ├── it.json          # Italian translations
│   ├── ja.json          # Japanese translations
│   ├── ru.json          # Russian translations
│   ├── tj.json          # Tajik translations (Default)
│   ├── tr.json          # Turkish translations
│   └── zh-CN.json       # Chinese translations
├── js/
│   ├── i18n.js          # Internationalization engine
│   ├── app.js           # Main application logic
│   └── ...
└── index.html           # Main HTML with language switcher
```

## 🔧 Technical Implementation

### 1. **i18n.js** — Internationalization Engine
Located at: `frontend/js/i18n.js`

**Features:**
- Loads translations dynamically from JSON files
- Supports parameter interpolation: `{key}` placeholders
- Automatically applies RTL (Right-to-Left) for Arabic & Persian
- Fallback to English if translation is missing
- Persistent language selection in localStorage
- Sets correct HTML `lang` attribute and `dir` attribute

**Key Functions:**
```javascript
I18N.load(lang)              // Load language translations
I18N.t(key, params)          // Get translated string with parameters
I18N.applyToDom(root)        // Apply translations to DOM elements
I18N.getLang()               // Get current language code
I18N.getLanguages()          // Get all supported languages
```

### 2. **Language Switching UI**
Located at: `frontend/index.html`

**Language Selector:**
```html
<select id="langSwitcher" name="interface_language">
  <!-- Dynamically populated with all 12 languages -->
</select>
```

**Menu Location:**
- Settings Panel → "Change Language" button → Language Settings
- User-selected language is saved to database profile (`interface_language` field)
- Browser falls back to localStorage if no saved preference

### 3. **Translation Keys Structure**

Each JSON file (`locales/*.json`) contains translation keys organized hierarchically:

```json
{
  "app_name": "Lingolion",
  "tagline": "Learn language with AI assistance",
  "nav": {
    "lesson_generator": "Lesson Generator",
    "course": "Course",
    "speaking": "Speaking",
    ...
  },
  "settings": {
    "change_language": "Change Language",
    "profile": "Profile",
    ...
  },
  ...
}
```

### 4. **DOM Integration**

Translations are applied to HTML elements using `data-i18n` attributes:

```html
<!-- Text content -->
<span data-i18n="nav.lesson_generator"></span>

<!-- Placeholder attributes -->
<input data-i18n-placeholder="common.search" />

<!-- Dynamic parameters -->
<p data-i18n="messages.welcome"></p>  <!-- t('messages.welcome') -->
```

## 🎯 How Language Selection Works

1. **User selects language** in Settings → Change Language
2. **Browser sends preference** to backend via `/profile/me` update
3. **Database stores** language preference in user profile
4. **Frontend loads** selected language JSON file
5. **Interface updates** with proper text direction (LTR/RTL)
6. **Selection persists** in localStorage and database

## 📝 Features by Language

### Special Handling:

- **RTL Languages (Arabic, Persian):**
  - HTML `dir="rtl"` attribute automatically set
  - UI elements flip for right-to-left reading
  
- **English (Fallback Language):**
  - Used as fallback for missing translations
  - Always fully loaded as backup
  
- **Asian Languages (Chinese, Japanese):**
  - Support for character-based rendering
  - Proper font stack in CSS

## ✨ Current Implementation Status

### ✅ Completed:

- [x] All 12 language JSON files created and populated
- [x] i18n.js engine implemented with all features
- [x] Language selector integrated in settings
- [x] RTL support for Arabic and Persian
- [x] Fallback to English for missing keys
- [x] DOM translation system with `data-i18n` attributes
- [x] LocalStorage persistence for language preference
- [x] Database profile field for language preference
- [x] Proper HTML language tags (`lang` attribute)
- [x] Multi-language UI throughout application
- [x] Game and vocabulary catalogs support translations

### 🔄 Recommended Best Practices:

1. **When adding new UI text:**
   ```html
   <!-- Use data-i18n attribute -->
   <button data-i18n="buttons.submit"></button>
   ```

2. **Update all 12 translation files:**
   - Add key to `en.json` (primary)
   - Add translations to all other 11 files
   - Use consistent key naming: `category.item_name`

3. **Use parameter interpolation:**
   ```json
   { "greeting": "Welcome, {username}!" }
   ```
   ```javascript
   I18N.t("greeting", { username: "Alice" })
   ```

4. **Test language switching:**
   - Open Settings → Change Language
   - Verify all UI updates correctly
   - Check RTL languages display properly

## 🚀 Initialization Flow

1. **App Startup** (`app.js`)
   - Detects saved language from localStorage
   - Calls `I18N.load(savedLanguage)`

2. **Language Loading** (`i18n.js`)
   - Fetches `locales/{lang}.json`
   - Loads fallback English if not the default language
   - Applies DOM translations via `I18N.applyToDom()`

3. **User Change**
   - Updates `langSwitcher` select element
   - Calls `I18N.load()` with new language
   - Updates database profile
   - Refreshes DOM

## 📊 Language Statistics

- **Total Languages:** 12
- **LTR Languages:** 10 (English, German, French, Spanish, Italian, Turkish, Russian, Chinese, Japanese, Tajik)
- **RTL Languages:** 2 (Arabic, Persian)
- **Translation Files:** 12 JSON files
- **Average Translations per File:** 400-500 keys

## 🐛 Troubleshooting

### Language not switching?
1. Check localStorage: `localStorage.getItem('lingolion_lang')`
2. Verify JSON file exists: `frontend/locales/{lang}.json`
3. Check browser console for fetch errors

### Missing translation?
1. Key falls back to English version
2. Check `locales/en.json` for the key
3. Add missing translation to target language file
4. Refresh browser cache (Ctrl+Shift+R)

### RTL text not displaying correctly?
1. Verify `document.documentElement.dir` is set to `rtl`
2. Check CSS for hardcoded `text-align: left`
3. Use CSS `direction` property for proper alignment

## 🔐 Supported Characters

- **Latin:** ✅ English, German, French, Spanish, Italian, Turkish
- **Cyrillic:** ✅ Russian, Tajik
- **Arabic Script:** ✅ Arabic, Persian
- **CJK:** ✅ Chinese (Simplified), Japanese
- **Special Unicode:** ✅ Emojis, mathematical symbols, diacritics

---

**Version:** 1.0  
**Last Updated:** 2026-10-07  
**System:** Lingolion Language Learning Platform
