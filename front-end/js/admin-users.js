// admin-users.js

// Fetch and display all users for admin
async function fetchAndDisplayUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in as admin to view users.');
        return;
    }
    try {
        const response = await fetch('/api/v1/users', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to fetch users');
        }
        const data = await response.json();
        const users = data.users;
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayUsers); 