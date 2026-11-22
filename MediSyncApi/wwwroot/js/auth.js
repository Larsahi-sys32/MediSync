
const API_URL = "https://localhost:7020/api/Auth";

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const form = document.getElementById("auth-form");
const submitButton = document.getElementById("submit-button");
const terms = document.getElementById("terms");
const error = document.getElementById("form-error");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

function setMode(mode) {
    const login = mode === "login";

    document.body.classList.toggle("login-mode", login);

    loginTab.classList.toggle("active", login);
    signupTab.classList.toggle("active", !login);

    loginTab.setAttribute("aria-selected", String(login));
    signupTab.setAttribute("aria-selected", String(!login));

    submitButton.textContent = login ? "Login" : "Sign Up";

    document.querySelector(".confirm-field").style.display = login ? "none" : "";
    document.querySelector(".terms-row").style.display = login ? "none" : "";

    confirmPasswordInput.required = !login;

    passwordInput.autocomplete = login
        ? "current-password"
        : "new-password";

    error.textContent = "";

    updateSignupButton();
}

loginTab.addEventListener("click", () => setMode("login"));
signupTab.addEventListener("click", () => setMode("signup"));

document.getElementById("forgot-password-link").addEventListener("click", event => {
    event.preventDefault();
    error.textContent = "Password recovery is not available yet.";
});

document.querySelectorAll(".eye-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const icon = button.querySelector("i");

        const reveal = input.type === "password";

        input.type = reveal ? "text" : "password";

        icon.classList.toggle("fa-eye", !reveal);
        icon.classList.toggle("fa-eye-slash", reveal);

        button.setAttribute(
            "aria-label",
            reveal ? "Hide password" : "Show password"
        );
    });
});

function updateSignupButton() {
    const login = document.body.classList.contains("login-mode");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const validLogin = email !== "" && password !== "";

    const validSignup =
        email !== "" &&
        password !== "" &&
        confirmPasswordInput.value !== "" &&
        password === confirmPasswordInput.value &&
        terms.checked;

    submitButton.disabled = !(login ? validLogin : validSignup);
}

[emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener("input", updateSignupButton);
});

terms.addEventListener("change", updateSignupButton);

form.addEventListener("submit", async event => {
    event.preventDefault();

    const login = document.body.classList.contains("login-mode");

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    error.textContent = "";

    if (!email || !password) {
        error.textContent = "Please complete all required fields.";
        return;
    }

    if (!login && !confirmPassword) {
        error.textContent = "Please confirm your password.";
        return;
    }

    if (!login && password !== confirmPassword) {
        error.textContent = "Passwords do not match.";
        return;
    }

    if (!login && !terms.checked) {
        error.textContent = "You must agree to the Terms and Services.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = login ? "Logging in..." : "Creating account...";

    try {
        const endpoint = login ? "login" : "signup";

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginId: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.title ||
                "Authentication failed. Please try again."
            );
        }

        if (login) {
            // Save the logged-in user's information
            localStorage.setItem("medisync_user", JSON.stringify(data));

            // Go to the appropriate page
            window.location.href = data.name
                ? "dashboard.html"
                : "accountsetup.html";

        } else {
            // Prepare the new user's information
            const newUser = {
                id: data.id,
                loginId: data.loginId,
                role: "",
                name: "",
                age: null,
                dateOfBirth: null,
                emergencyContact: "",
                photo: ""
            };

            localStorage.setItem(
                "medisync_user",
                JSON.stringify(newUser)
            );

            window.location.href = "accountsetup.html";
        }

    } catch (err) {
        error.textContent = err.message;

        submitButton.textContent = login ? "Login" : "Sign Up";

        updateSignupButton();
    }
});

// Start with Sign Up mode
setMode("signup");
