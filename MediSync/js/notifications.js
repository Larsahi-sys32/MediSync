/* ========================================
   NOTIFICATIONS OVERLAY FUNCTIONALITY
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const notificationButton = document.getElementById(
    "notification-button"
  );

  const notificationsOverlay = document.getElementById(
    "notifications-overlay"
  );

  if (!notificationButton || !notificationsOverlay) {
    return;
  }

  // OPEN NOTIFICATIONS
  function openNotifications() {

    notificationsOverlay.classList.add("active");

    notificationsOverlay.setAttribute("aria-hidden", "false");

    notificationButton.setAttribute("aria-expanded", "true");

    document.body.style.overflow = "hidden";

  }

  // CLOSE NOTIFICATIONS
  function closeNotifications() {

    notificationsOverlay.classList.remove("active");

    notificationsOverlay.setAttribute("aria-hidden", "true");

    notificationButton.setAttribute("aria-expanded", "false");

    document.body.style.overflow = "";

  }

  // TOGGLE USING BELL BUTTON
  notificationButton.addEventListener("click", () => {

    const isOpen = notificationsOverlay.classList.contains("active");

    if (isOpen) {
      closeNotifications();
    } else {
      openNotifications();
    }

  });

  // CLOSE WHEN CLICKING OUTSIDE THE PANEL
  notificationsOverlay.addEventListener("click", (event) => {

    if (event.target === notificationsOverlay) {
      closeNotifications();
    }

  });

  // CLOSE USING ESCAPE
  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      notificationsOverlay.classList.contains("active")
    ) {
      closeNotifications();
      notificationButton.focus();
    }

  });

});