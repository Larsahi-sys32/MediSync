
/* ========================================
   SETTINGS PAGE INTERACTIONS
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const workspace = document.querySelector(".workspace");
  const settingsContent = document.querySelector(".settings-content");
  const settingsNav = document.querySelector(".settings-nav-bar");

  if (!workspace || !settingsContent || !settingsNav) return;

  /* ========================================
     PERSONAL INFORMATION
  ======================================== */

  const personalInfo = document.querySelector("#perso-info");

  const personalValues = {
    "Full Name": "Cyrus Florendo",
    "Email Address": "cyruspogi178@gmail.com",
    "Date of Birth": "October 27, 2004",
    "Phone Number": "+63 XXX XXX XXXX",
  };

  if (personalInfo) {
    let rows = [...personalInfo.querySelectorAll(":scope > .settings-row")];

    const existingLabels = rows.map(row =>
      row.querySelector(".subtitle")?.textContent.trim()
    );

    rows.forEach(row => {
      const label = row.querySelector(".subtitle")?.textContent.trim();
      const value = row.querySelector(".pi-value");
      const editButton = row.querySelector(".rs-action-button");

      if (!label || !value || !editButton || !(label in personalValues)) return;

      value.textContent = personalValues[label];
      editButton.type = "button";
      editButton.setAttribute("aria-label", `Edit ${label.toLowerCase()}`);

      editButton.addEventListener("click", () => {
        if (row.classList.contains("is-editing")) return;

        const originalValue = value.textContent;

        const input = document.createElement("input");
        input.className = "settings-edit-input";
        input.type = "text";
        input.value = originalValue;
        input.setAttribute("aria-label", label);

        const actions = document.createElement("div");
        actions.className = "settings-edit-actions";

        actions.innerHTML = `
          <button type="button" class="settings-edit-cancel">Cancel</button>
          <button type="button" class="settings-edit-save">Save</button>
        `;

        value.replaceWith(input);
        editButton.replaceWith(actions);
        row.classList.add("is-editing");

        input.focus();
        input.select();

        actions.querySelector(".settings-edit-cancel").addEventListener("click", () => {
          input.replaceWith(value);
          actions.replaceWith(editButton);
          row.classList.remove("is-editing");
        });

        actions.querySelector(".settings-edit-save").addEventListener("click", () => {
          const nextValue = input.value.trim();

          if (!nextValue) {
            input.focus();
            return;
          }

          personalValues[label] = nextValue;
          value.textContent = nextValue;

          input.replaceWith(value);
          actions.replaceWith(editButton);
          row.classList.remove("is-editing");
        });
      });
    });
  }

  /* ========================================
     SETTINGS SECTION NAVIGATION
  ======================================== */

  const sectionLinks = [...settingsNav.querySelectorAll('a[href^="#"]')];

  const sections = sectionLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setActiveSection(sectionId) {
    sectionLinks.forEach(link => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  sectionLinks.forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      setActiveSection(target.id);
    });
  });

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleSections.length) {
        setActiveSection(visibleSections[0].target.id);
      }
    }, {
      root: settingsContent,
      rootMargin: "-12% 0px -68% 0px",
      threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  /* ========================================
     PROFILE PICTURE SELECTOR
  ======================================== */

  const profileButton = settingsNav.querySelector(".pfp-select");

  if (!profileButton) return;

  const overlay = document.createElement("div");
  overlay.className = "settings-pfp-overlay";
  overlay.setAttribute("aria-hidden", "true");

  overlay.innerHTML = `
    <div class="settings-pfp-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-pfp-title">

      <button class="settings-pfp-close" type="button"
        aria-label="Close">&times;</button>

      <div class="settings-pfp-preview">
        <div class="settings-pfp-preview-image">
          <i class="fa-solid fa-circle-user"></i>
        </div>

        <label class="settings-pfp-upload" for="settings-pfp-file">
          Upload Picture
        </label>

        <input id="settings-pfp-file" type="file"
          accept="image/*" hidden>
      </div>

      <div class="settings-pfp-options">

        <div class="settings-pfp-group">
          <h2 id="settings-pfp-title">Recent Profile Pictures</h2>

          <div class="settings-pfp-choices">
            <button class="settings-pfp-choice"
              type="button"
              data-preset="orange"
              aria-label="Recent profile picture"
              aria-pressed="false">
              <i class="fa-regular fa-user" style="color:#E28A00"></i>
            </button>
          </div>
        </div>

        <div class="settings-pfp-group">
          <h2>Presets</h2>

          <div class="settings-pfp-choices">
            <button class="settings-pfp-choice"
              type="button"
              data-preset="orange"
              aria-label="Orange profile picture"
              aria-pressed="false">
              <i class="fa-regular fa-user" style="color:#E28A00"></i>
            </button>

            <button class="settings-pfp-choice"
              type="button"
              data-preset="red"
              aria-label="Red profile picture"
              aria-pressed="false">
              <i class="fa-regular fa-user" style="color:#E53935"></i>
            </button>

            <button class="settings-pfp-choice"
              type="button"
              data-preset="navy"
              aria-label="Blue profile picture"
              aria-pressed="true">
              <i class="fa-regular fa-user" style="color:var(--navy)"></i>
            </button>
          </div>
        </div>

        <div class="settings-pfp-footer">
          <button class="settings-pfp-cancel" type="button">Cancel</button>
          <button class="settings-pfp-save" type="button">Save</button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const preview = overlay.querySelector(".settings-pfp-preview-image");
  const fileInput = overlay.querySelector("#settings-pfp-file");
  const choices = [...overlay.querySelectorAll(".settings-pfp-choice")];

  const closeButton = overlay.querySelector(".settings-pfp-close");
  const cancelButton = overlay.querySelector(".settings-pfp-cancel");
  const saveButton = overlay.querySelector(".settings-pfp-save");

  let selectedPreset = "navy";
  let uploadedImageUrl = null;

  function openProfileOverlay() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeProfileOverlay() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
    profileButton.focus();
  }

  function selectPreset(preset, button) {
    selectedPreset = preset;
    uploadedImageUrl = null;

    const color =
      preset === "orange" ? "#E28A00" :
      preset === "red" ? "#E53935" :
      "var(--navy)";

    preview.innerHTML = `
      <i class="fa-solid fa-circle-user" style="color:${color}"></i>
    `;

    choices.forEach(choice => {
      choice.setAttribute("aria-pressed", String(choice === button));
    });
  }

  profileButton.addEventListener("click", openProfileOverlay);

  closeButton.addEventListener("click", closeProfileOverlay);
  cancelButton.addEventListener("click", closeProfileOverlay);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeProfileOverlay();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeProfileOverlay();
    }
  });

  choices.forEach(choice => {
    choice.addEventListener("click", () => {
      selectPreset(choice.dataset.preset, choice);
    });
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];

    if (!file) return;

    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    uploadedImageUrl = URL.createObjectURL(file);
    preview.innerHTML = "";

    const image = document.createElement("img");
    image.src = uploadedImageUrl;
    image.alt = "Selected profile picture preview";

    preview.appendChild(image);

    choices.forEach(choice => {
      choice.setAttribute("aria-pressed", "false");
    });
  });

  saveButton.addEventListener("click", () => {
    if (uploadedImageUrl) {
      profileButton.innerHTML = `
        <img src="${uploadedImageUrl}"
          alt="Profile picture"
          style="width:42px;height:42px;object-fit:cover;border-radius:50%">
      `;
    } else {
      const color =
        selectedPreset === "orange" ? "#E28A00" :
        selectedPreset === "red" ? "#E53935" :
        "var(--navy)";

      profileButton.innerHTML = `
        <i class="fa-solid fa-circle-user" style="color:${color}"></i>
      `;
    }

    closeProfileOverlay();
  });
});
