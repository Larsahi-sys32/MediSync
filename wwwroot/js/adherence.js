
/* ========================================
   ADHERENCE PAGE INTERACTIONS
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     REPORT PERIOD
  ======================================== */

  const periodSelect = document.getElementById("report-period");
  const reportDateRange = document.getElementById("report-date-range");

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
  }

  function getPeriodRange(period) {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);

    switch (period) {
      case "today":
        break;

      case "this-week": {
        const day = today.getDay();
        const difference = day === 0 ? 6 : day - 1;

        start.setDate(today.getDate() - difference);
        end.setDate(start.getDate() + 6);
        break;
      }

      case "this-month":
        start.setDate(1);
        end.setMonth(today.getMonth() + 1, 0);
        break;

      case "this-year":
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;

      case "all-time":
        return "Showing all recorded medication reports";

      default:
        return "";
    }

    if (period === "today") {
      return `Showing reports for ${formatDate(today)}`;
    }

    return `Showing reports from ${formatDate(start)} to ${formatDate(end)}`;
  }

  function updateReportPeriod() {
    if (!periodSelect || !reportDateRange) return;

    reportDateRange.textContent = getPeriodRange(periodSelect.value);
  }

  if (periodSelect) {
    periodSelect.addEventListener("change", updateReportPeriod);
    updateReportPeriod();
  }


  /* ========================================
     EXPORT REPORT
  ======================================== */

  const exportButton = document.getElementById("exportbtn");

  if (exportButton) {
    exportButton.addEventListener("click", () => {

      const reportCards = document.querySelectorAll(".report-card");

      const reportData = [
        ["Medication Report"],
        ["Period", periodSelect?.selectedOptions[0]?.textContent || "This Week"],
        [reportDateRange?.textContent || ""],
        [],
        ["Category", "Value", "Description"]
      ];

      reportCards.forEach(card => {
        const label = card.querySelector(".report-card-label")?.textContent.trim();
        const value = card.querySelector(".report-card-value")?.textContent.trim();
        const description = card.querySelector(".report-card-description")?.textContent.trim();

        reportData.push([label, value, description]);
      });

      reportData.push([]);
      reportData.push(["Recent Dose History"]);

      reportData.push([
        "Medication",
        "Scheduled Time",
        "Status",
        "Recorded By"
      ]);

      document.querySelectorAll("#dose-history-list .dose-history-row").forEach(row => {
        const name = row.querySelector(".dose-med-name")?.textContent.trim();
        const time = row.querySelector(".dose-time")?.textContent.trim();
        const status = row.querySelector(".dose-status")?.textContent.trim();
        const recordedBy = row.querySelector(".recorded-by")?.textContent.trim() || "Self";

        reportData.push([name, time, status, recordedBy]);
      });

      const csv = reportData.map(row =>
        row.map(value => {
          const escaped = String(value ?? "").replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",")
      ).join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "MediSync-Medication-Report.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    });
  }


  /* ========================================
     VIEW ALL DOSE HISTORY
  ======================================== */

  const viewAllButton = document.getElementById("view-all-history");
  const historyList = document.getElementById("dose-history-list");

  if (!viewAllButton || !historyList) return;

  const overlay = document.createElement("div");
  overlay.className = "dose-history-overlay";

  overlay.setAttribute("aria-hidden", "true");

  overlay.innerHTML = `
    <div class="dose-history-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dose-history-title">

      <div class="dose-history-dialog-header">

        <div class="dose-history-heading">
          <h2 id="dose-history-title">Dose History</h2>
          <p id="dose-history-period">This Week</p>
        </div>

        <button
          type="button"
          class="dose-history-close"
          aria-label="Close dose history"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

      </div>

      <div class="dose-history-dialog-content"></div>

    </div>
  `;

  document.body.appendChild(overlay);

  const dialogContent = overlay.querySelector(
    ".dose-history-dialog-content"
  );

  const closeButton = overlay.querySelector(".dose-history-close");

/* ========================================
   DOSE HISTORY FILTERING
======================================== */

const dialogTitle = overlay.querySelector(
  "#dose-history-title"
);
const dialogPeriod = overlay.querySelector(
  "#dose-history-period"
);

function openHistoryOverlay(filter = "all", title = "Dose History") {

  dialogContent.innerHTML = "";
  dialogTitle.textContent = title;

  const selectedPeriod = periodSelect?.selectedOptions[0]?.textContent || "This Week";
  dialogPeriod.textContent = selectedPeriod;

  const rows = [...historyList.querySelectorAll(".dose-history-row")];

  const filteredRows = rows.filter(row => {
    const status = row.dataset.status;

    return filter === "all" || status === filter;
  });

  if (filteredRows.length === 0) {
    dialogContent.innerHTML = `
      <div class="dose-history-empty">
        No dose records found for this category.
      </div>
    `;
  } else {
    const filteredList = document.createElement("div");
    filteredList.className = "dose-history-list";

    filteredRows.forEach(row => {
      filteredList.appendChild(row.cloneNode(true));
    });

    dialogContent.appendChild(filteredList);
  }

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeHistoryOverlay() {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
  viewAllButton.focus();
}


/* VIEW ALL */

viewAllButton.addEventListener("click", () => {
  openHistoryOverlay("all", "Dose History");
});


/* REPORT CARDS */

const reportCards = document.querySelectorAll(
  ".report-card[data-history-filter]"
);

reportCards.forEach(card => {

  function handleCardClick() {
    const filter = card.dataset.historyFilter;

    const titles = {
      all: "Adherence Rate - Dose History",
      taken: "Taken Doses",
      missed: "Missed Doses",
      late: "Late Doses"
    };

    openHistoryOverlay(
      filter,
      titles[filter] || "Dose History"
    );
  }

  card.addEventListener("click", handleCardClick);

  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  });

});


/* CLOSE OVERLAY */

closeButton.addEventListener("click", closeHistoryOverlay);

overlay.addEventListener("click", event => {
  if (event.target === overlay) {
    closeHistoryOverlay();
  }
});

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    overlay.classList.contains("is-open")
  ) {
    closeHistoryOverlay();
  }
    });
});
