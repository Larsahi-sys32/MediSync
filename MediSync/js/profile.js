/* Profile page: saves the details Kimuel uses (stored in this browser only). */
(function () {
  const KEY = "medisync_profile";
  const form = document.getElementById("profile-form");
  const status = document.getElementById("profile-status");
  if (!form) return;

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}

  form.name.value = saved.name || "";
  form.age.value = saved.age ?? "";
  form.allergies.value = saved.allergies || "";
  form.pregnantOrBreastfeeding.value = saved.pregnantOrBreastfeeding || "";

  form.addEventListener("submit", e => {
    e.preventDefault();
    const age = form.age.value === "" ? null : Number(form.age.value);
    if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) {
      status.textContent = "Please enter a valid age (0 to 120).";
      return;
    }
    const data = {
      ...saved,
      name: form.name.value.trim(),
      age,
      allergies: form.allergies.value.trim(),
      pregnantOrBreastfeeding: form.pregnantOrBreastfeeding.value
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      saved = data;
      status.textContent = "Saved. Kimuel will use these details.";
    } catch {
      status.textContent = "Couldn’t save. Please check your browser storage settings.";
    }
  });
})();
