
const API_URL = "https://localhost:7020/api/Auth";

document.addEventListener("DOMContentLoaded", () => {

    const workspace = document.querySelector(".workspace");
    const settingsContent = document.querySelector(".settings-content");
    const settingsNav = document.querySelector(".settings-nav-bar");
    const personalInfo = document.querySelector("#perso-info");

    if (!workspace || !settingsContent || !settingsNav || !personalInfo) return;

    // LOAD CURRENT USER
    let currentUser = JSON.parse(
        localStorage.getItem("medisync_user") || "null"
    );

    if (!currentUser || !currentUser.id) {
        alert("Please log in again.");
        window.location.href = "index.html";
        return;
    }
    // DISPLAY PROFILE PICTURE IN SIDEBAR
    const sidebarPicture = document.getElementById("sidebar-profile-picture");
    const defaultAvatar = document.getElementById("sidebar-default-avatar");

    if (currentUser.photo && sidebarPicture && defaultAvatar) {
        sidebarPicture.src = currentUser.photo;
        sidebarPicture.style.display = "block";
        defaultAvatar.style.display = "none";
    }

    // DISPLAY USER NAME IN SIDEBAR
    const sidebarName = document.querySelector(".sidebar-user-name");

    if (sidebarName) {
        sidebarName.textContent = currentUser.name || "User Name";
    }

    // DISPLAY PERSONAL INFORMATION
    function displayPersonalInfo() {
        document.getElementById("settings-fullname").textContent =
            currentUser.name || "Not provided";

        document.getElementById("settings-email").textContent =
            currentUser.loginId || "Not provided";

        document.getElementById("settings-birthday").textContent =
            currentUser.dateOfBirth
                ? new Date(currentUser.dateOfBirth).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
                : "Not available";

        document.getElementById("settings-phone").textContent =
            currentUser.emergencyContact || "Not provided";
    }

    displayPersonalInfo();

    // EDIT PERSONAL INFORMATION
    const fields = [
        {
            key: "name",
            id: "settings-fullname",
            label: "Full Name",
            type: "text"
        },
        {
            key: "loginId",
            id: "settings-email",
            label: "Email Address",
            type: "email"
        },
        {
            key: "dateOfBirth",
            id: "settings-birthday",
            label: "Date of Birth",
            type: "date"
        },
        {
            key: "emergencyContact",
            id: "settings-phone",
            label: "Phone Number",
            type: "tel"
        }
    ];

    fields.forEach(field => {

        const valueElement = document.getElementById(field.id);
        if (!valueElement) return;

        const row = valueElement.closest(".settings-row");
        const editButton = row.querySelector(".rs-action-button");

        if (!editButton) return;

        editButton.addEventListener("click", () => {

            if (row.querySelector(".settings-edit-input")) return;

            const originalValue = currentUser[field.key] || "";

            const input = document.createElement("input");
            input.type = field.type;
            input.className = "settings-edit-input";

            input.value =
                field.type === "date" && originalValue
                    ? originalValue.substring(0, 10)
                    : originalValue;

            if (field.type === "date") {
                input.max = new Date().toISOString().split("T")[0];
            }

            valueElement.replaceWith(input);

            const actions = document.createElement("div");
            actions.className = "settings-edit-actions";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "Save";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Cancel";

            actions.append(saveButton, cancelButton);
            editButton.replaceWith(actions);

            function restoreDisplay() {
                input.replaceWith(valueElement);
                actions.replaceWith(editButton);
            }

            cancelButton.addEventListener("click", restoreDisplay);

            saveButton.addEventListener("click", async () => {

                const newValue = input.value.trim();

                if (!newValue) {
                    alert(`Please enter your ${field.label.toLowerCase()}.`);
                    return;
                }

                if (
                    field.type === "email" &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)
                ) {
                    alert("Please enter a valid email address.");
                    return;
                }

                let calculatedAge = currentUser.age;

                if (field.type === "date") {

                    const birthday = new Date(newValue + "T00:00:00");
                    const today = new Date();

                    if (
                        Number.isNaN(birthday.getTime()) ||
                        birthday > today
                    ) {
                        alert("Please select a valid date that is not in the future.");
                        return;
                    }

                    calculatedAge =
                        today.getFullYear() - birthday.getFullYear();

                    if (
                        today.getMonth() < birthday.getMonth() ||
                        (
                            today.getMonth() === birthday.getMonth() &&
                            today.getDate() < birthday.getDate()
                        )
                    ) {
                        calculatedAge--;
                    }
                }

                if (
                    field.type === "tel" &&
                    !/^[0-9+\-\s()]{7,20}$/.test(newValue)
                ) {
                    alert("Please enter a valid phone number.");
                    return;
                }

                saveButton.disabled = true;
                saveButton.textContent = "Saving...";

                try {

                    let response;

                    if (field.key === "loginId") {

                        response = await fetch(
                            `${API_URL}/email/${currentUser.id}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    email: newValue
                                })
                            }
                        );

                    } else {

                        const requestBody = {
                            role: currentUser.role || "",
                            name: field.key === "name"
                                ? newValue
                                : currentUser.name || "",
                            age: field.key === "dateOfBirth"
                                ? calculatedAge
                                : currentUser.age,
                            dateOfBirth: field.key === "dateOfBirth"
                                ? newValue
                                : currentUser.dateOfBirth || null,
                            emergencyContact: field.key === "emergencyContact"
                                ? newValue
                                : currentUser.emergencyContact || "",
                            photo: currentUser.photo || ""
                        };

                        response = await fetch(
                            `${API_URL}/profile/${currentUser.id}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(requestBody)
                            }
                        );
                    }

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message || "Unable to update information."
                        );
                    }

                    // UPDATE LOCAL USER DATA
                    currentUser[field.key] = newValue;

                    if (field.key === "dateOfBirth") {
                        currentUser.age = calculatedAge;
                    }

                    if (field.key === "loginId") {
                        currentUser.loginId = data.loginId || newValue;
                    }

                    localStorage.setItem(
                        "medisync_user",
                        JSON.stringify(currentUser)
                    );

                    // RESTORE ORIGINAL HTML BEFORE DISPLAYING
                    restoreDisplay();
                    displayPersonalInfo();

                    alert(`${field.label} updated successfully.`);

                } catch (error) {

                    alert(error.message || "Unable to connect to the server.");

                    saveButton.disabled = false;
                    saveButton.textContent = "Save";
                }
            });
        });
    });

    // PROFILE PICTURE SELECTOR
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
                    accept="image/jpeg,image/png,image/webp" hidden>
            </div>

            <div class="settings-pfp-options">

                <div class="settings-pfp-group">
                    <h2 id="settings-pfp-title">Recent Profile Pictures</h2>
                    <div class="settings-pfp-choices">
                        <button class="settings-pfp-choice"
                            type="button" data-preset="orange"
                            aria-label="Orange profile picture">
                            <i class="fa-regular fa-user" style="color:#E28A00"></i>
                        </button>
                    </div>
                </div>

                <div class="settings-pfp-group">
                    <h2>Presets</h2>

                    <div class="settings-pfp-choices">
                        <button class="settings-pfp-choice"
                            type="button" data-preset="orange">
                            <i class="fa-regular fa-user" style="color:#E28A00"></i>
                        </button>

                        <button class="settings-pfp-choice"
                            type="button" data-preset="red">
                            <i class="fa-regular fa-user" style="color:#E53935"></i>
                        </button>

                        <button class="settings-pfp-choice"
                            type="button" data-preset="navy">
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
    const photoSaveButton = overlay.querySelector(".settings-pfp-save");

    let selectedPreset = "navy";
    let uploadedImageUrl = null;

    function openProfileOverlay() {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeProfileOverlay() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        profileButton.focus();
    }

    function selectPreset(preset, button) {

        selectedPreset = preset;

        if (uploadedImageUrl) {
            URL.revokeObjectURL(uploadedImageUrl);
            uploadedImageUrl = null;
        }

        const color =
            preset === "orange" ? "#E28A00" :
                preset === "red" ? "#E53935" :
                    "var(--navy)";

        preview.innerHTML = `
            <i class="fa-solid fa-circle-user" style="color:${color}"></i>
        `;

        choices.forEach(choice => {
            choice.setAttribute(
                "aria-pressed",
                String(choice === button)
            );
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
        if (
            event.key === "Escape" &&
            overlay.classList.contains("is-open")
        ) {
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

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            alert("Please select a JPG, PNG, or WEBP image.");
            fileInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Please select an image smaller than 2 MB.");
            fileInput.value = "";
            return;
        }

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

    photoSaveButton.addEventListener("click", async () => {

        if (uploadedImageUrl) {

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async () => {
                await saveProfilePhoto(reader.result);
            };

            reader.readAsDataURL(file);

        } else {
            // Preset colors are visual choices only.
            // Keep the existing uploaded photo unchanged.
            if (currentUser.photo) {
                profileButton.innerHTML = `
                    <img src="${currentUser.photo}"
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
        }
    });

    async function saveProfilePhoto(photo) {

        photoSaveButton.disabled = true;

        try {

            const response = await fetch(
                `${API_URL}/profile/${currentUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        role: currentUser.role || "",
                        name: currentUser.name || "",
                        age: currentUser.age,
                        dateOfBirth: currentUser.dateOfBirth || null,
                        emergencyContact: currentUser.emergencyContact || "",
                        photo: photo
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save profile picture."
                );
            }

            currentUser.photo = photo;

            localStorage.setItem(
                "medisync_user",
                JSON.stringify(currentUser)
            );

            profileButton.innerHTML = `
                <img src="${photo}"
                    alt="Profile picture"
                    style="width:42px;height:42px;object-fit:cover;border-radius:50%">
            `;

            closeProfileOverlay();
            alert("Profile picture updated successfully.");

        } catch (error) {

            alert(error.message || "Unable to save profile picture.");

        } finally {
            photoSaveButton.disabled = false;
        }
    }

});
