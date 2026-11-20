
/* ========================================
   PROFILE DATA
======================================== */

// Both profiles start without medication records.
// Medication data can be added to these arrays later.

const profiles = {
  self: {
    name: "My Medications",
    medications: []
  },

  mj: {
    name: "MJ Fenol",
    medications: []
  }
};


/* ========================================
   ELEMENTS
======================================== */

const profileSelector = document.getElementById("profile-selector");
const selectedProfile = document.getElementById("selected-profile");
const dropdownCurrentName = document.getElementById("dropdown-current-name");
const workspace = document.getElementById("workspace");

const profileButtons = document.querySelectorAll("[data-profile]");


/* ========================================
   GREETING
======================================== */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning!";
  }

  if (hour < 18) {
    return "Good afternoon!";
  }

  return "Good evening!";
}


/* ========================================
   EMPTY DASHBOARD
======================================== */

function renderEmptyDashboard(profileId) {
  const isOwnProfile = profileId === "self";

  const message = isOwnProfile
    ? "Add your medications to see your daily progress, upcoming doses, and refill reminders here."
    : `There are no medications added to ${profiles[profileId].name}'s profile yet.`;

  const action = isOwnProfile
    ? `
      <a href="medications.html" class="empty-dashboard-button">
        <i class="fa-solid fa-plus"></i>
        <span>Go to Medications</span>
      </a>
    `
    : "";

  workspace.innerHTML = `
    <section class="greeting">
      <h1>${getGreeting()}</h1>

      <p>
        Here’s your medication overview for today.
      </p>
    </section>

    <section class="empty-dashboard">

      <div class="empty-dashboard-icon">
        <i class="fa-solid fa-capsules"></i>
      </div>

      <h2>No medications yet</h2>

      <p>${message}</p>

      ${action}

    </section>
  `;
}


/* ========================================
   DASHBOARD RENDERING
======================================== */

function renderDashboard(profileId) {
  const profile = profiles[profileId];

  if (!profile) {
    return;
  }

  // Currently, both profiles have empty medication arrays.
  // Show the empty state when no medication records exist.

  if (profile.medications.length === 0) {
    renderEmptyDashboard(profileId);
    return;
  }

  // Populated dashboard rendering can be added here
  // when actual medication records are available.
}


/* ========================================
   PROFILE SWITCHING
======================================== */

function switchProfile(profileId) {
  const profile = profiles[profileId];

  if (!profile) {
    return;
  }

  // Update selected profile label.
  selectedProfile.textContent = profile.name;

  // Update current profile name inside dropdown.
  dropdownCurrentName.textContent = profile.name;

  // Update selected profile indicator.
  profileButtons.forEach(button => {
    const isSelected = button.dataset.profile === profileId;

    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });

  // Render the selected profile's dashboard.
  renderDashboard(profileId);

  // Close dropdown after selection.
  profileSelector.open = false;
}


/* ========================================
   PROFILE BUTTON EVENTS
======================================== */

profileButtons.forEach(button => {
  button.addEventListener("click", () => {
    const profileId = button.dataset.profile;

    switchProfile(profileId);
  });
});


/* ========================================
   INITIAL DASHBOARD
======================================== */

switchProfile("self");
