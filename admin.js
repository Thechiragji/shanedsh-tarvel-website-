document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("adminApp");
  const PASSWORD = "ASTravel@123"; // simple password – CHANGE THIS

  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem("as_travel_leads") || "[]");
    } catch (e) {
      return [];
    }
  }

  function renderLogin() {
    app.innerHTML = `
      <div class="card login-card">
        <h1>Admin Login</h1>
        <p class="login-note">
          This admin panel reads leads stored in this browser's local storage.
          Use it mainly for testing on your own system.
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

  function renderDashboard() {
    const leads = getLeads();
    const totalLeads = leads.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayLeads = leads.filter((l) =>
      (l.createdAt || "").slice(0, 10) === today
    ).length;
    const fromContact = leads.filter((l) => l.source === "contact-form").length;
    const fromQuick = leads.filter((l) => l.source === "quick-form").length;

    const rows = leads
      .slice()
      .reverse()
      .map((lead, index) => {
        const created = lead.createdAt
          ? new Date(lead.createdAt).toLocaleString()
          : "";
        const badgeClass =
          lead.source === "quick-form" ? "badge-quick" : "badge-contact";
        const badgeText =
          lead.source === "quick-form" ? "Quick Form" : "Contact Form";

        return `
        <tr>
          <td>${index + 1}</td>
          <td>${lead.name || ""}</td>
          <td>${lead.phone || ""}</td>
          <td>${lead.email || ""}</td>
          <td>${lead.service || ""}</td>
          <td>${lead.travelDate || ""}</td>
          <td>${lead.travellers || ""}</td>
          <td>${lead.message ? lead.message.replace(/\n/g, " ") : ""}</td>
          <td><span class="badge-source ${badgeClass}">${badgeText}</span></td>
          <td>${created}</td>
        </tr>
      `;
      })
      .join("");

    app.innerHTML = `
      <div class="admin-header">
        <div>
          <div class="admin-title">A S Tour & Travels – Admin Panel</div>
          <div style="font-size:0.8rem;color:#9ca3af;">Local Leads Viewer</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="tag-admin">Local Mode</span>
          <button class="btn btn-outline small-btn" id="logoutBtn">Logout</button>
        </div>
      </div>

      <div class="admin-main">
        <aside class="admin-sidebar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>Overview</span>
          </div>
          <div class="admin-summary">
            <div class="admin-summary-card">
              All Leads
              <strong>${totalLeads}</strong>
            </div>
            <div class="admin-summary-card">
              Today
              <strong>${todayLeads}</strong>
            </div>
            <div class="admin-summary-card">
              Contact / Quick
              <strong>${fromContact} / ${fromQuick}</strong>
            </div>
          </div>
          <p style="margin-top:10px; font-size:0.75rem; color:#9ca3af;">
            Note: Only leads generated from this browser are visible here.
            For real multi-device admin, connect the forms to a backend (e.g. Firebase).
          </p>
        </aside>

        <main class="admin-content">
          ${
            totalLeads === 0
              ? `<p style="color:#9ca3af;font-size:0.85rem;">No leads found yet. Submit some forms on the main website first.</p>`
              : `
            <div style="overflow-x:auto; max-height:65vh;">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Travel Date</th>
                    <th>Travellers</th>
                    <th>Message</th>
                    <th>Source</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `
          }
        </main>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("as_admin_logged_in");
      renderLogin();
    });
  }

  const isLoggedIn = sessionStorage.getItem("as_admin_logged_in") === "1";
  if (isLoggedIn) {
    renderDashboard();
  } else {
    renderLogin();
  }
});
