document.addEventListener('DOMContentLoaded', () => {


    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (!themeToggle || !themeIcon) {
        console.warn('Theme toggle elements not found. Theme switching disabled.');
        return;
    }

    const updateIcon = (isDark) => {
        themeIcon.removeAttribute('data-feather');
        themeIcon.innerHTML = '';
        
        const iconName = isDark ? 'sun' : 'moon'; 
        themeIcon.setAttribute('data-feather', iconName);
        feather.replace(); 
    };

    const toggleTheme = () => {
        const isDark = htmlElement.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon(isDark);
    };

    // Initialize the icon state based on the theme applied by the inline <script> in the <head>
    const isDarkOnLoad = htmlElement.classList.contains('dark-theme');
    updateIcon(isDarkOnLoad);

    // Event listener for the toggle button
    themeToggle.addEventListener('click', toggleTheme);


    const securityForm = document.getElementById('security-form');
    const logoutBtn = document.getElementById('logout-btn'); // Make sure your logout <a> has id="logout-btn"
    const messageContainer = document.getElementById('message-container');

    const showMessage = (message, type = 'success') => {
        messageContainer.textContent = message;
        messageContainer.className = `message ${type}`;
        messageContainer.style.display = 'block';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 4000);
    };

    // Handle security form submission
    securityForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-new-password').value.trim();
        const twoFactorEnabled = document.getElementById('two-factor-auth').checked;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('Please fill in all password fields!', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match!', 'error');
            return;
        }

        try {
            const response = await fetch('http://172.16.4.4:8888/api/users/update-security', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, twoFactorEnabled })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Security settings updated successfully!');
                securityForm.reset();
            } else {
                showMessage(data.message || 'Failed to update security settings', 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Server error: Could not update security settings', 'error');
        }
    });

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // If you have a session or token, call logout API or clear session here
            alert('You have been logged out.');
            window.location.href = '/index.html';
        });
    }
});
