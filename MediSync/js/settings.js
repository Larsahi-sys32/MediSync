
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


/* ========================================
   SETTINGS MODALS
   Privacy & Security + People I Care For
   The overlay is appended to .workspace (position: relative),
   so it only covers the settings box, not the whole page.
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const workspace = document.querySelector(".workspace");
  const privacySection = document.querySelector("#priv-sec");
  const careSection = document.querySelector("#picf");

  if (!workspace || (!privacySection && !careSection)) return;

  /* ---------- Mock data (frontend only) ---------- */

  const state = {
    twoFactorEnabled: false,
    twoFactorMethod: "app",
    permissions: {
      notifications: true,
      camera: false,
      photos: false,
      calendar: true,
    },
    people: [
      { id: "p1", name: "Maria Florendo", relation: "Mother", access: "manage" },
      { id: "p2", name: "Lito Florendo", relation: "Father", access: "view" },
    ],
    requests: [
      { id: "r1", name: "Ana Reyes", detail: "Wants to connect as caregiver" },
      { id: "r2", name: "Dr. Santos", detail: "Wants to view your medication records" },
    ],
  };

  /* ---------- Overlay shell ---------- */

  const overlay = document.createElement("div");
  overlay.className = "settings-modal-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div class="settings-modal-header">
        <div>
          <h2 id="settings-modal-title"></h2>
          <p id="settings-modal-desc"></p>
        </div>
        <button type="button" class="settings-modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="settings-modal-body"></div>
      <div class="settings-modal-footer"></div>
    </div>
  `;
  workspace.appendChild(overlay);

  const titleEl = overlay.querySelector("#settings-modal-title");
  const descEl = overlay.querySelector("#settings-modal-desc");
  const bodyEl = overlay.querySelector(".settings-modal-body");
  const footerEl = overlay.querySelector(".settings-modal-footer");
  const closeBtn = overlay.querySelector(".settings-modal-close");

  let lastTrigger = null;

  function openModal(trigger, config) {
    lastTrigger = trigger;
    render(config);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    const firstField = bodyEl.querySelector("input, select, button");
    (firstField || closeBtn).focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (lastTrigger) lastTrigger.focus();
  }

  function render(config) {
    titleEl.textContent = config.title;
    descEl.textContent = config.description || "";
    bodyEl.innerHTML = "";
    footerEl.innerHTML = "";
    config.build(bodyEl, footerEl);
  }

  function addFooterButton(label, className, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    footerEl.appendChild(btn);
    return btn;
  }

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* ---------- Helpers ---------- */

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function switchHtml(id, checked, label) {
    return `
      <label class="switch">
        <input type="checkbox" role="switch" id="${id}" aria-label="${label}" ${checked ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;
  }

  /* ========================================
     PRIVACY & SECURITY MODALS
  ======================================== */

  const privacyModals = {
    "Change Password": {
      title: "Change Password",
      description: "Choose a strong password you don't use elsewhere.",
      build(body, footer) {
        body.innerHTML = `
          <div class="settings-field">
            <label for="pw-current">Current password</label>
            <input type="password" id="pw-current" autocomplete="current-password">
            <p class="settings-field-error" data-for="pw-current"></p>
          </div>
          <div class="settings-field">
            <label for="pw-new">New password</label>
            <input type="password" id="pw-new" autocomplete="new-password">
            <p class="settings-field-error" data-for="pw-new"></p>
          </div>
          <div class="settings-field">
            <label for="pw-confirm">Confirm new password</label>
            <input type="password" id="pw-confirm" autocomplete="new-password">
            <p class="settings-field-error" data-for="pw-confirm"></p>
          </div>
        `;

        const setError = (id, message) => {
          body.querySelector(`[data-for="${id}"]`).textContent = message;
          body.querySelector(`#${id}`).closest(".settings-field")
            .classList.toggle("has-error", Boolean(message));
        };

        addFooterButton("Cancel", "settings-modal-secondary", closeModal);
        addFooterButton("Update password", "settings-modal-primary", () => {
          const current = body.querySelector("#pw-current").value;
          const next = body.querySelector("#pw-new").value;
          const confirm = body.querySelector("#pw-confirm").value;

          setError("pw-current", current ? "" : "Enter your current password.");
          setError(
            "pw-new",
            next.length >= 8 ? "" : "Use at least 8 characters."
          );
          setError(
            "pw-confirm",
            confirm && confirm === next ? "" : "Passwords do not match."
          );

          if (!current || next.length < 8 || confirm !== next) return;

          body.innerHTML = `<p class="settings-modal-success">Your password has been updated.</p>`;
          footer.innerHTML = "";
          addFooterButton("Done", "settings-modal-primary", closeModal);
        });
      },
    },

    "Two-Factor Authentication": {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      build(body) {
        body.innerHTML = `
          <div class="settings-modal-toggle-row">
            <div>
              <strong>Require a verification code</strong>
              <span class="hint">Asked each time you sign in on a new device</span>
            </div>
            ${switchHtml("tfa-toggle", state.twoFactorEnabled, "Enable two-factor authentication")}
          </div>

          <div id="tfa-methods" ${state.twoFactorEnabled ? "" : "hidden"}>
            <label class="settings-modal-choice">
              <input type="radio" name="tfa-method" value="app" ${state.twoFactorMethod === "app" ? "checked" : ""}>
              <span><strong>Authenticator app</strong><span class="hint" style="display:block">Use a code from an app on your phone</span></span>
            </label>
            <label class="settings-modal-choice" style="margin-top:10px">
              <input type="radio" name="tfa-method" value="sms" ${state.twoFactorMethod === "sms" ? "checked" : ""}>
              <span><strong>Text message (SMS)</strong><span class="hint" style="display:block">Receive a code on your phone number</span></span>
            </label>
          </div>
        `;

        const toggle = body.querySelector("#tfa-toggle");
        const methods = body.querySelector("#tfa-methods");

        toggle.addEventListener("change", () => {
          state.twoFactorEnabled = toggle.checked;
          methods.hidden = !toggle.checked;
        });

        body.querySelectorAll('input[name="tfa-method"]').forEach(radio => {
          radio.addEventListener("change", () => {
            state.twoFactorMethod = radio.value;
          });
        });

        addFooterButton("Done", "settings-modal-primary", closeModal);
      },
    },

    "Permissions": {
      title: "Permissions",
      description: "Manage what MediSync can access on your device.",
      build(body) {
        const items = [
          { key: "notifications", label: "Notifications", hint: "Dose reminders and alerts" },
          { key: "camera", label: "Camera", hint: "Scan medication labels" },
          { key: "photos", label: "Photos & files", hint: "Attach images to bug reports" },
          { key: "calendar", label: "Calendar", hint: "Show medication schedules in your calendar" },
        ];

        body.innerHTML = items.map(item => `
          <div class="settings-modal-toggle-row">
            <div>
              <strong>${item.label}</strong>
              <span class="hint">${item.hint}</span>
            </div>
            ${switchHtml(`perm-${item.key}`, state.permissions[item.key], item.label)}
          </div>
        `).join("");

        items.forEach(item => {
          body.querySelector(`#perm-${item.key}`).addEventListener("change", event => {
            state.permissions[item.key] = event.target.checked;
          });
        });

        addFooterButton("Done", "settings-modal-primary", closeModal);
      },
    },

    "Delete Account": {
      title: "Delete Account",
      description: "This permanently removes your account and all medication records.",
      build(body, footer) {
        body.innerHTML = `
          <p class="settings-modal-note">
            This action cannot be undone. To confirm, type <strong>DELETE</strong> below.
          </p>
          <div class="settings-field">
            <label for="delete-confirm">Confirmation</label>
            <input type="text" id="delete-confirm" autocomplete="off" placeholder="DELETE">
          </div>
        `;

        addFooterButton("Cancel", "settings-modal-secondary", closeModal);
        const confirmBtn = addFooterButton(
          "Delete account",
          "settings-modal-primary is-danger",
          () => {
            // Mock only: no backend, so just return to the login page.
            window.location.href = "index.html";
          }
        );
        confirmBtn.disabled = true;

        body.querySelector("#delete-confirm").addEventListener("input", event => {
          confirmBtn.disabled = event.target.value.trim() !== "DELETE";
        });
      },
    },
  };

  /* ========================================
     PEOPLE I CARE FOR MODALS
  ======================================== */

  const careModals = {
    "Manage profiles": {
      title: "Manage profiles",
      description: "View and manage the people you care for.",
      build(body) {
        const draw = () => {
          if (!state.people.length) {
            body.innerHTML = `<p class="settings-modal-empty">You are not caring for anyone yet.</p>`;
            return;
          }

          body.innerHTML = `
            <ul class="settings-modal-list">
              ${state.people.map(person => `
                <li class="settings-modal-list-item">
                  <div class="settings-modal-person">
                    <i class="fa-solid fa-circle-user"></i>
                    <div>
                      <strong>${escapeHtml(person.name)}</strong>
                      <span>${escapeHtml(person.relation)}</span>
                    </div>
                  </div>
                  <div class="settings-modal-inline-actions">
                    <button type="button" class="is-remove" data-remove="${person.id}">Remove</button>
                  </div>
                </li>
              `).join("")}
            </ul>
          `;

          body.querySelectorAll("[data-remove]").forEach(btn => {
            btn.addEventListener("click", () => {
              state.people = state.people.filter(p => p.id !== btn.dataset.remove);
              draw();
            });
          });
        };

        draw();
        addFooterButton("Done", "settings-modal-primary", closeModal);
      },
    },

    "Connection requests": {
      title: "Connection requests",
      description: "Manage requests to connect with other users.",
      build(body) {
        const draw = () => {
          if (!state.requests.length) {
            body.innerHTML = `<p class="settings-modal-empty">No pending requests.</p>`;
            return;
          }

          body.innerHTML = `
            <ul class="settings-modal-list">
              ${state.requests.map(req => `
                <li class="settings-modal-list-item">
                  <div class="settings-modal-person">
                    <i class="fa-solid fa-circle-user"></i>
                    <div>
                      <strong>${escapeHtml(req.name)}</strong>
                      <span>${escapeHtml(req.detail)}</span>
                    </div>
                  </div>
                  <div class="settings-modal-inline-actions">
                    <button type="button" data-decline="${req.id}">Decline</button>
                    <button type="button" class="is-accept" data-accept="${req.id}">Accept</button>
                  </div>
                </li>
              `).join("")}
            </ul>
          `;

          body.querySelectorAll("[data-decline]").forEach(btn => {
            btn.addEventListener("click", () => {
              state.requests = state.requests.filter(r => r.id !== btn.dataset.decline);
              draw();
            });
          });

          body.querySelectorAll("[data-accept]").forEach(btn => {
            btn.addEventListener("click", () => {
              const req = state.requests.find(r => r.id === btn.dataset.accept);
              if (req) {
                state.people.push({
                  id: `p-${req.id}`,
                  name: req.name,
                  relation: "Connected user",
                  access: "view",
                });
              }
              state.requests = state.requests.filter(r => r.id !== btn.dataset.accept);
              draw();
            });
          });
        };

        draw();
        addFooterButton("Done", "settings-modal-primary", closeModal);
      },
    },

    "Access permissions": {
      title: "Access permissions",
      description: "Choose who can view and manage medication records.",
      build(body) {
        if (!state.people.length) {
          body.innerHTML = `<p class="settings-modal-empty">No connected people yet.</p>`;
          addFooterButton("Done", "settings-modal-primary", closeModal);
          return;
        }

        body.innerHTML = `
          <ul class="settings-modal-list">
            ${state.people.map(person => `
              <li class="settings-modal-list-item">
                <div class="settings-modal-person">
                  <i class="fa-solid fa-circle-user"></i>
                  <div>
                    <strong>${escapeHtml(person.name)}</strong>
                    <span>${escapeHtml(person.relation)}</span>
                  </div>
                </div>
                <select class="settings-modal-select" data-access="${person.id}" aria-label="Access level for ${escapeHtml(person.name)}">
                  <option value="none" ${person.access === "none" ? "selected" : ""}>No access</option>
                  <option value="view" ${person.access === "view" ? "selected" : ""}>View only</option>
                  <option value="manage" ${person.access === "manage" ? "selected" : ""}>View &amp; manage</option>
                </select>
              </li>
            `).join("")}
          </ul>
        `;

        body.querySelectorAll("[data-access]").forEach(select => {
          select.addEventListener("change", () => {
            const person = state.people.find(p => p.id === select.dataset.access);
            if (person) person.access = select.value;
          });
        });

        addFooterButton("Done", "settings-modal-primary", closeModal);
      },
    },
  };

  /* ---------- Wire up the buttons ---------- */

  function bindSection(section, modals) {
    if (!section) return;

    section.querySelectorAll(":scope > .settings-row").forEach(row => {
      const label = row.querySelector(".title")?.textContent.trim();
      const button = row.querySelector(".rs-action-button");
      const config = modals[label];

      if (!button || !config) return;

      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => openModal(button, config));
    });
  }

  bindSection(privacySection, privacyModals);
  bindSection(careSection, careModals);
});
