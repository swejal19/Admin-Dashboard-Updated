
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

    // 1. Get DOM elements
    const approvedUsersStat = document.getElementById('approved-users-stat');
    const pendingRequestsStat = document.getElementById('pending-requests-stat');
    const maliciousLogsStat = document.getElementById('malicious-logs-stat');
    const activityLogList = document.querySelector('.activity-log ul');

    // 2. Function to create a recent activity item with placeholder icon (Kept as is)
    const createActivityItem = (type, text) => {
        const li = document.createElement('li');
        let iconHtml = '';
        switch (type) {
            case 'approved':
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.8"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                break;
            case 'malicious':
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                break;
            case 'registered':
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>';
                break;
            case 'maintenance':
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-tool"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94-7.94l-3.77 3.77a1 1 0 0 0 0 1.4zm-12.2 0a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94-7.94l-3.77 3.77a1 1 0 0 0 0 1.4z"></path></svg>';
                break;
            case 'security':
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                break;
        }
        li.innerHTML = `<span>${iconHtml}</span> ${text}`;
        return li;
    };

    try {
        // 3. Concurrently fetch all necessary data to improve performance
        const [approvedResponse, pendingResponse, logsResponse] = await Promise.all([
            fetch('http://172.16.4.4:8888/api/users/active'),
            fetch('http://172.16.4.4:8888/api/users/pending'),
            fetch('http://172.16.4.4:8888/api/logs/get-all')
        ]);

        // Check for response errors
        if (!approvedResponse.ok || !pendingResponse.ok || !logsResponse.ok) {
            throw new Error('One or more API fetches failed.');
        }

        const approvedData = await approvedResponse.json();
        const pendingData = await pendingResponse.json();
        const logsData = await logsResponse.json();

        // 4. Update Stats
        // Approved Users
        const approvedCount = Array.isArray(approvedData) ? approvedData.length : 0;
        approvedUsersStat.textContent = approvedCount.toLocaleString();

        // Pending Requests
        const pendingCount = Array.isArray(pendingData) ? pendingData.length : 0;
        pendingRequestsStat.textContent = pendingCount.toLocaleString();

        // Malicious Logs
        const maliciousCount = Array.isArray(logsData) ? logsData.filter(log => log.status === 'REJECTED' || log.status === 'BLOCKED').length : 0;
        maliciousLogsStat.textContent = maliciousCount.toLocaleString();
        // // Malicious Logs
        // const maliciousCount = Array.isArray(logsData) ? logsData.filter(log => log.type === 'malicious').length : 0;
        // maliciousLogsStat.textContent = maliciousCount.toLocaleString();

        // 5. Populate Recent Activity (Reusing the fetched data)

        // Approved requests
        if (Array.isArray(approvedData)) {
            // Use the data already fetched as 'approvedData'
            approvedData.forEach(req => activityLogList.appendChild(createActivityItem('approved', `User ${req.name} approved a request.`)));
        }

        // Malicious, Maintenance, Security logs
        if (Array.isArray(logsData)) {
            // Use the data already fetched as 'logsData'
            logsData.forEach(log => {
                if (log.type === 'malicious') {
                    activityLogList.appendChild(createActivityItem('malicious', `Malicious activity detected: ${log.detail || log.email || 'N/A'}`));
                } else if (log.type === 'maintenance') {
                    activityLogList.appendChild(createActivityItem('maintenance', `System maintenance scheduled: ${log.detail || 'N/A'}`));
                } else if (log.type === 'security') {
                    activityLogList.appendChild(createActivityItem('security', `Security alert: ${log.detail || 'N/A'}`));
                }
            });
        }

        // Registered/Pending users
        if (Array.isArray(pendingData)) {
            // Use the data already fetched as 'pendingData'
            pendingData.forEach(user => activityLogList.appendChild(createActivityItem('registered', `New user ${user.name} registered.`)));
        }

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback for UI if API fails
        approvedUsersStat.textContent = '-';
        pendingRequestsStat.textContent = '-';
        maliciousLogsStat.textContent = '-';
        const li = document.createElement('li');
        li.textContent = 'Error loading recent activity.';
        activityLogList.appendChild(li);
    }
});