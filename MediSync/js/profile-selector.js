    const profileSelector = document.getElementById("profile-selector");
    const selectedProfile = document.getElementById("selected-profile");
    const dropdownCurrentName = document.getElementById("dropdown-current-name");
    const dropdownCurrentProfile = document.querySelector(
      ".dropdown-current-profile"
    );

    dropdownCurrentProfile.addEventListener("click", () => {
      profileSelector.open = false;
    });

    document.querySelectorAll(".connected-profile").forEach(profile => {
      profile.addEventListener("click", () => {
        const name = profile.dataset.profile;

        selectedProfile.textContent = name;
        dropdownCurrentName.textContent = name;

        profileSelector.open = false;
      });
    });