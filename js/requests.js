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


    const requestsTableBody = document.getElementById('requests-table-body');

    // Fetch pending requests from backend
    const fetchPendingRequests = async () => {
        try {
            const response = await fetch('http://172.16.4.4:8888/api/users/pending');
            if (!response.ok) throw new Error('Failed to fetch pending requests');
            return await response.json();
        } catch (error) {
            console.error(error);
            alert('Error fetching pending requests');
            return [];
        }
    };

    // Render table rows
    const renderTable = (data) => {
        requestsTableBody.innerHTML = '';
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align:center; padding:20px;">No pending requests</td>`;
            requestsTableBody.appendChild(row);
            return;
        }

        data.forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${req.username}</td>
                <td>${req.username}</td>
                <td>${req.role}</td>
                <td>${req.dateRequested}</td>
                <td>
                    <button class="btn btn-success" data-email="${req.email}" data-action="approve">Approve</button>
                    <button class="btn btn-warning" data-email="${req.email}" data-action="block">Block</button>
                </td>
            `;
            requestsTableBody.appendChild(row);
        });
    };

    // Handle Approve / Reject actions
    requestsTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const email = button.dataset.email;
        const action = button.dataset.action;
        let apiUrl = '';
        let successMessage = '';

        if (action === 'approve') {
            apiUrl = `http://172.16.4.4:8888/api/users/approve_user/${email}`; // POST / PUT might be required depending on backend
            successMessage = `Request for ${email} approved`;
        } else if (action === 'block') {
            apiUrl = `http://172.16.4.4:8888/api/users/block/${email}`;
            successMessage = `Request for ${email} blocked`;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }) // assuming backend expects {email} in body
            });
            if (!response.ok) throw new Error(`Failed to ${action} request`);

            alert(successMessage);

            // Refresh table after action
            const updatedRequests = await fetchPendingRequests();
            renderTable(updatedRequests);

        } catch (error) {
            console.error(error);
            alert(`Error: Could not ${action} request`);
        }
    });

    // Initial load
    const pendingRequests = await fetchPendingRequests();
    renderTable(pendingRequests);
});
