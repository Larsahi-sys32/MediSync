
const API_URL = "https://localhost:7020/api/Auth";

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const form = document.getElementById("auth-form");
const submitButton = document.getElementById("submit-button");
const terms = document.getElementById("terms");
const error = document.getElementById("form-error");

function setMode(mode) {
    const login = mode === "login";
    document.body.classList.toggle("login-mode", login);
    loginTab.classList.toggle("active", login);
    signupTab.classList.toggle("active", !login);
    loginTab.setAttribute("aria-selected", String(login));
    signupTab.setAttribute("aria-selected", String(!login));
    submitButton.textContent = login ? "Login" : "Sign Up";
    document.getElementById("password").autocomplete = login ? "current-password" : "new-password";
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
        button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    });
});

function updateSignupButton() {
    const login = document.body.classList.contains("login-mode");
    submitButton.disabled = !login && !terms.checked;
}

terms.addEventListener("change", updateSignupButton);

form.addEventListener("submit", async event => {
    event.preventDefault();

    const login = document.body.classList.contains("login-mode");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

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
            throw new Error(data.message || "Something went wrong.");
        }

        localStorage.setItem("medisync_user", JSON.stringify(data));

        if (login) {
            window.location.href = data.name
                ? "dashboard.html"
                : "accountsetup.html";
        } else {
            window.location.href = "accountsetup.html";
        }

    } catch (err) {
        error.textContent = err.message || "Unable to connect to the server.";
        submitButton.textContent = login ? "Login" : "Sign Up";
        updateSignupButton();
    }
});

updateSignupButton();
