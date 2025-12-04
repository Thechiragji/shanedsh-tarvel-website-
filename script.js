// script.js  (MODULE)

// ✅ Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ YOUR Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAixaw3PtDNvLEinV3i_c9CUUza27YhzU",
  authDomain: "as-tour-travels.firebaseapp.com",
  projectId: "as-tour-travels",
  storageBucket: "as-tour-travels.appspot.com",
  messagingSenderId: "826916058476",
  appId: "1:826916058476:web:a4193114f04d908cd2ef49",
  measurementId: "G-38B1S8HMH6"
};

// Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =================== DOM READY ===================
document.addEventListener("DOMContentLoaded", function () {
  // ----- Navbar -----
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

  // ----- Footer year -----
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ----- LocalStorage helper for leads -----
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

  // ----- Quick Enquiry form -----
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

  // ----- Main lead form -----
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

  // 🔥 Load config (video, footer, background) from Firestore
  loadSiteConfig();
});

// ================= FIRESTORE CONFIG LOADER =================

async function loadSiteConfig() {
  try {
    const ref = doc(db, "siteConfig", "main");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("No siteConfig/main doc found in Firestore.");
      return;
    }

    const cfg = snap.data();

    // 1) YouTube Video
    if (cfg.youtubeVideoId) {
      const iframe = document.getElementById("mainVideo");
      if (iframe) {
        iframe.src = "https://www.youtube.com/embed/" + cfg.youtubeVideoId;
      }
    }

    // 2) Footer text
    if (cfg.footerText) {
      const footer = document.getElementById("footerText");
      if (footer) {
        footer.textContent = cfg.footerText;
      }
    }

    // 3) Background image
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
