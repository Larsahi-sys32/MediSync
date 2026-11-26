// ========================================
// 1. ELEMENT SELECTORS
// ========================================

const medicationTabs = [
  ...document.querySelectorAll(".medication-tab")
];

const medicationPanels = {
  list: document.getElementById("medlist-panel"),
  add: document.getElementById("addmed-panel")
};

const medicationForm =
  document.getElementById("medication-form");

const formSteps = [
  ...document.querySelectorAll(".form-step")
];

const pageIndicator =
  document.getElementById("page-indicator");

const stepDots = [
  ...pageIndicator.querySelectorAll(".dot")
];

const medicationList =
  document.getElementById("medication-list");

const emptyMedications =
  document.getElementById("empty-medications");

const medicationTotal =
  document.getElementById("medication-total");

const medicationSearch =
  document.getElementById("medication-search");

const medicationFilter =
  document.getElementById("medication-filter");

const filterLabel = document.getElementById("filter-label");

medicationFilter.addEventListener("change", () => {
  filterLabel.textContent =
    medicationFilter.options[medicationFilter.selectedIndex].text;
});

const formType =
  document.getElementById("medication-form-type");

const quantityInput =
  document.getElementById("quantity-available");

const quantityGroup =
  document.getElementById("quantity-group");

const quantityUnit =
  document.getElementById("quantity-unit");

const frequencyGroup =
  document.getElementById("frequency-group");

const frequencySelect =
  document.getElementById("frequency");

const intervalGroup =
  document.getElementById("interval-group");

const intervalSelect =
  document.getElementById("take-every");

const reminderList =
  document.getElementById("reminder-list");

const customImageInput =
  document.getElementById("custom-image");

const imagePreview =
  document.getElementById("image-preview");

const fileNameText =
  document.getElementById("file-name-text");

const presetButtons = [
  ...document.querySelectorAll(".preset-item")
];

const removeImageButton =
  document.getElementById("remove-image");

const draftsModal =
  document.getElementById("drafts-modal");

const draftList =
  document.getElementById("draft-list");

const draftCount =
  document.getElementById("draft-count");
  
// REFILL MODAL ELEMENTS

const refillModal =
  document.getElementById("refill-modal");

const refillForm =
  document.getElementById("refill-form");

const refillMedicationName =
  document.getElementById("refill-medication-name");

const refillMedicationStrength =
  document.getElementById("refill-medication-strength");

const refillCurrentStock =
  document.getElementById("refill-current-stock");

const refillQuantityInput =
  document.getElementById("refill-quantity");
  

let selectedRefillMedicationId = null;

// ========================================
// 2. TEMPORARY APPLICATION DATA
// ========================================

let currentStep = 0;

let selectedImage = {
  type: "preset",
  value: "bottle"
};

let uploadedImageUrl = null;

// Data exists only while the page is open.
// Refreshing the page clears all data.

let medications = [
  {
  id: "med-001",

    name: "Amoxicillin",
    strength: "500 mg",
    form: "Capsule",

    doseAmount: "1 capsule",

    quantityAvailable: "24",

    scheduleType: "daily",
    frequency: "3 times daily",
    takeEvery: "",

    reminderTimes: [
      "08:00",
      "14:00",
      "20:00"
    ],

    startDate: "2026-11-20",
    endDate: "2026-11-30",

    prescribingDoctor: "Dr. Michael Santos",

    instructions: "Take with food. Complete the prescribed course.",

    image: {
      type: "preset",
      value: "capsule"
    },

    status: "active",

    createdAt: "2026-11-26T08:00:00.000Z"
  },
  {
    id: "med-002",
    name: "Cetirizine",
    strength: "10 mg",
    form: "Tablet",
    doseAmount: "1 tablet",
    // No quantityAvailable property
    scheduleType: "daily",
    frequency: "Once daily",
    takeEvery: "",
    reminderTimes: ["08:00"],
    startDate: "2026-11-26",
    endDate: "2026-12-05",
    prescribingDoctor: "Dr. Maria Reyes",
    instructions: "Take as prescribed.",
    image: {
      type: "preset",
      value: "tablet"
    },
    status: "active",
    createdAt: "2026-11-26T09:00:00.000Z"
  }
];
let drafts = [];


// ========================================
// 3. UTILITY FUNCTIONS
// ========================================

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


// ========================================
// 4. MAIN TABS
// ========================================

function switchMainTab(tabName) {
  const showList = tabName === "list";

  medicationPanels.list.hidden = !showList;
  medicationPanels.add.hidden = showList;

  medicationTabs.forEach(tab => {
    const isActive =
      (showList && tab.id === "medlist-tab") ||
      (!showList && tab.id === "addmed-tab");

    tab.classList.toggle("active", isActive);

    tab.setAttribute(
      "aria-selected",
      String(isActive)
    );

    tab.tabIndex = isActive ? 0 : -1;
  });

  if (!showList) {
    updateDraftCount();
  }
}

medicationTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    switchMainTab(
      tab.id === "medlist-tab" ? "list" : "add"
    );
  });
});

