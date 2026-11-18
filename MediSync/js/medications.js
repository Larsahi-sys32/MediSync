/* ========================================
   MEDISYNC - MEDICATIONS FRONTEND
   Frontend demo only. Data is stored locally.
======================================== */

const STORAGE_KEYS = {
  medications: "medisync_medications",
  drafts: "medisync_medication_drafts"
};

const medicationTabs = [...document.querySelectorAll(".medication-tab")];
const medicationPanels = {
  list: document.getElementById("medlist-panel"),
  add: document.getElementById("addmed-panel")
};

const medicationForm = document.getElementById("medication-form");
const formSteps = [...document.querySelectorAll(".form-step")];
const pageIndicator = document.getElementById("page-indicator");
const stepDots = [...pageIndicator.querySelectorAll(".dot")];

const medicationList = document.getElementById("medication-list");
const emptyMedications = document.getElementById("empty-medications");
const medicationTotal = document.getElementById("medication-total");
const medicationSearch = document.getElementById("medication-search");
const medicationFilter = document.getElementById("medication-filter");

const formType = document.getElementById("medication-form-type");
const quantityInput = document.getElementById("quantity-available");
const quantityGroup = document.getElementById("quantity-group");
const quantityUnit = document.getElementById("quantity-unit");

const frequencyGroup = document.getElementById("frequency-group");
const frequencySelect = document.getElementById("frequency");
const intervalGroup = document.getElementById("interval-group");
const intervalSelect = document.getElementById("take-every");
const reminderList = document.getElementById("reminder-list");

const customImageInput = document.getElementById("custom-image");
const imagePreview = document.getElementById("image-preview");
const fileNameText = document.getElementById("file-name-text");
const presetButtons = [...document.querySelectorAll(".preset-item")];
const removeImageButton = document.getElementById("remove-image");

const draftsModal = document.getElementById("drafts-modal");
const draftList = document.getElementById("draft-list");
const draftCount = document.getElementById("draft-count");
const toast = document.getElementById("medication-toast");

let currentStep = 0;
let selectedImage = { type: "preset", value: "bottle" };
let uploadedImageUrl = null;
let toastTimeout = null;

let medications = readStorage(STORAGE_KEYS.medications, []);
let drafts = readStorage(STORAGE_KEYS.drafts, []);

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

/* MAIN TABS */
function switchMainTab(tabName) {
  const showList = tabName === "list";

  medicationPanels.list.hidden = !showList;
  medicationPanels.add.hidden = showList;

  medicationTabs.forEach(tab => {
    const isActive = (showList && tab.id === "medlist-tab") ||
                     (!showList && tab.id === "addmed-tab");
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  if (!showList) {
    updateDraftCount();
  }
}

medicationTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    switchMainTab(tab.id === "medlist-tab" ? "list" : "add");
  });
});

medicationTabs.forEach((tab, index) => {
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % medicationTabs.length
      : (index - 1 + medicationTabs.length) % medicationTabs.length;
    medicationTabs[nextIndex].focus();
    medicationTabs[nextIndex].click();
  });
});

document.querySelectorAll("[data-open-add]").forEach(button => {
  button.addEventListener("click", () => {
    resetForm();
    switchMainTab("add");
  });
});

/* FOUR-STEP FORM */
function showStep(index) {
  currentStep = Math.max(0, Math.min(index, formSteps.length - 1));

  formSteps.forEach((step, stepIndex) => {
    const isActive = stepIndex === currentStep;
    step.hidden = !isActive;
    step.classList.toggle("active", isActive);
  });

  stepDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentStep);
  });

  pageIndicator.setAttribute("aria-label", `Step ${currentStep + 1} of ${formSteps.length}`);

  document.querySelectorAll(".btn-prev").forEach(button => {
    button.disabled = currentStep === 0;
  });

  document.querySelectorAll(".btn-next").forEach(button => {
    button.disabled = currentStep === formSteps.length - 1;
  });
}

function validateStep(index) {
  const step = formSteps[index];
  const fields = [...step.querySelectorAll("input, select, textarea")]
    .filter(field => field.required && !field.disabled);

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }

  if (index === 1) {
    const scheduleType = medicationForm.querySelector('input[name="schedule_type"]:checked');
    if (!scheduleType) {
      showToast("Choose a schedule type to continue.");
      return false;
    }

    const reminderTimes = [...reminderList.querySelectorAll('input[type="time"]')];
    if (!reminderTimes.some(input => input.value)) {
      reminderTimes[0]?.focus();
      showToast("Add at least one reminder time.");
      return false;
    }
  }

  return true;
}

document.querySelectorAll(".btn-next").forEach(button => {
  button.addEventListener("click", () => {
    if (validateStep(currentStep)) showStep(currentStep + 1);
  });
});

