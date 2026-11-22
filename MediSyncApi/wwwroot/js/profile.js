
const API_URL = "https://localhost:7020/api/Auth";

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(
        localStorage.getItem("medisync_user") || "null"
    );

    const form = document.getElementById("profile-form");
    const nameInput = document.getElementById("profile-name");
    const birthdayInput = document.getElementById("profile-birthday");
    const ageInput = document.getElementById("profile-age");
    const emergencyInput = document.getElementById("profile-emergency");
    const pictureInput = document.getElementById("profile-picture-input");
    const pictureButton = document.getElementById("upload-picture-button");
    const picturePreview = document.getElementById("profile-picture-preview");
    const error = document.getElementById("profile-error");

    if (!user || !user.id) {
        error.textContent = "Please log in again.";
        return;
    }

    // Load saved profile information
    nameInput.value = user.name || "";

    birthdayInput.value = user.dateOfBirth
        ? user.dateOfBirth.substring(0, 10)
        : "";

    ageInput.value = user.age ?? "";
    emergencyInput.value = user.emergencyContact || "";

    if (user.photo) {
        picturePreview.innerHTML = `<img src="${user.photo}" alt="Profile picture">`;
    }
    // Automatically calculate age from birthday
    birthdayInput.addEventListener("change", () => {
        if (!birthdayInput.value) return;

        const birthDate = new Date(birthdayInput.value + "T00:00:00");
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
                today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        if (age < 0) {
            error.textContent = "Please enter a valid birthday.";
            return;
        }

        error.textContent = "";
        ageInput.value = age;
    });

    // Open picture selector
    pictureButton.addEventListener("click", () => {
        pictureInput.click();
    });

    // Preview selected picture
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
            picturePreview.innerHTML =
                `<img src="${event.target.result}" alt="Profile picture">`;
        };

        reader.readAsDataURL(file);
    });

    // Save profile information
    form.addEventListener("submit", async event => {
        event.preventDefault();

        error.textContent = "";

        const name = nameInput.value.trim();
        const age = Number(ageInput.value);
        const emergencyContact = emergencyInput.value.trim();

        if (!name || !ageInput.value || !emergencyContact) {
            error.textContent = "Please complete all required fields.";
            return;
        }

        if (!Number.isInteger(age) || age < 0) {
            error.textContent = "Please enter a valid age.";
            return;
        }

        try {
            let photo = user.photo || "";
            const file = pictureInput.files[0];

            if (file) {
                photo = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(
                        new Error("Could not read the selected picture.")
                    );
                    reader.readAsDataURL(file);
                });
            }

            const response = await fetch(
                `${API_URL}/profile/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        role: user.role || "",
                        name: name,
                        age: age,
                        dateOfBirth: birthdayInput.value,
                        emergencyContact: emergencyContact,
                        photo: photo
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save profile.");
            }
            user.name = name;
            user.age = age;
            user.dateOfBirth = birthdayInput.value;
            user.emergencyContact = emergencyContact;
            user.photo = photo;

            localStorage.setItem(
                "medisync_user",
                JSON.stringify(user)
            );

            alert("Profile updated successfully!");

        } catch (err) {
            error.textContent = err.message;
        }
    });

});
