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

    const maliciousTableBody = document.getElementById('malicious-table-body');

    // Fetch malicious logs from API
    const fetchMaliciousLogs = async () => {
        try {
            const response = await fetch('http://172.16.4.4:8888/api/logs/get-all');
            const logs = await response.json();
            return Array.isArray(logs) ? logs : [];
        } catch (error) {
            console.error('Error fetching malicious logs:', error);
            return [];
        }
    };

    // Render table
    const renderTable = (logs) => {
        maliciousTableBody.innerHTML = '';
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.email}</td>
                <td>${log.role || '-'}</td>
                <td>${log.timestamp}</td>
                <td>${log.activityType}</td>
                <td class="status ${log.status?.toLowerCase() || ''}">${log.status || 'Pending'}</td>
                <td>
                    <button class="btn btn-danger" data-email="${log.email}" data-action="block">Block</button>
                    <button class="btn btn-warning" data-email="${log.email}" data-action="reject">Delete</button>
                </td>
            `;
            maliciousTableBody.appendChild(row);
        });
    };

    // Handle button actions
    maliciousTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const email = button.dataset.email;
        const action = button.dataset.action;

        try {
            if (action === 'block') {
                await fetch(`http://172.16.4.4:8888/api/logs/block/${email}`, { method: 'PUT' });
                alert(`Malicious activity from ${email} has been blocked.`);
            } else if (action === 'reject') {
                await fetch(`http://172.16.4.4:8888/api/users/reject/${email}`, { method: 'PUT' });
                alert(`Malicious activity from ${email} has been deleted.`);
            }

            // Refresh table after action
            const updatedLogs = await fetchMaliciousLogs();
            renderTable(updatedLogs);
        } catch (error) {
            console.error(`Error performing action "${action}" for ${email}:`, error);
            alert(`Failed to ${action} ${email}.`);
        }
    });

    // Initial fetch and render
    const logs = await fetchMaliciousLogs();
    renderTable(logs);
});
