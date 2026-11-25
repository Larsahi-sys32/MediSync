
// ========================================
// MEDISYNC - PROFILE SELECTOR
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const profileSelector =
    document.getElementById("profile-selector");

  const selectedProfile =
    document.getElementById("selected-profile");

  const dropdownCurrentName =
    document.getElementById("dropdown-current-name");

  const dropdownCurrentProfile =
    document.querySelector(".dropdown-current-profile");


  // Check required elements.

  if (
    !profileSelector ||
    !selectedProfile ||
    !dropdownCurrentName ||
    !dropdownCurrentProfile
  ) {
    console.error("Profile selector: Required HTML elements not found.");
    return;
  }


  // Close dropdown when clicking current profile.

  dropdownCurrentProfile.addEventListener("click", () => {
    profileSelector.open = false;
  });


  // Switch connected profile.

  document.querySelectorAll(".connected-profile").forEach(profile => {

    profile.addEventListener("click", () => {

      const name = profile.dataset.profile;

      if (!name) return;

      selectedProfile.textContent = name;

      dropdownCurrentName.textContent = name;

      profileSelector.open = false;

    });

  });

});