medicationTabs.forEach((tab, index) => {
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % medicationTabs.length
      : (index - 1 + medicationTabs.length) %
        medicationTabs.length;

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


// ========================================
// 5. FOUR-STEP FORM NAVIGATION
// ========================================

function showStep(index) {
  currentStep = Math.max(
    0,
    Math.min(index, formSteps.length - 1)
  );

  formSteps.forEach((step, stepIndex) => {
    const isActive = stepIndex === currentStep;

    step.hidden = !isActive;

    step.classList.toggle(
      "active",
      isActive
    );
  });

  stepDots.forEach((dot, dotIndex) => {
    dot.classList.toggle(
      "active",
      dotIndex === currentStep
    );
  });

  pageIndicator.setAttribute(
    "aria-label",
    `Step ${currentStep + 1} of ${formSteps.length}`
  );

  document.querySelectorAll(".btn-prev").forEach(button => {
    button.disabled = currentStep === 0;
  });

  document.querySelectorAll(".btn-next").forEach(button => {
    button.disabled =
      currentStep === formSteps.length - 1;
  });
}


// ========================================
// 6. FORM VALIDATION
// ========================================

function validateStep(index) {
  const step = formSteps[index];

  const fields = [
    ...step.querySelectorAll(
      "input, select, textarea"
    )
  ].filter(field => field.required && !field.disabled);

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();

      return false;
    }
  }

  if (index === 1) {
    const scheduleType = medicationForm.querySelector(
      'input[name="schedule_type"]:checked'
    );

    if (!scheduleType) {
      return false;
    }

    const reminderTimes = [
      ...reminderList.querySelectorAll(
        'input[type="time"]'
      )
    ];

    if (!reminderTimes.some(input => input.value)) {
      reminderTimes[0]?.focus();

      return false;
    }
  }

  return true;
}


// ========================================
// 7. NEXT BUTTONS
// ========================================

document.querySelectorAll(".btn-next").forEach(button => {
  button.addEventListener("click", () => {
    // Allow navigation without validating required fields.
    showStep(currentStep + 1);
  });
});

// ========================================
// 8. PREVIOUS BUTTONS
// ========================================

document.querySelectorAll(".btn-prev").forEach(button => {
  button.addEventListener("click", () => {
    showStep(currentStep - 1);
  });
});
// ========================================
// 9. QUANTITY AVAILABLE
// ========================================

const countableForms = new Set([
  "Tablet",
  "Capsule"
]);

function updateQuantityAvailability() {
  const isCountable = countableForms.has(formType.value);

  quantityInput.disabled = !isCountable;

  quantityGroup.classList.toggle(
    "is-disabled",
    !isCountable
  );

  quantityUnit.textContent = isCountable
    ? (
        formType.value === "Tablet"
          ? "Tablets"
          : "Capsules"
      )
    : "Select a countable form";

  if (!isCountable) {
    quantityInput.value = "";
  }
}

formType.addEventListener(
  "change",
  updateQuantityAvailability
);


// ========================================
// 10. SCHEDULE TYPE
// ========================================

function updateScheduleFields() {
  const selectedType = medicationForm.querySelector(
    'input[name="schedule_type"]:checked'
  )?.value;

  const isInterval = selectedType === "interval";

  // Frequency settings
  frequencyGroup.hidden = isInterval;
  frequencySelect.disabled = isInterval;
  frequencySelect.required = !isInterval;

  // Interval settings
  intervalGroup.hidden = !isInterval;
  intervalSelect.disabled = !isInterval;
  intervalSelect.required = isInterval;
}

medicationForm.querySelectorAll(
  'input[name="schedule_type"]'
).forEach(radio => {
  radio.addEventListener(
    "change",
    updateScheduleFields
  );
});


// ========================================
// 11. MULTIPLE REMINDER TIMES
// ========================================

function renderReminderRows() {
  const rows = [
    ...reminderList.querySelectorAll(".reminder-row")
  ];

  rows.forEach((row, index) => {
    const isFirst = index === 0;
    const isLast = index === rows.length - 1;

    // Remove existing buttons before rebuilding controls.
    row.querySelectorAll("button").forEach(button => {
      button.remove();
    });

    // Only added rows have a remove button.
    if (!isFirst) {
      const removeButton = document.createElement("button");

      removeButton.type = "button";
      removeButton.className = "remove-reminder";
      removeButton.setAttribute("aria-label", "Remove reminder");

      removeButton.innerHTML = `
        <i class="fa-solid fa-minus"></i>
      `;

      row.appendChild(removeButton);
    }

    // Only the last row has an add button.
    if (isLast) {
      const addButton = document.createElement("button");

      addButton.type = "button";
      addButton.className = "add-reminder";
      addButton.setAttribute("aria-label", "Add reminder");

      addButton.innerHTML = `
        <i class="fa-solid fa-plus"></i>
      `;

      row.appendChild(addButton);
    }
  });
}


// Create a reminder row.

function addReminderRow(value = "") {
  const row = document.createElement("div");

  row.className = "reminder-row";

  row.innerHTML = `
    <input
      type="time"
      name="reminder_times[]"
      aria-label="Reminder time"
      required
    >
  `;

  row.querySelector("input").value = value;

  reminderList.appendChild(row);

  renderReminderRows();
}


// Handle add and remove buttons.

reminderList.addEventListener("click", event => {

  // ADD REMINDER

  const addButton = event.target.closest(".add-reminder");

  if (addButton) {
    addReminderRow();

    reminderList.lastElementChild
      ?.querySelector("input")
      ?.focus();

    return;
  }


  // REMOVE REMINDER

  const removeButton = event.target.closest(".remove-reminder");

  if (removeButton) {
    const row = removeButton.closest(".reminder-row");

    row.remove();

    renderReminderRows();
  }

});

// ========================================
// 12. IMAGE PREVIEW
// ========================================

