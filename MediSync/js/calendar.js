
/* ========================================
   MEDISYNC - CALENDAR FRONTEND
======================================== */

let medications = [
  {
    id: "test-001",
    name: "Test Medication",
    dose: "500 mg",
    time: "08:00 AM",
    date: "2026-11-25",
    instructions: "This is a test instruction.",
    notificationEnabled: true,
    status: "upcoming"
  },
  {
    id: "test-002",
    name: "Second Test Medication",
    dose: "1 tablet",
    time: "01:00 PM",
    date: "2026-11-23",
    instructions: "Second test instruction.",
    notificationEnabled: false,
    status: "upcoming"
  },
  {
    id: "test-003",
    name: "Previous Day Test",
    dose: "250 mg",
    time: "09:00 AM",
    date: "2026-11-13",
    instructions: "Previous day test.",
    notificationEnabled: true,
    status: "upcoming"
  }
];

/* ========================================
   GLOBAL ELEMENTS
======================================== */

const todayPanel = document.getElementById("today-panel");
const monthPanel = document.getElementById("month-panel");

const calendarGrid = document.getElementById("calendar-grid");
const currentMonthLabel = document.getElementById("current-month");

const previousMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");

const noteOverlay = document.getElementById("note-overlay");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const noteClose = document.getElementById("note-close");

const todayTab = document.getElementById("todsched-tab");
const monthTab = document.getElementById("monthcal-tab");

const datePreviewOverlay = document.getElementById(
  "date-preview-overlay"
);
const previewMedications = document.getElementById(
  "preview-medications"
);
const datePreviewTitle = document.getElementById(
  "date-preview-title"
);
const closeDatePreview = document.getElementById(
  "close-date-preview"
);
const dateHoverPreview = document.getElementById(
  "date-hover-preview"
);

/* ========================================
   DATE UTILITIES
======================================== */

const today = new Date();

let displayedMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

let selectedDate = formatDate(today);

