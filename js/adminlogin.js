
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');

    const showMessage = (message, type) => {
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        messageContainer.style.color = type === 'error' ? '#e74c3c' : '#2ecc71';
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (email === '' || password === '') {
                showMessage('Please enter both email and password.', 'error');
                return;
            }

            try {
                const response = await fetch('http://172.16.4.4:8888/hq/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage('Login successful! Redirecting', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard.html';
                    }, 1000);
                } else {
                    showMessage(data.message || 'Invalid credentials.', 'error');
                }
            } catch (error) {
                console.error('Error during login:', error);
                showMessage('Server error. Please try again later.', 'error');
            }
        });
    }
});
