
const API_URL = "https://localhost:7020/api/Auth";

document.addEventListener("DOMContentLoaded", () => {

    const pictureInput = document.getElementById("profile-pic");
    const pictureButton = document.getElementById("pic-action-btn");
    const picturePreview = document.getElementById("profile-preview");
    const fileName = document.getElementById("file-name");

    if (!pictureInput || !pictureButton || !picturePreview) return;

    const form = document.getElementById("accsetup-form");
    const error = document.getElementById("form-error");
    const finishButton = form.querySelector(".finish-button");

    // Profile picture selection
    pictureButton.addEventListener("click", () => {
        pictureInput.click();
    });

    // Profile picture preview and validation
    pictureInput.addEventListener("change", () => {

        const file = pictureInput.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please select a JPG, PNG, or WEBP image.");
            pictureInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Please select an image smaller than 2 MB.");
            pictureInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {
            picturePreview.innerHTML = `
                <img src="${event.target.result}" alt="Profile picture preview">
            `;
        };

        reader.readAsDataURL(file);

        fileName.textContent = file.name;

        pictureButton.innerHTML = `
            <i class="fa-solid fa-pen"></i>
            Change Picture
        `;
    });

    // Convert profile picture into a string
    function getProfilePicture() {
        return new Promise((resolve, reject) => {

            const file = pictureInput.files[0];

            if (!file) {
                resolve("");
                return;
            }

            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(
                new Error("Could not read profile picture.")
            );

            reader.readAsDataURL(file);
        });
    }

    // Save profile information to backend
    form.addEventListener("submit", async event => {

        event.preventDefault();

        error.textContent = "";

        const user = JSON.parse(
            localStorage.getItem("medisync_user") || "null"
        );

        if (!user || !user.id) {
            error.textContent = "Account information not found. Please log in again.";
            return;
        }

        const name = document.getElementById("fullname").value.trim();
        const birthdate = document.getElementById("b-date").value;
        const emergencyContact = document.getElementById("phone").value.trim();

        if (!name || !birthdate || !emergencyContact) {
            error.textContent = "Please complete all required fields.";
            return;
        }

        const birthDateValue = new Date(birthdate + "T00:00:00");
        const today = new Date();

        if (birthDateValue > today) {
            error.textContent = "Birthdate cannot be in the future.";
            return;
        }

        let age = today.getFullYear() - birthDateValue.getFullYear();

        const birthdayNotReached =
            today.getMonth() < birthDateValue.getMonth() ||
            (today.getMonth() === birthDateValue.getMonth() &&
                today.getDate() < birthDateValue.getDate());

        if (birthdayNotReached) {
            age--;
        }

        finishButton.disabled = true;
        finishButton.textContent = "Saving...";

        try {

            const photo = await getProfilePicture();

            const response = await fetch(`${API_URL}/profile/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role: "",
                    name: name,
                    age: age,
                    dateOfBirth: birthdate,
                    emergencyContact: emergencyContact,
                    photo: photo
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.title ||
                    "Unable to save profile."
                );
            }

            // Update local user information
            user.name = name;
            user.age = age;
            user.dateOfBirth = birthdate;
            user.emergencyContact = emergencyContact;
            user.photo = photo;

            localStorage.setItem(
                "medisync_user",
                JSON.stringify(user)
            );

            window.location.href = "dashboard.html";

        } catch (err) {

            error.textContent = err.message ||
                "Unable to connect to the backend.";

            finishButton.disabled = false;
            finishButton.innerHTML = `
                Finish
                <i class="fa-solid fa-arrow-right"></i>
            `;
        }
    });

});