let hoveredDate = null;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDisplayDate(dateString) {
  return parseDate(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/* ========================================
   MEDICATION UTILITIES
======================================== */

function getMedicationsForDate(dateString) {
  return medications
    .filter(medication => medication.date === dateString)
    .sort((a, b) => {
      return getTimeValue(a.time) - getTimeValue(b.time);
    });
}

function getTimeValue(timeString) {
  if (!timeString) return 0;

  const date = new Date(`January 1, 2000 ${timeString}`);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function getMedicationStatus(medication) {
  return medication.status || "upcoming";
}

/* ========================================
   CALENDAR TABS
======================================== */

function switchTab(tabName) {
  const showToday = tabName === "today";

  todayPanel.hidden = !showToday;
  monthPanel.hidden = showToday;

  todayTab.classList.toggle("active", showToday);
  monthTab.classList.toggle("active", !showToday);

  todayTab.setAttribute("aria-selected", String(showToday));
  monthTab.setAttribute("aria-selected", String(!showToday));

  if (!showToday) {
    renderCalendar();
  }
}

todayTab.addEventListener("click", () => {
  switchTab("today");
});

monthTab.addEventListener("click", () => {
  switchTab("month");
});

/* ========================================
   TODAY'S SCHEDULE
======================================== */

function renderTodaySchedule() {
  const container = document.querySelector(
    "#today-panel .workspace-container"
  );

  if (!container) return;

  container.innerHTML = "";

  const todayMedications = getMedicationsForDate(
    formatDate(today)
  );

  const heading = document.createElement("div");
  heading.className = "view-heading";

  heading.innerHTML = `
    <div>
      <p>${formatDisplayDate(formatDate(today))}</p>
    </div>

    <span class="schedule-count">
      ${todayMedications.length} scheduled
    </span>
  `;

  container.appendChild(heading);

  if (todayMedications.length === 0) {
    const emptyState = document.createElement("div");

    emptyState.className = "empty-schedule";

    emptyState.innerHTML = `
      <i class="fa-regular fa-calendar-check"></i>

      <h2>No medications scheduled</h2>

      <p>
        Your scheduled medications will appear here
        when they are added.
      </p>
    `;

    container.appendChild(emptyState);
    return;
  }

  const medicationList = document.createElement("div");
  medicationList.className = "medication-list";

  todayMedications.forEach(medication => {
    const row = document.createElement("article");

    row.className = "medication-row";

    if (getMedicationStatus(medication) === "taken") {
      row.classList.add("taken");
    }

    const isTaken = getMedicationStatus(medication) === "taken";

    row.innerHTML = `
      <div class="medication-time">
        ${escapeHTML(medication.time || "--:--")}
      </div>

      <div class="medication-information">
        <h3>${escapeHTML(medication.name || "Medication name")}</h3>
        <p>${escapeHTML(medication.dose || "Dose amount")}</p>
      </div>

      <div class="medication-actions">

        <div class="notification-control">
          <i class="fa-regular fa-clock notification-icon"></i>
          <label class="notification-switch">
            <input
              type="checkbox"
              data-notification-toggle="${escapeHTML(medication.id)}"
              ${medication.notificationEnabled ? "checked" : ""}
              aria-label="Toggle notifications for ${escapeHTML(medication.name || "medication")}"
            >
            <span class="switch-slider"></span>
          </label>
        </div>

        <button
          type="button"
          class="medication-action-button"
          data-note="${escapeHTML(medication.id)}"
          aria-label="View medication instructions"
          title="Instructions"
        >
          <i class="fa-regular fa-note-sticky"></i>
        </button>

        <button
          type="button"
          class="medication-status-button ${isTaken ? "taken" : ""}"
          data-taken="${escapeHTML(medication.id)}"
          ${isTaken ? "disabled" : ""}
        >
          ${isTaken ? "Taken" : "Mark as Taken"}
        </button>

      </div>
    `;

    medicationList.appendChild(row);
  });

  container.appendChild(medicationList);
}

/* ========================================
   SAFE HTML TEXT
======================================== */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

/* ========================================
   MEDICATION ACTIONS
======================================== */

document.addEventListener("change", event => {
  const toggle = event.target.closest(
    "[data-notification-toggle]"
  );

  if (!toggle) return;

  const medication = medications.find(item =>
    item.id === toggle.dataset.notificationToggle
  );

  if (!medication) return;

  medication.notificationEnabled = toggle.checked;

  /*
    FRONTEND ONLY:

    This changes the individual medication's
    notification preference in the current session.

    Connect this to your backend when available.
  */
});

document.addEventListener("click", event => {
  const takenButton = event.target.closest("[data-taken]");

  if (takenButton) {
    const medication = medications.find(item =>
      item.id === takenButton.dataset.taken
    );

    if (!medication) return;

    medication.status = "taken";

    renderTodaySchedule();
    renderCalendar();

    return;
  }

  const noteButton = event.target.closest("[data-note]");

  if (noteButton) {
    const medication = medications.find(item =>
      item.id === noteButton.dataset.note
    );

    if (!medication) return;

    openNote(
      medication.name || "Instructions",
      medication.instructions || "No instructions available."
    );
  }
});

/* ========================================
   MONTH CALENDAR
======================================== */

function renderCalendar() {
  if (!calendarGrid || !currentMonthLabel) return;

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  currentMonthLabel.textContent = displayedMonth.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric"
    }
  );

  calendarGrid.innerHTML = "";

  renderWeekdays();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const totalCells = Math.ceil(
    (startingDay + totalDays) / 7
  ) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startingDay + 1;

    const cellDate = new Date(year, month, dayNumber);

    const dateString = formatDate(cellDate);

    const isCurrentMonth =
      cellDate.getMonth() === month;

    const isToday =
      dateString === formatDate(today);

    const isSelected =
      dateString === selectedDate;

    const dayMedications = getMedicationsForDate(dateString);

    const dayElement = document.createElement("button");

    dayElement.type = "button";
    dayElement.className = "calendar-day";

    dayElement.dataset.date = dateString;

    if (!isCurrentMonth) {
      dayElement.classList.add("other-month");
    }

    if (isToday) {
      dayElement.classList.add("today");
    }

    if (isSelected) {
      dayElement.classList.add("selected");
    }

    const indicators = getDateIndicators(dayMedications);

    dayElement.innerHTML = `
      <span class="calendar-day-number">
        ${cellDate.getDate()}
      </span>

      <span class="calendar-day-indicators">
        ${indicators}
      </span>
    `;

    dayElement.setAttribute(
      "aria-label",
      `${formatDisplayDate(dateString)}, ${dayMedications.length} scheduled medications`
    );

    calendarGrid.appendChild(dayElement);
  }
}

