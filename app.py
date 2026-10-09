import json
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
import urllib.error
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
VENV_PYTHON = BACKEND / "venv" / "Scripts" / "python.exe"
API_URL = "http://127.0.0.1:8000/api/health"
APP_URL = "http://127.0.0.1:5500"
LAN_APP_URL = None


def get_lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
            connection.connect(("192.0.2.1", 80))
            return connection.getsockname()[0]
    except OSError:
        return None


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()


def prepare_environment():
    env_file = BACKEND / ".env"
    if not env_file.exists():
        shutil.copyfile(BACKEND / ".env.example", env_file)
        print("Файли backend/.env сохта шуд. DATABASE_URL, GEMINI_API_KEY ва SECRET_KEY-ро пур карда, app.py-ро аз нав иҷро кунед.")
        return False

    if not VENV_PYTHON.exists():
        print("Муҳити Python сохта мешавад...")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_PYTHON.parent.parent)], check=True)

    dependencies_ready = subprocess.run(
        [str(VENV_PYTHON), "-c", "import deep_translator, fastapi, google.auth, speech_recognition, uvicorn"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    ).returncode == 0
    if not dependencies_ready:
        print("Вобастагиҳои backend насб мешаванд...")
        subprocess.run(
            [str(VENV_PYTHON), "-m", "pip", "install", "-r", str(BACKEND / "requirements.txt")],
            check=True,
        )
    print("Тағйироти базаи маълумот татбиқ мешаванд...")
    subprocess.run(
        [str(VENV_PYTHON), "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND,
        check=True,
    )
    return True


def wait_for_api(process, timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("Backend қатъ шуд. Хатогиҳоро дар ҳамин равзана бинед.")
        try:
            with urllib.request.urlopen(API_URL, timeout=2):
                return
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.5)
    raise RuntimeError("API дар 30 сония омода нашуд. Пайвасти базаи маълумотро санҷед.")


def frontend_is_running():
    try:
        with urllib.request.urlopen(f"{APP_URL}/index.html", timeout=2) as response:
            return response.status == 200 and b'id="mainView"' in response.read()
    except (urllib.error.URLError, TimeoutError):
        return False


def api_is_running():
    try:
        with urllib.request.urlopen(API_URL, timeout=2) as response:
            return json.load(response).get("service") == "Lingolion API"
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return False


def main():
    global LAN_APP_URL
    if not prepare_environment():
        return

    lan_ip = get_lan_ip()
    if lan_ip:
        LAN_APP_URL = f"http://{lan_ip}:5500"

    backend = None
    frontend_server = None
    frontend_thread = None
    try:
        if frontend_is_running():
            print(f"Frontend аллакай фаъол аст: {APP_URL}")
        else:
            frontend_server = ThreadingHTTPServer(
                ("0.0.0.0", 5500),
                partial(NoCacheHandler, directory=str(FRONTEND)),
            )
            frontend_server.daemon_threads = True
            frontend_thread = Thread(target=frontend_server.serve_forever, daemon=True)
            frontend_thread.start()

        if api_is_running():
            print("Backend аллакай фаъол аст.")
        else:
            backend = subprocess.Popen(
                [
                    str(VENV_PYTHON), "-m", "uvicorn", "app.main:app",
                    "--host", "0.0.0.0", "--port", "8000", "--reload",
                ],
                cwd=BACKEND,
            )
            wait_for_api(backend)
        webbrowser.open(APP_URL)
        print(f"Lingolion фаъол аст: {APP_URL}")
        if LAN_APP_URL:
            print(f"Барои телефон дар ҳамин Wi-Fi: {LAN_APP_URL}")
        print("Файлҳои frontend бидуни cache дода мешаванд; тағйироти backend автоматӣ reload мешаванд.")
        print("Барои қатъ кардани серверҳо Ctrl+C-ро пахш кунед.")
        while backend is None or backend.poll() is None:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nLingolion қатъ мешавад...")
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Хато: {error}")
        
    finally:
        if frontend_thread is not None and frontend_thread.is_alive():
            frontend_server.shutdown()
        if frontend_server is not None:
            frontend_server.server_close()
        if backend is not None and backend.poll() is None:
            backend.terminate()
            backend.wait(timeout=5)


if __name__ == "__main__":
    main()