document.querySelectorAll(".btn-prev").forEach(button => {
  button.addEventListener("click", () => showStep(currentStep - 1));
});

/* QUANTITY AVAILABLE */
const countableForms = new Set(["Tablet", "Capsule"]);

function updateQuantityAvailability() {
  const isCountable = countableForms.has(formType.value);
  quantityInput.disabled = !isCountable;
  quantityGroup.classList.toggle("is-disabled", !isCountable);
  quantityUnit.textContent = isCountable
    ? (formType.value === "Tablet" ? "Tablets" : "Capsules")
    : "Select a countable form";

  if (!isCountable) quantityInput.value = "";
}

formType.addEventListener("change", updateQuantityAvailability);

/* SCHEDULE TYPE */
function updateScheduleFields() {
  const selectedType = medicationForm.querySelector('input[name="schedule_type"]:checked')?.value;
  const isInterval = selectedType === "interval";

  frequencyGroup.hidden = isInterval;
  frequencySelect.disabled = isInterval;
  frequencySelect.required = !isInterval;

  intervalGroup.hidden = !isInterval;
  intervalSelect.disabled = !isInterval;
  intervalSelect.required = isInterval;
}

medicationForm.querySelectorAll('input[name="schedule_type"]').forEach(radio => {
  radio.addEventListener("change", updateScheduleFields);
});

/* MULTIPLE REMINDER TIMES */
function updateReminderRemoveButtons() {
  const rows = [...reminderList.querySelectorAll(".reminder-row")];
  rows.forEach(row => {
    row.querySelector(".remove-reminder").disabled = rows.length === 1;
  });
}

function addReminderRow(value = "") {
  const row = document.createElement("div");
  row.className = "reminder-row";
  row.innerHTML = `
    <input type="time" name="reminder_times[]" aria-label="Reminder time" required>
    <button type="button" class="remove-reminder" aria-label="Remove reminder">
      <i class="fa-solid fa-minus"></i>
    </button>
  `;

  const input = row.querySelector("input");
  input.value = value;
  row.querySelector(".remove-reminder").addEventListener("click", () => {
    row.remove();
    updateReminderRemoveButtons();
  });

  reminderList.appendChild(row);
  updateReminderRemoveButtons();
}

document.getElementById("add-reminder").addEventListener("click", () => {
  addReminderRow();
  reminderList.lastElementChild?.querySelector("input")?.focus();
});

/* IMAGE PREVIEW */
function setPresetImage(preset) {
  selectedImage = { type: "preset", value: preset };
  uploadedImageUrl = null;
  customImageInput.value = "";
  fileNameText.textContent = "No file chosen";

  const iconMap = {
    bottle: "fa-prescription-bottle-medical",
    tablet: "fa-tablets",
    capsule: "fa-capsules",
    pills: "fa-pills"
  };

  imagePreview.innerHTML = `
    <i class="fa-solid ${iconMap[preset] || iconMap.bottle}" aria-hidden="true"></i>
    <span>${escapeHTML(preset.charAt(0).toUpperCase() + preset.slice(1))} preset</span>
  `;

  presetButtons.forEach(button => {
    const isSelected = button.dataset.preset === preset;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

presetButtons.forEach(button => {
  button.addEventListener("click", () => setPresetImage(button.dataset.preset));
});

customImageInput.addEventListener("change", () => {
  const file = customImageInput.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.");
    customImageInput.value = "";
    return;
  }

  if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageUrl = URL.createObjectURL(file);
  selectedImage = { type: "upload", value: file.name };

  imagePreview.innerHTML = `<img src="${uploadedImageUrl}" alt="Selected medication image preview">`;
  fileNameText.textContent = file.name;
  presetButtons.forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
});

removeImageButton.addEventListener("click", () => {
  setPresetImage("bottle");
});

function getImageData() {
  return selectedImage;
}

/* FORM DATA */
function getFormData() {
  const formData = new FormData(medicationForm);
  const reminderTimes = formData.getAll("reminder_times[]").filter(Boolean);

  return {
    id: `med-${Date.now()}`,
    name: formData.get("medication_name")?.trim() || "",
    strength: formData.get("strength")?.trim() || "",
    form: formData.get("form") || "",
    doseAmount: formData.get("dose_amount")?.trim() || "",
    quantityAvailable: formData.get("quantity_available") || "",
    scheduleType: formData.get("schedule_type") || "daily",
    frequency: formData.get("frequency") || "",
    takeEvery: formData.get("take_every") || "",
    reminderTimes,
    startDate: formData.get("start_date") || "",
    endDate: formData.get("end_date") || "",
    prescribingDoctor: formData.get("prescribing_doctor")?.trim() || "",
    instructions: formData.get("instructions")?.trim() || "",
    image: getImageData(),
    status: "active",
    createdAt: new Date().toISOString()
  };
}

function validateWholeForm() {
  for (let index = 0; index < formSteps.length; index++) {
    showStep(index);
    if (!validateStep(index)) return false;
  }

  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (endDate && startDate && endDate < startDate) {
    showStep(1);
    document.getElementById("end-date").setCustomValidity("End date cannot be earlier than the start date.");
    document.getElementById("end-date").reportValidity();
    document.getElementById("end-date").setCustomValidity("");
    return false;
  }

  return true;
}

function resetForm() {
  medicationForm.reset();
  reminderList.innerHTML = "";
  addReminderRow();
  showStep(0);
  updateQuantityAvailability();
  updateScheduleFields();
  setPresetImage("bottle");
  if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageUrl = null;
}

medicationForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!validateWholeForm()) return;

  const medication = getFormData();
  medications.unshift(medication);
  writeStorage(STORAGE_KEYS.medications, medications);

  resetForm();
  renderMedications();
  switchMainTab("list");
  showToast("Medication saved.");
});

