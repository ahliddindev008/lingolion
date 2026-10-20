// Local runs (python app.py) serve this UI from the same machine, so talk to
// the local API on port 8000 — development then uses local code and data.
// Deployed builds keep the production origin unchanged.
const IS_LOCAL_HOST =
  ["localhost", "127.0.0.1"].includes(location.hostname) ||
  /^127\./.test(location.hostname) ||
  /^10\./.test(location.hostname) ||
  /^192\.168\./.test(location.hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(location.hostname);
const API_ORIGIN = IS_LOCAL_HOST ? `${location.protocol}//${location.hostname}:8000` : "https://lingolion.onrender.com";
const API_BASE = `${API_ORIGIN}/api`;
const WS_BASE = `${API_ORIGIN.replace(/^http/, "ws")}/api`;

const API = (() => {
  let onAuthExpired = null;
  let refreshPromise = null;
  const DEVICE_ID_KEY = "lingolion_device_id";
  const LESSONS_CACHE_PREFIX = "lingolion_lessons_";

  function getCachedLessons(pairId) {
    try {
      const lessons = JSON.parse(localStorage.getItem(`${LESSONS_CACHE_PREFIX}${pairId}`) || "[]");
      return Array.isArray(lessons) ? lessons : [];
    } catch (error) {
      return [];
    }
  }

  function cacheLessons(pairId, lessons) {
    try {
      localStorage.setItem(`${LESSONS_CACHE_PREFIX}${pairId}`, JSON.stringify(lessons));
    } catch (error) {
      // Lesson caching is optional when browser storage is unavailable.
    }
  }

  function cacheLesson(pairId, lesson) {
    const lessons = getCachedLessons(pairId).filter((item) => item.id !== lesson.id);
    cacheLessons(pairId, [lesson, ...lessons]);
  }

  function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId || !/^[A-Za-z0-9-]{16,64}$/.test(deviceId)) {
      deviceId = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : window.crypto?.getRandomValues
          ? Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("")
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      deviceId = deviceId.replace(/[^A-Za-z0-9-]/g, "").slice(0, 64);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  function getDeviceName() {
    const agent = navigator.userAgent || "";
    const browser = /Edg\//.test(agent) ? "Edge" : /Firefox\//.test(agent) ? "Firefox" : /Chrome\//.test(agent) ? "Chrome" : /Safari\//.test(agent) ? "Safari" : "Browser";
    const platform = navigator.userAgentData?.platform || navigator.platform || "Device";
    return `${browser} on ${platform}`.slice(0, 120);
  }

  function deviceHeaders() {
    return {
      "X-Device-Id": getDeviceId(),
      "X-Device-Name": getDeviceName(),
    };
  }

  function getToken() {
    return localStorage.getItem("lingolion_token");
  }

  function setToken(token) {
    localStorage.setItem("lingolion_token", token);
  }

  function getRefreshToken() {
    return localStorage.getItem("lingolion_refresh");
  }

  function setRefreshToken(token) {
    localStorage.setItem("lingolion_refresh", token);
  }

  function setTokens({ access_token, refresh_token }) {
    setToken(access_token);
    setRefreshToken(refresh_token);
  }

  function clearToken() {
    localStorage.removeItem("lingolion_token");
    localStorage.removeItem("lingolion_refresh");
  }

  function setAuthExpiredHandler(fn) {
    onAuthExpired = fn;
  }

  async function tryRefresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    if (!refreshPromise) {
      refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...deviceHeaders() },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setTokens(data);
          return !!data;
        })
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  }

  async function request(path, { method = "GET", body, auth = true, _retried = false } = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const headers = { ...deviceHeaders(), ...(isFormData ? {} : { "Content-Type": "application/json" }) };
    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    if (res.status === 401 && auth && !_retried) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request(path, { method, body, auth, _retried: true });
      }
      clearToken();
      if (onAuthExpired) onAuthExpired();
    }

    const responseText = await res.text();
    let data = null;
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        data = { detail: responseText };
      }
    }

    if (!res.ok) {
      const message = data?.detail || res.statusText || `Request failed (${res.status})`;
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }
    return data;
  }

  async function download(path, _retried = false) {
    const headers = deviceHeaders();
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (res.status === 401 && !_retried) {
      const refreshed = await tryRefresh();
      if (refreshed) return download(path, true);
      clearToken();
      if (onAuthExpired) onAuthExpired();
    }
    if (!res.ok) {
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
      throw new Error(data?.detail || `Request failed (${res.status})`);
    }
    return res.blob();
  }

  function upload(path, file) {
    const formData = new FormData();
    formData.append("file", file);
    return request(path, { method: "POST", body: formData });
  }

  return {
    getToken,
    setTokens,
    refreshSession: tryRefresh,
    setAuthExpiredHandler,
    setToken,
    clearToken,
    getCachedLessons,
    cacheLessons,
    cacheLesson,
    get: (path) => request(path),
    post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    delete: (path, body) => request(path, { method: "DELETE", body }),
    upload,
    download,
  };
})();
