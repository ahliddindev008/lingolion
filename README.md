# Lingolion 🦁

AI-powered multilingual language-learning platform. The interface is available in Tajik, Russian, and English; game screens and practice content are available in 12 languages: Tajik, Russian, English, German, French, Spanish, Italian, Turkish, Arabic, Persian, Chinese, and Japanese. Learn any target language from any source language.
## Tech stack

- **Frontend:** HTML5 / CSS3 / vanilla JavaScript, mobile-first, no build step.
- **Backend:** Python FastAPI (JWT auth, WebSockets, rate limiting).
- **Database:** PostgreSQL (Neon) via SQLAlchemy + Alembic migrations.
- **AI:** Google Gemini (`google-generativeai`) for lesson generation and AI tutor chat, with regex-based JSON extraction and safe fallbacks. Short game quizzes use a manually translated offline catalog, with game labels and practice content in all 12 supported languages.

## Run Lingolion

From the repository root, start the complete app with:
```powershell
python app.py
```

On first run, `app.py` creates `backend/.env` from the example and stops. Fill in `DATABASE_URL`, `GEMINI_API_KEY`, and `SECRET_KEY`, then run `python app.py` again. Optionally set `DEEPSEEK_API_KEY` for automatic DeepSeek fallback when Gemini reports quota exhaustion. To enable the admin panel, set `ADMIN_EMAILS` to one or more comma-separated account email addresses; only those accounts can access admin APIs. The in-app translator uses `deep-translator` and does not need a separate translation API key. The launcher applies database migrations, creates the backend virtual environment, installs its requirements, starts both frontend and API, and opens the app in your browser.

Do not open `frontend/index.html` directly or start separate frontend/backend servers. Open Lingolion through the browser URL printed by `app.py` (normally http://127.0.0.1:5500). Press Ctrl+C in the launcher terminal to stop servers it started.

## Deploy to Render

The repository includes a Render Blueprint (`render.yaml`) for a single web service. It serves the frontend, API, and WebSockets from one HTTPS origin and runs Alembic migrations before starting the production server. In Render, create a Blueprint from this repository and set these service environment variables before the first deployment:

- `DATABASE_URL`: a reachable PostgreSQL connection string. Use a managed database with persistent storage and backups; do not use SQLite for production.
- `GEMINI_API_KEY`: the Gemini API key used for generated lessons and AI practice.
- `DEEPSEEK_API_KEY`: optional; used as a fallback when Gemini quota is exhausted.
- `ADMIN_EMAILS`: optional comma-separated email addresses for admin accounts.

Render generates `SECRET_KEY` for the service. Keep provider keys and database credentials in Render's environment settings, not in source control. The service uses Python 3.11.8, checks database readiness at `/api/ready`, and serves the static frontend at `/`. After deployment, verify the service health check and sign up through the Render URL. Add a custom domain in Render if needed; the app uses the same origin for API and WebSocket traffic.

## Email accounts and device sessions

Users register and sign in with an email address and password. Password recovery is available only from a device previously used to sign in to the account. Deleting an account requires its password.

After signing in, the app keeps a refresh-token session for that browser/device. The device identifier is stored locally, so users stay signed in on the same device until they sign out or revoke that session. The email is used for authentication but is not displayed on the profile page.

## Conversation message controls

In a chat, use the `×` control on one of your own messages to unsend it for every participant. Use the conversation menu to clear the chat history only from your account; it does not erase the other participant's history. Clearing and unsending also remove associated message notifications, and unsending an attachment deletes its uploaded file.

## Independent speaking practice

The Speaking tab contains a separate 50-lesson conversation track for each language pair. It starts at A1 and progresses through A2, B1, B2, and C1 independently of the main course curriculum. Lessons are generated when opened, support speech input and audio playback where the browser allows it, and unlock in order after an 80% score. Completing one also earns the usual lesson rewards without advancing or completing a main-course unit.

## Shared offline course content

Course lessons, standalone speaking-practice lessons, and learner-requested custom topics are cached in the database by source language, target language, and CEFR level — for course and speaking lessons also by unit, and for custom lessons by the normalized topic (lower-cased, whitespace-collapsed) — then copied to each learner's personal lesson record so scores and progress remain personal. Each lesson is generated and shared on first request; it is not necessary to generate the complete catalog in advance. Custom-topic caching means a second learner asking for the same topic in the same language pair and level reuses the existing lesson instead of spending provider quota again. To pre-generate the complete supported main-course catalog (12 languages, 132 ordered language pairs, 6 levels, 50 units; 39,600 lessons), run the resumable worker from `backend`:

```powershell
cd backend
.\venv\Scripts\alembic upgrade head
.\venv\Scripts\python.exe -m app.pre_generate_course --max-new-lessons 100
```

Omit `--max-new-lessons 100` to continue through the entire catalog. The worker commits each lesson separately, skips existing lessons, and resumes safely after interruption. Generating all lessons uses provider quota and may incur substantial API cost; review provider limits and billing before running the full job. Ten short games use three manually translated topics (greetings, cafe, and travel) in all 12 supported languages. Game, topic, and dialogue titles follow the selected interface language, while practice text follows the selected course language pair. Vocabulary game dictionaries are kept separately in `frontend/js/vocabulary_catalog.js`; other game prompts are in `frontend/js/game_catalog.js`. Choose a topic before starting a game; game content does not call an AI or content-generation API. Submitting a completed game still uses the backend to save its score and XP.

## Database migrations

The `app.py` launcher applies checked-in Alembic migrations before starting the API. For deployments that do not use the launcher, run migrations from `backend`:

```powershell
.\venv\Scripts\alembic upgrade head
```

API docs are available at http://127.0.0.1:8000/docs while `app.py` is running.

## Notes

- Passwords are hashed with `passlib[bcrypt]`; `bcrypt` is pinned to `4.0.1` for compatibility with `passlib==1.7.4`.
- Gemini model in use: `gemini-3.6-flash`; DeepSeek uses the `deepseek-flash` chat-completions model as quota fallback. Both are configured in `backend/app/gemini_service.py`.
- JWT bearer tokens are stored in `localStorage` on the frontend and sent via `Authorization` header.
- Chat/AI-tutor messages are sanitized (HTML-escaped) server-side to prevent stored XSS.
- Rate limiting is applied to auth endpoints via `slowapi`.
#