/* DRAFTS */
function saveDraft() {
  const draft = getFormData();
  draft.id = `draft-${Date.now()}`;
  draft.savedAt = new Date().toISOString();
  draft.step = currentStep;

  drafts.unshift(draft);
  writeStorage(STORAGE_KEYS.drafts, drafts);
  updateDraftCount();
  showToast("Draft saved on this device.");
}

document.getElementById("save-draft-btn").addEventListener("click", saveDraft);

function updateDraftCount() {
  draftCount.textContent = drafts.length;
}

function renderDrafts() {
  draftList.innerHTML = "";

  if (drafts.length === 0) {
    draftList.innerHTML = '<p class="draft-empty">You do not have any saved drafts yet.</p>';
    return;
  }

  drafts.forEach(draft => {
    const item = document.createElement("article");
    item.className = "draft-item";

    const title = draft.name || "Untitled medication";
    const date = draft.savedAt ? new Date(draft.savedAt).toLocaleString() : "Saved draft";

    item.innerHTML = `
      <div class="draft-item-main">
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(date)}</span>
      </div>
      <div class="draft-item-actions">
        <button type="button" data-action="load" data-id="${escapeHTML(draft.id)}">Open</button>
        <button type="button" data-action="delete" data-id="${escapeHTML(draft.id)}">Delete</button>
      </div>
    `;

    draftList.appendChild(item);
  });
}

document.getElementById("open-drafts-btn").addEventListener("click", () => {
  renderDrafts();
  draftsModal.showModal();
});

document.getElementById("close-modal-btn").addEventListener("click", () => draftsModal.close());

draftsModal.addEventListener("click", event => {
  if (event.target === draftsModal) draftsModal.close();
});

draftList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const draft = drafts.find(item => item.id === button.dataset.id);
  if (!draft) return;

  if (button.dataset.action === "delete") {
    drafts = drafts.filter(item => item.id !== draft.id);
    writeStorage(STORAGE_KEYS.drafts, drafts);
    updateDraftCount();
    renderDrafts();
    showToast("Draft deleted.");
    return;
  }

  loadDraft(draft);
  draftsModal.close();
  switchMainTab("add");
  showToast("Draft opened.");
});

function loadDraft(draft) {
  medicationForm.elements.medication_name.value = draft.name || "";
  medicationForm.elements.strength.value = draft.strength || "";
  medicationForm.elements.form.value = draft.form || "";
  medicationForm.elements.dose_amount.value = draft.doseAmount || "";
  quantityInput.value = draft.quantityAvailable || "";
  medicationForm.elements.schedule_type.value = draft.scheduleType || "daily";
  frequencySelect.value = draft.frequency || "";
  intervalSelect.value = draft.takeEvery || "";
  medicationForm.elements.start_date.value = draft.startDate || "";
  medicationForm.elements.end_date.value = draft.endDate || "";
  medicationForm.elements.prescribing_doctor.value = draft.prescribingDoctor || "";
  medicationForm.elements.instructions.value = draft.instructions || "";

  reminderList.innerHTML = "";
  (draft.reminderTimes?.length ? draft.reminderTimes : [""]).forEach(time => addReminderRow(time));

  updateQuantityAvailability();
  updateScheduleFields();

  if (draft.image?.type === "preset") {
    setPresetImage(draft.image.value || "bottle");
  } else {
    setPresetImage("bottle");
  }

  showStep(Number.isInteger(draft.step) ? draft.step : 0);
}

document.getElementById("cancel-btn").addEventListener("click", () => {
  resetForm();
  switchMainTab("list");
});

