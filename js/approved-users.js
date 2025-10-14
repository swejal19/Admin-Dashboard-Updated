document.addEventListener('DOMContentLoaded', async () => {



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



    const approvedUsersTableBody = document.getElementById('approved-users-table-body');

    // Fetch approved users from API
    const fetchApprovedUsers = async () => {
        try {
            const response = await fetch('http://172.16.4.4:8888/api/users/active');
            const users = await response.json();
            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error('Error fetching approved users:', error);
            return [];
        }
    };

    // Render table
    const renderTable = (users) => {
        approvedUsersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role || '-'}</td>
                <td>${user.status || 'Active'}</td>
                <td>
                    <button class="btn btn-danger" data-email="${user.email}" data-action="block">Block</button>
                    <button class="btn btn-warning" data-email="${user.email}" data-action="remove">Remove</button>
                </td>
            `;
            approvedUsersTableBody.appendChild(row);
        });
    };

    // Handle button actions
    approvedUsersTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const email = button.dataset.email;
        const action = button.dataset.action;

        try {
            if (action === 'block') {
                await fetch(`http://172.16.4.4:8888/api/users/block/${email}`, { method: 'PUT' });
                alert(`User ${email} has been blocked.`);
            } else if (action === 'remove') {
                await fetch(`http://172.16.4.4:8888/api/users/reject/${email}`, { method: 'PUT' });
                alert(`User ${email} has been removed.`);
            }

            // Refresh the table after action
            const updatedUsers = await fetchApprovedUsers();
            renderTable(updatedUsers);
        } catch (error) {
            console.error(`Error performing action "${action}" for user ${email}:`, error);
            alert(`Failed to ${action} user ${email}.`);
        }
    });

    // Initial fetch and render
    const users = await fetchApprovedUsers();
    renderTable(users);
});
