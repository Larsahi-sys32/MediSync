
document.addEventListener("DOMContentLoaded", () => {

    const pictureInput = document.getElementById("profile-pic");
    const pictureButton = document.getElementById("pic-action-btn");
    const picturePreview = document.getElementById("profile-preview");
    const fileName = document.getElementById("file-name");

    if (!pictureInput || !pictureButton || !picturePreview) return;

    pictureButton.addEventListener("click", () => {
        pictureInput.click();
    });

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

});