/* MEDICATION LIST */
function getScheduleLabel(medication) {
  if (medication.scheduleType === "interval") return `Every ${medication.takeEvery || "—"}`;
  return medication.frequency || "—";
}

function renderMedications() {
  const searchTerm = medicationSearch.value.trim().toLowerCase();
  const filterValue = medicationFilter.value;

  const filtered = medications.filter(medication => {
    const matchesSearch = [
      medication.name,
      medication.strength,
      medication.form,
      medication.doseAmount
    ].join(" ").toLowerCase().includes(searchTerm);

    const matchesStatus = filterValue === "all" || medication.status === filterValue;
    return matchesSearch && matchesStatus;
  });

  medicationList.innerHTML = "";
  medicationTotal.textContent = `${filtered.length} ${filtered.length === 1 ? "medication" : "medications"}`;

  if (filtered.length === 0) {
    medicationList.hidden = true;
    emptyMedications.classList.add("visible");

    const heading = emptyMedications.querySelector("h2");
    const paragraph = emptyMedications.querySelector("p");

    if (medications.length > 0) {
      heading.textContent = "No matching medications";
      paragraph.textContent = "Try changing your search or filter.";
      emptyMedications.querySelector("[data-open-add]").hidden = true;
    } else {
      heading.textContent = "No medications added yet";
      paragraph.textContent = "Your medications will appear here after you add them.";
      emptyMedications.querySelector("[data-open-add]").hidden = false;
    }
    return;
  }

  medicationList.hidden = false;
  emptyMedications.classList.remove("visible");

  filtered.forEach(medication => {
    const card = document.createElement("article");
    card.className = "medication-card";

    const statusClass = medication.status === "inactive" ? "inactive" : "";
    const statusLabel = medication.status === "inactive" ? "Inactive" : "Active";
    const schedule = medication.reminderTimes?.length
      ? medication.reminderTimes[0] + (medication.reminderTimes.length > 1 ? ` +${medication.reminderTimes.length - 1} more` : "")
      : "No reminder set";

    card.innerHTML = `
      <div class="medication-main">
        <div class="medication-img" aria-hidden="true">
          <i class="fa-solid fa-prescription-bottle-medical"></i>
        </div>
        <div class="medication-information">
          <h3>${escapeHTML(medication.name)}</h3>
          <p>${escapeHTML(medication.strength)} · ${escapeHTML(medication.form)}</p>
        </div>
      </div>

      <div class="medication-dose">
        <span>Dosage</span>
        <strong>${escapeHTML(medication.doseAmount || "—")}</strong>
      </div>

      <div class="medication-schedule">
        <span>Schedule</span>
        <strong>${escapeHTML(schedule)}</strong>
        <span>${escapeHTML(getScheduleLabel(medication))}</span>
      </div>

      <button type="button" class="medication-status ${statusClass}"
              data-status-id="${escapeHTML(medication.id)}"
              aria-label="Change status for ${escapeHTML(medication.name)}">
        ${statusLabel} <i class="fa-solid fa-chevron-down"></i>
      </button>

      <button type="button" class="medication-open" data-open-id="${escapeHTML(medication.id)}"
              aria-label="View ${escapeHTML(medication.name)} details">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

    medicationList.appendChild(card);
  });
}

medicationSearch.addEventListener("input", renderMedications);
medicationFilter.addEventListener("change", renderMedications);

medicationList.addEventListener("click", event => {
  const statusButton = event.target.closest("[data-status-id]");
  if (statusButton) {
    const medication = medications.find(item => item.id === statusButton.dataset.statusId);
    if (!medication) return;

    medication.status = medication.status === "inactive" ? "active" : "inactive";
    writeStorage(STORAGE_KEYS.medications, medications);
    renderMedications();
    showToast(`${medication.name} marked ${medication.status}.`);
    return;
  }

  const openButton = event.target.closest("[data-open-id]");
  if (openButton) {
    const medication = medications.find(item => item.id === openButton.dataset.openId);
    if (!medication) return;

    showToast(`${medication.name} · ${medication.doseAmount}`);
  }
});

/* PROFILE SELECTOR */
const profileSelector = document.getElementById("profile-selector");
const selectedProfile = document.getElementById("selected-profile");
const dropdownCurrentName = document.getElementById("dropdown-current-name");

document.querySelectorAll(".connected-profile").forEach(profile => {
  profile.addEventListener("click", () => {
    const name = profile.dataset.profile;
    selectedProfile.textContent = name;
    dropdownCurrentName.textContent = name;
    profileSelector.open = false;
    showToast(`Viewing ${name}'s medications.`);
  });
});

/* INITIALIZE */
addReminderRow();
updateQuantityAvailability();
updateScheduleFields();
showStep(0);
updateDraftCount();
renderMedications();
