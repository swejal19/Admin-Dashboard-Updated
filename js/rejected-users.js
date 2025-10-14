let rejectedUsersData = [];
let filteredUsers = [];
const usersPerPage = 5;
let currentPage = 1;

// Custom modal function to replace alert()
function showModal(message) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalOkBtn = document.getElementById('modalOkBtn');

    modalMessage.textContent = message;
    modal.style.display = 'block';

    modalOkBtn.onclick = function () {
        modal.style.display = 'none';
    };
}

// Fetch rejected users from API
async function fetchRejectedUsers() {
    try {
        const response = await fetch('http://172.16.4.4:8888/api/users/blocked');
        const users = await response.json();
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        return [];
    }
}

// Function to render the table rows
function renderTable(users, page) {
    const tableBody = document.getElementById('rejected-users-table-body');
    tableBody.innerHTML = '';

    const start = (page - 1) * usersPerPage;
    const end = start + usersPerPage;
    const paginatedUsers = users.slice(start, end);

    if (paginatedUsers.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">No blocked users found.</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        paginatedUsers.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.email = user.email;
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status rejected">${user.status}</span></td>
                <td>
                    <button class="btn btn-restore btn-sm">Restore</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Function to render pagination buttons
function renderPagination(users) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const pageCount = Math.ceil(users.length / usersPerPage);
    if (users.length <= usersPerPage) return;

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = i;
            renderTable(users, currentPage);
            renderPagination(users);
        });
        paginationContainer.appendChild(button);
    }
}

// Filter users based on search input
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredUsers = rejectedUsersData.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
    );

    currentPage = 1;
    renderTable(filteredUsers, currentPage);
    renderPagination(filteredUsers);
}

// Event listener for Restore/Delete buttons
document.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const email = row.dataset.email;

    try {
        if (e.target.classList.contains('btn-restore')) {
            await fetch(`http://172.16.4.4:8888/api/users/restore/${email}`, { method: 'PUT' });
            showModal('User restored successfully!');
        }
        // } else if (e.target.classList.contains('btn-delete')) {
        //     await fetch(`http://172.16.4.4:8888/api/users/reject/${email}`, { method: 'PUT' });
        //     showModal('User permanently deleted!');
        // }

        // Refresh table
        rejectedUsersData = await fetchRejectedUsers();
        filteredUsers = rejectedUsersData;
        renderTable(filteredUsers, currentPage);
        renderPagination(filteredUsers);
    } catch (error) {
        console.error('Error performing action:', error);
        showModal('Action failed. Please try again.');
    }
});

// Initialize page
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


    rejectedUsersData = await fetchRejectedUsers();
    filteredUsers = rejectedUsersData;

    renderTable(filteredUsers, currentPage);
    renderPagination(filteredUsers);

    document.getElementById('searchInput').addEventListener('input', filterUsers);
});
