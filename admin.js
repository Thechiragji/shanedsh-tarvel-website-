// admin.js  (MODULE)

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// SAME config as script.js
const firebaseConfig = {
  apiKey: "AIzaSyAixaw3PtDNvLEinV3i_c9CUUza27YhzU",
  authDomain: "as-tour-travels.firebaseapp.com",
  projectId: "as-tour-travels",
  storageBucket: "as-tour-travels.appspot.com",
  messagingSenderId: "826916058476",
  appId: "1:826916058476:web:a4193114f04d908cd2ef49",
  measurementId: "G-38B1S8HMH6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple password (frontend only)
const PASSWORD = "ASTravel@123";

const appRoot = document.getElementById("adminApp");

document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("as_admin_logged_in") === "1";
  if (isLoggedIn) {
    renderDashboard();
  } else {
    renderLogin();
  }
});

function renderLogin() {
  appRoot.innerHTML = `
    <div class="card login-card">
      <h1>Admin Login</h1>
      <p class="login-note">
        Enter admin password to manage website content (YouTube video, footer text, background image).
      </p>
      <form id="loginForm" class="form">
        <div class="form-group">
          <label for="admin-password">Password</label>
          <input type="password" id="admin-password" placeholder="Enter admin password" required />
        </div>
        <button type="submit" class="btn full-width">Login</button>
      </form>
    </div>
  `;

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pwd = document.getElementById("admin-password").value;
    if (pwd === PASSWORD) {
      sessionStorage.setItem("as_admin_logged_in", "1");
      renderDashboard();
    } else {
      alert("Incorrect password");
    }
  });
}

async function renderDashboard() {
  appRoot.innerHTML = `
    <div class="admin-header">
      <div>
        <div class="admin-title">A S Tour & Travels – Admin Panel</div>
        <div style="font-size:0.8rem;color:#9ca3af;">Site Settings (Firestore CMS)</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="tag-admin">Connected</span>
        <button class="btn btn-outline small-btn" id="logoutBtn">Logout</button>
      </div>
    </div>

    <div class="admin-main">
      <aside class="admin-sidebar">
        <p style="margin-bottom:8px;">Site Controls</p>
        <ul style="list-style:none; font-size:0.8rem; color:#9ca3af; padding-left:0;">
          <li>• Change YouTube video</li>
          <li>• Edit footer description</li>
          <li>• Set background image URL</li>
        </ul>
        <p style="margin-top:10px;font-size:0.75rem;color:#9ca3af;">
          After you save, refresh the public website page to see changes.
        </p>
      </aside>

      <main class="admin-content">
        <h3 style="margin-bottom:10px;font-size:1rem;">Site Settings</h3>
        <form id="settingsForm" class="form">
          <div class="form-group">
            <label for="youtube-id">YouTube Video ID or URL</label>
            <input type="text" id="youtube-id" placeholder="dQw4w9WgXcQ or full URL" />
            <small class="form-note">
              Only the video ID is stored. If you paste full URL, we'll extract ID automatically.
            </small>
          </div>

          <div class="form-group">
            <label for="footer-text">Footer Description Text</label>
            <textarea id="footer-text" rows="3" placeholder="Short description shown in footer."></textarea>
          </div>

          <div class="form-group">
            <label for="bg-url">Background Image URL (optional)</label>
            <input type="text" id="bg-url" placeholder="https://example.com/image.jpg" />
            <small class="form-note">
              Leave empty to use default gradient background. Large, optimized images recommended.
            </small>
          </div>

          <button type="submit" class="btn full-width">Save Settings</button>
        </form>
      </main>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("as_admin_logged_in");
    renderLogin();
  });

  // Load existing config
  await loadSettingsIntoForm();

  const form = document.getElementById("settingsForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveSettingsFromForm();
  });
}

function extractYoutubeId(input) {
  if (!input) return "";
  input = input.trim();
  // direct ID
  if (!input.includes("http") && input.length <= 20) return input;

  try {
    const url = new URL(input);
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1];
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1];
  } catch (e) {
    // not a URL
  }
  return input;
}

async function loadSettingsIntoForm() {
  try {
    const ref = doc(db, "siteConfig", "main");
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const cfg = snap.data();
    const youtubeInput = document.getElementById("youtube-id");
    const footerInput = document.getElementById("footer-text");
    const bgInput = document.getElementById("bg-url");

    if (cfg.youtubeVideoId && youtubeInput) {
      youtubeInput.value = cfg.youtubeVideoId;
    }
    if (cfg.footerText && footerInput) {
      footerInput.value = cfg.footerText;
    }
    if (cfg.backgroundImageUrl && bgInput) {
      bgInput.value = cfg.backgroundImageUrl;
    }
  } catch (err) {
    console.error("Error loading settings:", err);
    alert("Error loading settings from Firestore. Check console.");
  }
}

async function saveSettingsFromForm() {
  try {
    const youtubeInput = document.getElementById("youtube-id").value.trim();
    const footerInput = document.getElementById("footer-text").value.trim();
    const bgInput = document.getElementById("bg-url").value.trim();

    const youtubeId = extractYoutubeId(youtubeInput);

    const ref = doc(db, "siteConfig", "main");
    await setDoc(
      ref,
      {
        youtubeVideoId: youtubeId || "",
        footerText: footerInput || "",
        backgroundImageUrl: bgInput || ""
      },
      { merge: true }
    );

    alert("Settings saved. Visit main site and refresh page to see changes.");
  } catch (err) {
    console.error("Error saving settings:", err);
    alert("Error saving settings to Firestore. Check console.");
  }
}
