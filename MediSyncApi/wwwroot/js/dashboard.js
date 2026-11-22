
/* ========================================
   PROFILE DATA
======================================== */


const currentUser = JSON.parse(
    localStorage.getItem("medisync_user") || "null"
);

const userName = currentUser?.name || "My Medications";

// Display registered user's name
const sidebarName = document.querySelector(".sidebar-user-name");

if (sidebarName) {
    sidebarName.textContent = currentUser?.name || "User Name";
}

// Display registered user's profile picture
const sidebarPicture = document.getElementById("sidebar-profile-picture");
const defaultAvatar = document.getElementById("sidebar-default-avatar");

if (currentUser?.photo && sidebarPicture && defaultAvatar) {
    sidebarPicture.src = currentUser.photo;
    sidebarPicture.style.display = "block";
    defaultAvatar.style.display = "none";
}

const profiles = {
    self: {
        name: userName,
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
const workspace = document.querySelector("main.workspace");
const profileButtons = document.querySelectorAll("[data-profile]");


/* ========================================
   GREETING
======================================== */

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";

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
            <p>Here’s your medication overview for today.</p>
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

    if (!profile) return;

    // Keep the original dashboard HTML visible.
    // Medication rendering will be added later.
}


/* ========================================
   PROFILE SWITCHING
======================================== */

function switchProfile(profileId) {
    const profile = profiles[profileId];

    if (!profile) return;

    if (selectedProfile) {
        selectedProfile.textContent = profile.name;
    }

    if (dropdownCurrentName) {
        dropdownCurrentName.textContent = profile.name;
    }

    profileButtons.forEach(button => {
        const isSelected = button.dataset.profile === profileId;

        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", isSelected);
    });

    renderDashboard(profileId);

    if (profileSelector) {
        profileSelector.open = false;
    }
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