function setPresetImage(preset) {
  selectedImage = {
    type: "preset",
    value: preset
  };

  uploadedImageUrl = null;

  removeImageButton.hidden = true;

  customImageInput.value = "";

  fileNameText.textContent = "No file chosen";

  const iconMap = {
    bottle: "fa-prescription-bottle-medical",
    tablet: "fa-tablets",
    capsule: "fa-capsules",
    pills: "fa-pills"
  };

  imagePreview.innerHTML = `
    <i
      class="fa-solid ${
        iconMap[preset] || iconMap.bottle
      }"
      aria-hidden="true"
    ></i>

    <span>
      ${
        escapeHTML(
          preset.charAt(0).toUpperCase() +
          preset.slice(1)
        )
      } preset
    </span>
  `;

  presetButtons.forEach(button => {
    const isSelected =
      button.dataset.preset === preset;

    button.classList.toggle(
      "selected",
      isSelected
    );

    button.setAttribute(
      "aria-pressed",
      String(isSelected)
    );
  });
}


// Preset image buttons

presetButtons.forEach(button => {
  button.addEventListener("click", () => {
    setPresetImage(button.dataset.preset);
  });
});


// Custom image upload

customImageInput.addEventListener("change", () => {
  const file = customImageInput.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    customImageInput.value = "";

    return;
  }

  if (uploadedImageUrl) {
    URL.revokeObjectURL(uploadedImageUrl);
  }

  uploadedImageUrl = URL.createObjectURL(file);

  selectedImage = {
    type: "upload",
    value: file.name
  };

  removeImageButton.hidden = false;

  imagePreview.innerHTML = `
    <img
      src="${uploadedImageUrl}"
      alt="Selected medication image preview"
    >
  `;

  fileNameText.textContent = file.name;

  presetButtons.forEach(button => {
    button.classList.remove("selected");

    button.setAttribute(
      "aria-pressed",
      "false"
    );
  });
});


// Remove image button

removeImageButton.addEventListener("click", () => {

  if (uploadedImageUrl) {
    URL.revokeObjectURL(uploadedImageUrl);
    uploadedImageUrl = null;
  }

  customImageInput.value = "";

  setPresetImage("bottle");

  removeImageButton.hidden = true;

});


// Get selected image data

function getImageData() {
  return selectedImage;
}
// ========================================
// 13. FORM DATA
// ========================================

function getFormData() {
  const formData = new FormData(medicationForm);

  const reminderTimes = formData
    .getAll("reminder_times[]")
    .filter(Boolean);

  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    name:
      formData.get("medication_name")?.trim() || "",

    strength:
      formData.get("strength")?.trim() || "",

    form:
      formData.get("form") || "",

    doseAmount:
      formData.get("dose_amount")?.trim() || "",

    quantityAvailable:
      formData.get("quantity_available") || "",

    scheduleType:
      formData.get("schedule_type") || "daily",

    frequency:
      formData.get("frequency") || "",

    takeEvery:
      formData.get("take_every") || "",

    reminderTimes,

    startDate:
      formData.get("start_date") || "",

    endDate:
      formData.get("end_date") || "",

    prescribingDoctor:
      formData.get("prescribing_doctor")?.trim() || "",

    instructions:
      formData.get("instructions")?.trim() || "",

    image: getImageData(),

    status: "active",

    createdAt: new Date().toISOString()
  };
}


// ========================================
// 14. COMPLETE FORM VALIDATION
// ========================================

function validateWholeForm() {
  for (
    let index = 0;
    index < formSteps.length;
    index++
  ) {
    showStep(index);

    if (!validateStep(index)) {
      return false;
    }
  }

  const startDate =
    document.getElementById("start-date").value;

  const endDate =
    document.getElementById("end-date").value;

  if (endDate && startDate && endDate < startDate) {
    showStep(1);

    const endDateInput =
      document.getElementById("end-date");

    endDateInput.setCustomValidity(
      "End date cannot be earlier than the start date."
    );

    endDateInput.reportValidity();

    endDateInput.setCustomValidity("");

    return false;
  }

  return true;
}


// ========================================
// 15. RESET MEDICATION FORM
// ========================================

function resetForm() {
  medicationForm.reset();

  reminderList.innerHTML = "";

  addReminderRow();

  showStep(0);

  updateQuantityAvailability();

  updateScheduleFields();

  setPresetImage("bottle");

  if (uploadedImageUrl) {
    URL.revokeObjectURL(uploadedImageUrl);
  }

  uploadedImageUrl = null;
}


// ========================================
// 16. SUBMIT MEDICATION
// ========================================

medicationForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!validateWholeForm()) {
    return;
  }

  const medication = getFormData();

  // Save temporarily in JavaScript memory.
  medications.unshift(medication);

  // Clear the form.
  resetForm();

  // Refresh medication display.
  renderMedications();

  // Return to medication list.
  switchMainTab("list");
});


// ========================================
// 17. TEMPORARY DRAFT MANAGEMENT
// ========================================

