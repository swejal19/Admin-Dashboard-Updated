document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const messageContainer = document.getElementById('message-container');

    const showMessage = (message, type = 'error') => {
        messageContainer.textContent = message;
        messageContainer.className = `message ${type}`;
        messageContainer.style.display = 'block';
        messageContainer.style.color = type === 'error' ? '#e74c3c' : '#2ecc71';
    };

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch('http://172.16.4.4:8888/hq/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage("Registration successful! Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = '/admin/adminlogin.html';
                }, 1500);
            } else {
                showMessage(data.message || "Registration failed. Try again.", "error");
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage("Server error. Please try again later.", "error");
        }
    });
});