/* ========================================
   WEEKDAY LABELS
======================================== */

function renderWeekdays() {
  let weekdays = document.querySelector(".calendar-weekdays");

  if (!weekdays) {
    weekdays = document.createElement("div");
    weekdays.className = "calendar-weekdays";

    calendarGrid.before(weekdays);
  }

  weekdays.innerHTML = `
    <span>Sun</span>
    <span>Mon</span>
    <span>Tue</span>
    <span>Wed</span>
    <span>Thu</span>
    <span>Fri</span>
    <span>Sat</span>
  `;


  //CALENDAR LEGENDS

  let legend = document.querySelector(".calendar-legend");

  if (!legend) {
    legend = document.createElement("div");
    legend.className = "calendar-legend";

    calendarGrid.after(legend);
  }

  legend.innerHTML = `
    <span>
      <i class="legend-dot all-taken"></i>
      All Taken
    </span>

    <span>
      <i class="legend-dot upcoming"></i>
      Upcoming
    </span>

    <span>
      <i class="legend-dot partial"></i>
      Partial
    </span>

    <span>
      <i class="legend-dot missed"></i>
      Missed
    </span>
  `;
}

/* ========================================
   DATE STATUS INDICATORS
======================================== */

function getDateIndicators(dayMedications) {
  if (dayMedications.length === 0) return "";

  const statuses = [
    ...new Set(dayMedications.map(getMedicationStatus))
  ];

  const indicatorClasses = statuses.map(status => {
    switch (status) {
      case "taken":
        return "all-taken";

      case "missed":
        return "missed";

      default:
        return "upcoming";
    }
  });

  return indicatorClasses
    .map(className => `
      <i class="${className}"></i>
    `)
    .join("");
}

/* ========================================
   MONTH NAVIGATION
======================================== */

previousMonthButton.addEventListener("click", () => {
  displayedMonth.setMonth(displayedMonth.getMonth() - 1);

  selectedDate = null;

  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  displayedMonth.setMonth(displayedMonth.getMonth() + 1);

  selectedDate = null;

  renderCalendar();
});

/* ========================================
   DATE INTERACTIONS
======================================== */

// CLICK: OPEN CENTERED MODAL

calendarGrid.addEventListener("click", event => {
  const day = event.target.closest(".calendar-day");

  if (!day || !day.dataset.date) return;

  selectedDate = day.dataset.date;

  displayedMonth = new Date(
    parseDate(selectedDate).getFullYear(),
    parseDate(selectedDate).getMonth(),
    1
  );

  renderCalendar();

  openDatePreview(selectedDate);
});

// HOVER: SHOW FLOATING PREVIEW

calendarGrid.addEventListener("pointerover", event => {

  if (event.pointerType !== "mouse") return;

  const day = event.target.closest(".calendar-day");

  if (!day || !calendarGrid.contains(day)) return;

  // Ignore movement between children of the same date

  if (day.contains(event.relatedTarget)) return;

  showDateHoverPreview(day.dataset.date, day);

});

// HIDE WHEN LEAVING A DATE

calendarGrid.addEventListener("pointerout", event => {

  if (event.pointerType !== "mouse") return;

  const day = event.target.closest(".calendar-day");

  if (!day) return;

  if (day.contains(event.relatedTarget)) return;

  hideDateHoverPreview();

});

// CLOSE MODAL

closeDatePreview.addEventListener(
  "click",
  closeDatePreviewModal
);

// CLOSE WHEN CLICKING DIMMED BACKGROUND