function saveDraft() {
  const draft = getFormData();

  draft.id =
    `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  draft.savedAt = new Date().toISOString();

  draft.step = currentStep;

  // Drafts are stored only in memory.
  drafts.unshift(draft);

  updateDraftCount();

}


// Save draft button

document.getElementById("save-draft-btn").addEventListener(
  "click",
  saveDraft
);


// ========================================
// 18. UPDATE DRAFT COUNT
// ========================================

function updateDraftCount() {
  draftCount.textContent = drafts.length;
}


// ========================================
// 19. DISPLAY SAVED DRAFTS
// ========================================

function renderDrafts() {
  draftList.innerHTML = "";

  if (drafts.length === 0) {
    draftList.innerHTML = `
      <p class="draft-empty">
        You do not have any saved drafts yet.
      </p>
    `;

    return;
  }

  drafts.forEach(draft => {
    const item = document.createElement("article");

    item.className = "draft-item";

    const title =
      draft.name || "Untitled medication";

    const date = draft.savedAt
      ? new Date(draft.savedAt).toLocaleString()
      : "Saved draft";

    item.innerHTML = `
      <div class="draft-item-main">

        <strong>
          ${escapeHTML(title)}
        </strong>

        <span>
          ${escapeHTML(date)}
        </span>

      </div>

      <div class="draft-item-actions">

        <button
          type="button"
          data-action="load"
          data-id="${escapeHTML(draft.id)}"
        >
          Open
        </button>

        <button
          type="button"
          data-action="delete"
          data-id="${escapeHTML(draft.id)}"
        >
          Delete
        </button>

      </div>
    `;

    draftList.appendChild(item);
  });
}


// ========================================
// 20. OPEN DRAFTS MODAL
// ========================================

document.getElementById("open-drafts-btn").addEventListener(
  "click",
  () => {
    renderDrafts();

    draftsModal.showModal();
  }
);


// ========================================
// 21. CLOSE DRAFTS MODAL
// ========================================

document.getElementById("close-modal-btn").addEventListener(
  "click",
  () => {
    draftsModal.close();
  }
);


// Close modal when clicking outside.

draftsModal.addEventListener("click", event => {
  if (event.target === draftsModal) {
    draftsModal.close();
  }
});


// ========================================
// 22. DRAFT ACTIONS
// ========================================

draftList.addEventListener("click", event => {
  const button = event.target.closest(
    "button[data-action]"
  );

  if (!button) return;

  const draft = drafts.find(
    item => item.id === button.dataset.id
  );

  if (!draft) return;


  // DELETE DRAFT

  if (button.dataset.action === "delete") {
    drafts = drafts.filter(
      item => item.id !== draft.id
    );

    updateDraftCount();

    renderDrafts();

    return;
  }


  // OPEN DRAFT

  loadDraft(draft);

  draftsModal.close();

  switchMainTab("add");
});


// ========================================
// 23. LOAD DRAFT INTO FORM
// ========================================

function loadDraft(draft) {
  medicationForm.elements.medication_name.value =
    draft.name || "";

  medicationForm.elements.strength.value =
    draft.strength || "";

  medicationForm.elements.form.value =
    draft.form || "";

  medicationForm.elements.dose_amount.value =
    draft.doseAmount || "";

  quantityInput.value =
    draft.quantityAvailable || "";

  medicationForm.elements.schedule_type.value =
    draft.scheduleType || "daily";

  frequencySelect.value =
    draft.frequency || "";

  intervalSelect.value =
    draft.takeEvery || "";

  medicationForm.elements.start_date.value =
    draft.startDate || "";

  medicationForm.elements.end_date.value =
    draft.endDate || "";

  medicationForm.elements.prescribing_doctor.value =
    draft.prescribingDoctor || "";

  medicationForm.elements.instructions.value =
    draft.instructions || "";


  // Restore reminder times.

  reminderList.innerHTML = "";

  (
    draft.reminderTimes?.length
      ? draft.reminderTimes
      : [""]
  ).forEach(time => {
    addReminderRow(time);
  });


  // Update conditional form fields.

  updateQuantityAvailability();

  updateScheduleFields();


  // Restore preset image.

  if (draft.image?.type === "preset") {
    setPresetImage(
      draft.image.value || "bottle"
    );
  } else {
    setPresetImage("bottle");
  }


  // Restore previous form step.

  showStep(
    Number.isInteger(draft.step)
      ? draft.step
      : 0
  );
}


// ========================================
// 24. CANCEL MEDICATION FORM
// ========================================

document.getElementById("cancel-btn").addEventListener(
  "click",
  () => {
    resetForm();

    switchMainTab("list");
  }
);
// ========================================
// 25. MEDICATION LIST
// ========================================

function getScheduleLabel(medication) {
  if (medication.scheduleType === "interval") {
    return `Every ${medication.takeEvery || "—"}`;
  }

  return medication.frequency || "—";
}

// ========================================
// 31. REFILL MEDICATION MODAL
// ========================================

// OPEN REFILL MODAL

function openRefillModal(medication) {

  selectedRefillMedicationId = medication.id;

  const unit =
    medication.form === "Tablet"
      ? "Tablets"
      : "Capsules";

  refillMedicationName.textContent =
    medication.name;

  refillMedicationStrength.textContent =
    `${medication.strength} · ${medication.form}`;

  refillCurrentStock.textContent =
    `${medication.quantityAvailable} ${unit}`;

  refillQuantityInput.value = "";

  refillQuantityInput.setCustomValidity("");

  refillModal.showModal();

  refillQuantityInput.focus();
}


// CLOSE REFILL MODAL

function closeRefillModal() {

  refillModal.close();

  refillForm.reset();

  selectedRefillMedicationId = null;
}


// REFILL BUTTON EVENT

medicationList.addEventListener("click", event => {

  const refillButton = event.target.closest(
    "[data-refill-id]"
  );

  if (!refillButton) return;

  const medication = medications.find(
    item => item.id === refillButton.dataset.refillId
  );

  if (!medication) return;

  openRefillModal(medication);

});


// CONFIRM REFILL

refillForm.addEventListener("submit", event => {

  event.preventDefault();

  const quantity = Number(refillQuantityInput.value);

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    refillQuantityInput.setCustomValidity(
      "Please enter a valid whole number greater than zero."
    );

    refillQuantityInput.reportValidity();

    return;
  }

  const medication = medications.find(
    item => item.id === selectedRefillMedicationId
  );

  if (!medication) {
    closeRefillModal();
    return;
  }

  const currentStock =
    Number(medication.quantityAvailable);

  if (
    !Number.isSafeInteger(currentStock) ||
    currentStock < 0 ||
    !Number.isSafeInteger(currentStock + quantity)
  ) {
    refillQuantityInput.setCustomValidity(
      "The resulting stock quantity is invalid."
    );

    refillQuantityInput.reportValidity();

    return;
  }

  // UPDATE AVAILABLE STOCK

  medication.quantityAvailable =
    String(currentStock + quantity);

  // REFRESH MEDICATION LIST

  renderMedications();

  closeRefillModal();

});


// CLEAR CUSTOM VALIDATION MESSAGE

refillQuantityInput.addEventListener("input", () => {
  refillQuantityInput.setCustomValidity("");
});


// CLOSE BUTTON

document.getElementById("close-refill-btn")
  .addEventListener("click", closeRefillModal);


// CANCEL BUTTON

document.getElementById("cancel-refill-btn")
  .addEventListener("click", closeRefillModal);


// CLOSE WHEN CLICKING OUTSIDE

refillModal.addEventListener("click", event => {

  if (event.target === refillModal) {
    closeRefillModal();
  }

});

// ========================================
// 26. RENDER MEDICATIONS
// ========================================

function renderMedications() {
  const searchTerm = medicationSearch.value
    .trim()
    .toLowerCase();

  const filterValue = medicationFilter.value;

  const filtered = medications.filter(medication => {

    const matchesSearch = [
      medication.name,
      medication.strength,
      medication.form,
      medication.doseAmount
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);

    const matchesStatus =
      filterValue === "all" ||
      medication.status === filterValue;

    return matchesSearch && matchesStatus;
  });


  // Clear previous medication cards.

  medicationList.innerHTML = "";


  // Update medication count.

  medicationTotal.textContent =
    `${filtered.length} ${
      filtered.length === 1
        ? "medication"
        : "medications"
    }`;


  // Display empty state.

  if (filtered.length === 0) {
    medicationList.hidden = true;

    emptyMedications.classList.add("visible");

    const heading =
      emptyMedications.querySelector("h2");

    const paragraph =
      emptyMedications.querySelector("p");

    const addButton =
      emptyMedications.querySelector("[data-open-add]");

    if (medications.length > 0) {

      heading.textContent =
        "No matching medications";

      paragraph.textContent =
        "Try changing your search or filter.";

      addButton.hidden = true;

    } else {

      heading.textContent =
        "No medications added yet";

      paragraph.textContent =
        "Your medications will appear here after you add them.";

      addButton.hidden = false;
    }

    return;
  }


  // Display medication list.

  medicationList.hidden = false;

  emptyMedications.classList.remove("visible");


  // Create medication cards.

  filtered.forEach(medication => {

    const card = document.createElement("article");

    card.className = "medication-card";


    // Medication status.

    const statusClass =
      medication.status === "inactive"
        ? "inactive"
        : "";

    const statusLabel =
      medication.status === "inactive"
        ? "Inactive"
        : "Active";


    // Medication reminder schedule.

    const schedule = medication.reminderTimes?.length
      ? medication.reminderTimes[0] +
        (
          medication.reminderTimes.length > 1
            ? ` +${medication.reminderTimes.length - 1} more`
            : ""
        )
      : "No reminder set";


    // Medication card HTML.
    card.innerHTML = `

        <div class="medication-information">

          <div class="medication-img" aria-hidden="true">
            <i class="fa-solid fa-prescription-bottle-medical"></i>
          </div>

          <div class="medication-details">
            <h3>${escapeHTML(medication.name)}</h3>
            <p>
              ${escapeHTML(medication.strength)}
              ·
              ${escapeHTML(medication.form)}
            </p>
          </div>

          ${
            medication.quantityAvailable !== undefined &&
            medication.quantityAvailable !== null &&
            medication.quantityAvailable !== ""
            ? `
              <div class="medication-stock">
                <div class="stock-information">
                  <span>Available stock</span>
                  <strong>
                    ${escapeHTML(medication.quantityAvailable)}
                    ${escapeHTML(
                      medication.form === "Tablet"
                        ? "tablets"
                        : medication.form === "Capsule"
                          ? "capsules"
                          : "units"
                    )}
                  </strong>
                </div>
              </div>
            `
            : ""
          }

        </div>

        <div class="medication-actions">

          ${
            medication.quantityAvailable !== undefined &&
            medication.quantityAvailable !== null &&
            medication.quantityAvailable !== ""
            ? `
              <button
                type="button"
                class="medication-refill"
                data-refill-id="${escapeHTML(medication.id)}"
                aria-label="Refill ${escapeHTML(medication.name)}"
              >
                <i class="fa-solid fa-plus"></i>
                <span>Refill</span>
              </button>
            `
            : ""
          }

          <button
            type="button"
            class="medication-status ${statusClass}"
            data-status-id="${escapeHTML(medication.id)}"
          >
            ${statusLabel}
          </button>

          <button
            type="button"
            class="medication-open"
            data-open-id="${escapeHTML(medication.id)}"
            aria-label="View ${escapeHTML(medication.name)} details"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>

        </div>

    `;
    medicationList.appendChild(card);

  });
}


// ========================================
// 27. MEDICATION SEARCH
// ========================================

medicationSearch.addEventListener(
  "input",
  renderMedications
);


// ========================================
// 28. MEDICATION FILTER
// ========================================

medicationFilter.addEventListener(
  "change",
  renderMedications
);


// ========================================
// 29. MEDICATION STATUS AND DETAILS
// ========================================

medicationList.addEventListener("click", event => {

  // Change medication status.

  const statusButton = event.target.closest(
    "[data-status-id]"
  );

  if (statusButton) {

    const medication = medications.find(
      item => item.id === statusButton.dataset.statusId
    );

    if (!medication) return;

    medication.status =
      medication.status === "inactive"
        ? "active"
        : "inactive";

    renderMedications();

    return;
  }


  // Open medication details.

  const openButton = event.target.closest(
    "[data-open-id]"
  );

  if (openButton) {

    const medication = medications.find(
      item => item.id === openButton.dataset.openId
    );

    if (!medication) return;
    detailsOpen(medication);
  }

});


// ========================================
// 30. PROFILE SELECTOR
// ========================================

const profileSelector =
  document.getElementById("profile-selector");

const selectedProfile =
  document.getElementById("selected-profile");

const dropdownCurrentName =
  document.getElementById("dropdown-current-name");


document.querySelectorAll(".connected-profile").forEach(
  profile => {

    profile.addEventListener("click", () => {

      const name = profile.dataset.profile;

      selectedProfile.textContent = name;

      dropdownCurrentName.textContent = name;

      profileSelector.open = false;

    });

  }
);


// ========================================
// MEDICATION DETAILS WORKSPACE
// ========================================
const detailsWorkspace = document.getElementById("medication-details-workspace");
const detailsBack = document.getElementById("details-back");
const detailsTopActions = document.getElementById("details-top-actions");
const detailsIdentity = document.getElementById("details-identity-row");
const detailsStepContent = document.getElementById("details-step-content");
const detailsDots = [...document.querySelectorAll("#details-page-indicator .dot")];
let viewedMedicationId = null, detailsStep = 0, detailsEditing = false, detailsOriginal = null;
let detailsUploadUrl = null;
const detailsLabels = ["Medication Information", "Schedule & Frequency", "Prescription & Instructions", "Medication Image"];
const detailsPresetIcons = {bottle:"fa-prescription-bottle-medical",tablet:"fa-tablets",capsule:"fa-capsules",pills:"fa-pills"};
function detailsDisplay(value) { return value === undefined || value === null || value === "" ? "Not provided" : escapeHTML(value); }
function detailsBox(value, extra="") { return `<div class="details-value-box ${extra}">${detailsDisplay(value)}</div>`; }
function detailsField(label, key, value, type="text", options=null, hint="", required=false) {
 const id=`details-${key}`;
 let control;
 if(options) control=`<select id="${id}" data-detail-key="${key}"><option value="">Select</option>${options.map(o=>`<option value="${escapeHTML(o)}" ${o===value?'selected':''}>${escapeHTML(o)}</option>`).join('')}</select>`;
 else if(type==='textarea') control=`<textarea id="${id}" data-detail-key="${key}" rows="4">${escapeHTML(value??'')}</textarea>`;
 else control=`<input id="${id}" type="${type}" data-detail-key="${key}" value="${escapeHTML(value??'')}" ${type==='number'?'min="0" step="1"':''}>`;
 return `<div class="form-group details-field"><label for="${id}">${label}${required?'<span class="required-mark">*</span>':''}</label>${detailsEditing?control:detailsBox(value)}${detailsEditing&&hint?`<small class="field-hint">${hint}</small>`:''}</div>`;
}
function detailsImageStep(m) {
 const image=m.image||{type:"preset",value:"bottle"};
 const preset=image.type==="preset"?(image.value||"bottle"):"";
 const uploadName=image.type==="upload"?(image.value||"Uploaded image"):"";
 const icon=detailsPresetIcons[preset]||detailsPresetIcons.bottle;
 const displayName=preset?`${preset.charAt(0).toUpperCase()+preset.slice(1)} preset`:uploadName;
 const preview=image.type==="upload"&&detailsUploadUrl?`<img src="${detailsUploadUrl}" alt="Selected medication image">`:`<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
 if(!detailsEditing) return `<div class="image-grid details-image-grid"><div class="preview-col details-preview">${preview}<span>${escapeHTML(displayName||"Medication image")}</span></div><div class="image-options"><div class="presets-panel"><h3>Medication Image</h3>${detailsBox(displayName||"No image selected")}</div></div></div>`;
 return `<div class="image-grid details-image-grid"><div class="preview-col details-preview" id="details-image-preview">${preview}<span>${escapeHTML(displayName||"Image preview")}</span></div><div class="image-options"><div class="presets-panel"><h3>History / Presets</h3><div class="presets-row" role="group" aria-label="Choose medication image">${Object.keys(detailsPresetIcons).map(p=>`<button type="button" class="preset-item ${p===preset?'selected':''}" data-details-preset="${p}" aria-pressed="${p===preset}" aria-label="${p} icon"><i class="fa-solid ${detailsPresetIcons[p]}"></i></button>`).join('')}</div></div><div class="upload-row details-upload-row"><label for="details-custom-image" class="btn-attach">Attach Image <i class="fa-solid fa-paperclip"></i></label><span id="details-file-name" class="file-name">${escapeHTML(uploadName||"No file chosen")}</span><input type="file" id="details-custom-image" accept="image/*" hidden><button type="button" class="remove-image details-remove-image" id="details-remove-image" aria-label="Remove selected image" title="Remove selected image" ${image.type!=='upload'?'hidden':''}><i class="fa-solid fa-xmark"></i></button></div></div></div>`;
}
function detailsReminderRows(m) {
 const times=Array.isArray(m.reminderTimes)?m.reminderTimes:[];
 if(!detailsEditing) return `<div class="form-group details-field reminder-group"><label>Reminder Time(s)</label><div class="reminder-list details-reminder-list">${times.length?times.map(t=>`<div class="reminder-row"><div class="details-value-box reminder-value">${escapeHTML(t)}</div></div>`).join(''):'<div class="details-value-box">No reminder set</div>'}</div></div>`;
 return `<div class="form-group reminder-group details-field"><label>Reminder Time(s) <span>*</span></label><div class="reminder-list details-reminder-list">${times.map((t,i)=>`<div class="reminder-row"><input type="time" data-details-reminder value="${escapeHTML(t)}" aria-label="Reminder time ${i+1}">${i===times.length-1?'<button type="button" class="add-reminder" id="details-add-reminder" aria-label="Add reminder"><i class="fa-solid fa-plus"></i></button>':''}${times.length>1?`<button type="button" class="remove-reminder" data-remove-reminder aria-label="Remove reminder"><i class="fa-solid fa-minus"></i></button>`:''}</div>`).join('')}${times.length===0?'<div class="reminder-row"><input type="time" data-details-reminder aria-label="Reminder time"><button type="button" class="add-reminder" id="details-add-reminder" aria-label="Add reminder"><i class="fa-solid fa-plus"></i></button></div>':''}</div></div>`;
}
function detailsRender() {
 const m=medications.find(x=>x.id===viewedMedicationId); if(!m)return;
 const statusClass=m.status==='inactive'?'inactive':'';
 detailsIdentity.innerHTML=`<h2>${escapeHTML(m.name)}</h2><button type="button" class="medication-status ${statusClass}" id="details-status">${m.status==='inactive'?'Inactive':'Active'}</button>`;
 detailsTopActions.innerHTML=detailsEditing?`<div class="details-save-cancel"><button type="button" class="details-icon-action" id="details-cancel-edit">Cancel</button><button type="button" class="details-icon-action" id="details-save-edit"><i class="fa-solid fa-check"></i> Save</button></div>`:`<button type="button" class="details-icon-action" id="details-edit"><i class="fa-solid fa-pen"></i> Edit</button><button type="button" class="details-icon-action danger" id="details-delete" title="Delete medication" aria-label="Delete medication"><i class="fa-solid fa-trash"></i></button>`;
 const nameField=detailsField('Medication Name','name',m.name,'text',null,'',true);
 const strengthForm=`<div class="form-row">${detailsField('Strength','strength',m.strength,'text',null,'',true)}${detailsField('Form','form',m.form,'text',['Tablet','Capsule','Liquid','Syrup','Drops','Inhaler','Injection','Cream','Ointment','Patch','Other'],'',true)}</div>`;
 const doseField=detailsField('Dose Amount','doseAmount',m.doseAmount,'text',null,'',true);
 const countable=['Tablet','Capsule','Patch'].includes(m.form);
 const quantityField=`<div class="form-group quantity-group details-field"><label for="details-quantityAvailable">Quantity Available</label>${detailsEditing?`<div class="input-with-unit"><input type="number" id="details-quantityAvailable" data-detail-key="quantityAvailable" min="0" step="1" value="${escapeHTML(m.quantityAvailable??'')}" ${!countable?'disabled':''}><span class="quantity-unit">${countable?'units available':'Quantity'}</span></div>`:`<div class="input-with-unit">${detailsBox(m.quantityAvailable)}<span class="quantity-unit">${countable?'units available':'Quantity'}</span></div>`}${detailsEditing?'<small class="field-hint">For countable medicines, enter the number of units you currently have.</small>':''}</div>`;
 const scheduleChoice=`<fieldset class="form-group schedule-type-group"><legend>How is your medication scheduled?</legend>${detailsEditing?`<div class="radio-row"><label class="radio-option"><input type="radio" name="details-scheduleType" data-detail-key="scheduleType" value="daily" ${m.scheduleType==='daily'?'checked':''}><span>Daily Frequency</span></label><label class="radio-option"><input type="radio" name="details-scheduleType" data-detail-key="scheduleType" value="interval" ${m.scheduleType==='interval'?'checked':''}><span>Hourly Interval</span></label></div>`:detailsBox(m.scheduleType==='interval'?'Hourly Interval':'Daily Frequency')}</fieldset>`;
 const scheduleFields=m.scheduleType==='interval'?detailsField('Take Every','takeEvery',m.takeEvery,'text',['4 hours','6 hours','8 hours','12 hours','24 hours'],'',true):detailsField('Frequency','frequency',m.frequency,'text',['Once a day','Twice a day','3 times a day','4 times a day','5 times a day'],'',true);
 const dates=`<div class="form-row">${detailsField('Start Date','startDate',m.startDate,'date',null,'',true)}${detailsField('End Date','endDate',m.endDate,'date')}</div>`;
 const body=[`${nameField}${strengthForm}${doseField}${quantityField}`,`${scheduleChoice}${scheduleFields}${detailsReminderRows(m)}${dates}`,`${detailsField('Prescribing Doctor','prescribingDoctor',m.prescribingDoctor)}${detailsField('Additional Instructions','instructions',m.instructions,'textarea')}`,detailsImageStep(m)];
 detailsStepContent.innerHTML=`<div class="details-step-content"><header class="header-row"><h2>${detailsLabels[detailsStep]}</h2><div class="step-nav"><button type="button" class="step-arrow" id="details-prev" ${detailsStep===0?'disabled':''} aria-label="Previous step"><i class="fa-solid fa-chevron-left"></i></button><button type="button" class="step-arrow" id="details-next" ${detailsStep===3?'disabled':''} aria-label="Next step"><i class="fa-solid fa-chevron-right"></i></button></div></header><div class="form-fields details-fields">${body[detailsStep]}</div></div>`;
 detailsDots.forEach((d,i)=>d.classList.toggle('active',i===detailsStep));
 detailsDots.forEach((d,i)=>{d.onclick=()=>{detailsStep=i;detailsRender();};});
 document.getElementById('details-prev').onclick=()=>{if(detailsStep>0){detailsStep--;detailsRender();}};
 document.getElementById('details-next').onclick=()=>{if(detailsStep<3){detailsStep++;detailsRender();}};
 document.getElementById('details-edit')?.addEventListener('click',()=>{detailsOriginal=structuredClone(m);detailsEditing=true;detailsRender();});
 document.getElementById('details-cancel-edit')?.addEventListener('click',()=>{Object.assign(m,detailsOriginal);detailsEditing=false;detailsRender();});
 document.getElementById('details-save-edit')?.addEventListener('click',()=>{
   detailsStepContent.querySelectorAll('[data-detail-key]').forEach(el=>{const k=el.dataset.detailKey;if(k==='scheduleType'){if(el.checked)m[k]=el.value;}else m[k]=el.value;});
   m.reminderTimes=[...detailsStepContent.querySelectorAll('[data-details-reminder]')].map(el=>el.value).filter(Boolean);
   detailsEditing=false;detailsOriginal=null;renderMedications();detailsRender();
 });
 document.getElementById('details-delete')?.addEventListener('click',()=>detailsShowDeleteDialog(m));
 document.getElementById('details-status').onclick=()=>{m.status=m.status==='inactive'?'active':'inactive';renderMedications();detailsRender();};
 // Reminder row actions: delegated locally after rendering.
 detailsStepContent.querySelector('#details-add-reminder')?.addEventListener('click',()=>{const vals=[...detailsStepContent.querySelectorAll('[data-details-reminder]')].map(x=>x.value);vals.push('');m.reminderTimes=vals;detailsRender();detailsStepContent.querySelector('[data-details-reminder]:last-of-type')?.focus();});
 detailsStepContent.querySelectorAll('[data-remove-reminder]').forEach(btn=>btn.addEventListener('click',()=>{const row=btn.closest('.reminder-row');const vals=[...detailsStepContent.querySelectorAll('[data-details-reminder]')].map(x=>x.value);const idx=[...row.parentElement.children].indexOf(row);vals.splice(idx,1);m.reminderTimes=vals;detailsRender();}));
 detailsStepContent.querySelectorAll('[data-details-preset]').forEach(btn=>btn.addEventListener('click',()=>{m.image={type:'preset',value:btn.dataset.detailsPreset};if(detailsUploadUrl){URL.revokeObjectURL(detailsUploadUrl);detailsUploadUrl=null;}detailsRender();}));
 const imageInput=document.getElementById('details-custom-image');
 imageInput?.addEventListener('change',()=>{const file=imageInput.files?.[0];if(!file||!file.type.startsWith('image/'))return;if(detailsUploadUrl)URL.revokeObjectURL(detailsUploadUrl);detailsUploadUrl=URL.createObjectURL(file);m.image={type:'upload',value:file.name,previewUrl:detailsUploadUrl};detailsRender();});
 document.getElementById('details-remove-image')?.addEventListener('click',()=>{m.image={type:'preset',value:'bottle'};if(detailsUploadUrl){URL.revokeObjectURL(detailsUploadUrl);detailsUploadUrl=null;}detailsRender();});
}
function detailsShowDeleteDialog(m) {
 let dialog=document.getElementById('details-delete-dialog');
 if(!dialog){dialog=document.createElement('div');dialog.id='details-delete-dialog';dialog.className='details-delete-overlay';dialog.innerHTML=`<div class="details-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="details-delete-title"><div class="details-delete-icon"><i class="fa-solid fa-trash"></i></div><h2 id="details-delete-title">Delete medication?</h2><p id="details-delete-message"></p><div class="details-delete-actions"><button type="button" id="details-delete-cancel" class="details-dialog-cancel">Cancel</button><button type="button" id="details-delete-confirm" class="details-dialog-confirm">Delete</button></div></div>`;detailsWorkspace.appendChild(dialog);}
 dialog.querySelector('#details-delete-message').textContent=`${m.name} will be removed from your medication list. This action cannot be undone.`;dialog.hidden=false;
 dialog.querySelector('#details-delete-cancel').onclick=()=>dialog.hidden=true;
 dialog.querySelector('#details-delete-confirm').onclick=()=>{medications=medications.filter(x=>x.id!==m.id);dialog.hidden=true;detailsExit();renderMedications();};
 dialog.onclick=e=>{if(e.target===dialog)dialog.hidden=true;};
}
function detailsOpen(m) { viewedMedicationId=m.id;detailsStep=0;detailsEditing=false;medicationTabs.forEach(t=>t.hidden=true);Object.values(medicationPanels).forEach(p=>p.hidden=true);detailsWorkspace.hidden=false;document.querySelector(".medications-workspace").classList.add("details-view-active");detailsRender(); }
function detailsExit() { detailsWorkspace.hidden=true;document.querySelector('.medications-workspace').classList.remove('details-view-active');medicationTabs.forEach(t=>t.hidden=false);switchMainTab('list');viewedMedicationId=null;detailsEditing=false; }
detailsBack.addEventListener('click',detailsExit);

// INITIALIZE MEDISYNC
addReminderRow();
updateQuantityAvailability();
updateScheduleFields();
showStep(0);
updateDraftCount();
renderMedications();
