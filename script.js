// scripts/script.js  (module)

// ===== Firebase imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== Firebase config =====
const firebaseConfig = {
  apiKey: "AIzaSyAixaw3PtDNvLEinV3i_c9CUUza27YhzU",
  authDomain: "as-tour-travels.firebaseapp.com",
  projectId: "as-tour-travels",
  storageBucket: "as-tour-travels.appspot.com",
  messagingSenderId: "826916058476",
  appId: "1:826916058476:web:a4193114f04d908cd2ef49",
  measurementId: "G-38B1S8HMH6",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- Helper: YouTube ID nikalne ke liye ----
function extractYoutubeId(input) {
  if (!input) return "";
  input = input.trim();

  // Agar http nahi hai & chhota string hai -> direct ID
  if (!input.includes("http") && input.length <= 20) return input;

  try {
    const url = new URL(input);
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1];
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1];
    if (url.hostname === "youtu.be") return url.pathname.replace("/", "");
  } catch (e) {
    // ignore
  }
  return input;
}

// ===== DOM Ready =====
document.addEventListener("DOMContentLoaded", () => {
  // ----- Navbar toggle -----
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navMenu.classList.remove("open"));
    });
  }

  // ----- Footer Year -----
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ----- LocalStorage helpers for leads -----
  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem("as_travel_leads") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveLead(lead) {
    const leads = getLeads();
    leads.push(lead);
    localStorage.setItem("as_travel_leads", JSON.stringify(leads));
  }

  function openWhatsAppWithLead(lead) {
    const base = "https://wa.me/918602837299";
    const text =
      `Name: ${lead.name}\n` +
      `Phone: ${lead.phone}\n` +
      (lead.email ? `Email: ${lead.email}\n` : "") +
      (lead.service ? `Service: ${lead.service}\n` : "") +
      (lead.travelDate ? `Travel Date: ${lead.travelDate}\n` : "") +
      (lead.travellers ? `Travellers: ${lead.travellers}\n` : "") +
      (lead.message ? `Details: ${lead.message}\n` : "") +
      "\nSent via website enquiry.";
    const url = base + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  // ----- Quick Enquiry Form -----
  const quickForm = document.getElementById("quickEnquiryForm");
  if (quickForm) {
    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("q-name").value.trim();
      const phone = document.getElementById("q-phone").value.trim();
      const service = document.getElementById("q-service").value;

      if (!name || !phone || !service) {
        alert("Please fill all required fields.");
        return;
      }

      const lead = {
        name,
        phone,
        email: "",
        service,
        message: "Quick enquiry from hero section.",
        createdAt: new Date().toISOString(),
        source: "quick-form",
      };

      saveLead(lead);
      openWhatsAppWithLead(lead);

      quickForm.reset();
      alert("Enquiry saved and opened in WhatsApp.");
    });
  }

  // ----- Main Lead Form -----
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const service = document.getElementById("service").value;
      const travelDate = document.getElementById("travel-date").value;
      const travellers = document.getElementById("travellers").value;
      const message = document.getElementById("message").value.trim();

      if (!name || !phone || !service || !message) {
        alert("Please fill all required fields.");
        return;
      }

      const lead = {
        name,
        phone,
        email,
        service,
        travelDate,
        travellers,
        message,
        createdAt: new Date().toISOString(),
        source: "contact-form",
      };

      saveLead(lead);

      const wantWhatsApp = confirm(
        "Your enquiry is saved. Do you want to open WhatsApp with details to contact us instantly?"
      );
      if (wantWhatsApp) {
        openWhatsAppWithLead(lead);
      }

      leadForm.reset();
      alert("Thank you! We will contact you soon.");
    });
  }

  // ----- Firestore se siteConfig load -----
  loadSiteConfig();
});

// ===== Firestore: siteConfig/main =====
async function loadSiteConfig() {
  try {
    const ref = doc(db, "siteConfig", "main");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("siteConfig/main document not found");
      return;
    }

    const cfg = snap.data();

    // ---- VIDEO LOGIC ----
    const rawVideoField = (cfg.youtubeVideoId || "").trim();
    const ytIframe = document.getElementById("ytVideo");
    const mp4Video = document.getElementById("mp4Video");
    const mp4Source = document.getElementById("mp4Source");

    if (rawVideoField && (rawVideoField.startsWith("http://") || rawVideoField.startsWith("https://"))) {
      // Direct video URL (GitHub RAW mp4 etc.)
      if (mp4Video && mp4Source) {
        mp4Source.src = rawVideoField;
        mp4Video.style.display = "block";
        mp4Video.load();
      }
      if (ytIframe) ytIframe.style.display = "none";
    } else if (rawVideoField) {
      // YouTube ID / URL
      const vid = extractYoutubeId(rawVideoField);
      if (ytIframe && vid) {
        ytIframe.src = "https://www.youtube.com/embed/" + vid;
        ytIframe.style.display = "block";
      }
      if (mp4Video) mp4Video.style.display = "none";
    }

    // ---- Footer text ----
    if (cfg.footerText) {
      const footerEl = document.getElementById("footerText");
      if (footerEl) footerEl.textContent = cfg.footerText;
    }

    // ---- Background image ----
    if (cfg.backgroundImageUrl && cfg.backgroundImageUrl.trim() !== "") {
      document.body.style.backgroundImage = `url('${cfg.backgroundImageUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center top";
    }
  } catch (err) {
    console.error("Error loading site config:", err);
  }
}