datePreviewOverlay.addEventListener("click", event => {
  if (event.target === datePreviewOverlay) {
    closeDatePreviewModal();
  }
});

// ESCAPE KEY

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    datePreviewOverlay.classList.contains("open")
  ) {
    closeDatePreviewModal();
  }
});

// HIDE HOVER PREVIEW WHEN SCROLLING

document.querySelector(".workspace").addEventListener(
  "scroll",
  hideDateHoverPreview
);

/* ========================================
   DATE PREVIEW CONTENT
======================================== */

function renderDatePreviewContent(dateString) {
  const dayMedications = getMedicationsForDate(dateString);

  return `
    ${
      dayMedications.length === 0
        ? `
          <p class="preview-empty">
            No medications scheduled for this date.
          </p>
        `
        : dayMedications.map(medication => `
          <div class="preview-medication">

            <span class="preview-medication-time">
              ${escapeHTML(medication.time || "--:--")}
            </span>

            <div class="preview-medication-info">
              <strong>
                ${escapeHTML(medication.name || "Medication name")}
              </strong>

              <span>
                ${escapeHTML(medication.dose || "Dose amount")}
              </span>
            </div>

            <span class="medication-preview-status">
              ${escapeHTML(getMedicationStatus(medication))}
            </span>

          </div>
        `).join("")
    }
  `;
}

/* ========================================
   FLOATING HOVER PREVIEW
======================================== */

function showDateHoverPreview(dateString, dayElement) {
  if (!dateHoverPreview) return;

  dateHoverPreview.innerHTML = `
    <h3>${formatDisplayDate(dateString)}</h3>

    <div class="preview-medications">
      ${renderDatePreviewContent(dateString)}
    </div>
  `;

  const rect = dayElement.getBoundingClientRect();

  const previewWidth = 300;
  const previewHeight = dateHoverPreview.offsetHeight || 180;

  let left = rect.left + rect.width / 2 - previewWidth / 2;
  let top = rect.bottom + 10;

  // Keep preview inside screen horizontally

  left = Math.max(
    12,
    Math.min(left, window.innerWidth - previewWidth - 12)
  );

  // Display above the date if there isn't enough room below

  if (top + previewHeight > window.innerHeight - 12) {
    top = rect.top - previewHeight - 10;
  }

  dateHoverPreview.style.left = `${left}px`;
  dateHoverPreview.style.top = `${Math.max(12, top)}px`;

  dateHoverPreview.classList.add("visible");
  dateHoverPreview.setAttribute("aria-hidden", "false");
}

function hideDateHoverPreview() {
  dateHoverPreview.classList.remove("visible");
  dateHoverPreview.setAttribute("aria-hidden", "true");
}

/* ========================================
   CENTERED DATE PREVIEW MODAL
======================================== */

function openDatePreview(dateString) {
  hideDateHoverPreview();

  datePreviewTitle.textContent = formatDisplayDate(dateString);

  previewMedications.innerHTML =
    renderDatePreviewContent(dateString);

  datePreviewOverlay.classList.add("open");

  datePreviewOverlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  closeDatePreview.focus();
}

function closeDatePreviewModal() {
  datePreviewOverlay.classList.remove("open");

  datePreviewOverlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");
}

/* ========================================
   INSTRUCTIONS STICKY NOTE
======================================== */

function openNote(title, content) {
  noteTitle.textContent = title;
  noteContent.textContent = content;

  noteOverlay.classList.add("open");
  noteOverlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  noteClose.focus();
}

function closeNote() {
  noteOverlay.classList.remove("open");
  noteOverlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");
}

noteClose.addEventListener("click", closeNote);

noteOverlay.addEventListener("click", event => {
  if (event.target === noteOverlay) {
    closeNote();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && noteOverlay.classList.contains("open")) {
    closeNote();
  }
});

/* ========================================
   INITIALIZATION
======================================== */

function initializeCalendar() {
  if (!todayPanel || !monthPanel) {
    console.error("Calendar panels could not be found.");
    return;
  }

  renderTodaySchedule();
  renderCalendar();

  switchTab("today");
}

initializeCalendar();
