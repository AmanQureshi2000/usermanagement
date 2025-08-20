const createUserForm = document.getElementById('createUserForm');
const userList = document.getElementById('userList');
const notification = document.getElementById('notification');
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');
const API_BASE_URL = 'https://userapi-n3qd.onrender.com/api/users';

const editUserModal = document.getElementById('editUserModal');
const editUserForm = document.getElementById('editUserForm');
const editUserId = document.getElementById('editUserId');
const editUsername = document.getElementById('editUsername');
const editEmail = document.getElementById('editEmail');
const editPassword = document.getElementById('editPassword');
const editFirstName = document.getElementById('editFirstName');
const editLastName = document.getElementById('editLastName');
const closeModalBtn = document.querySelector('.close-modal');
const cancelEditBtn = document.getElementById('cancelEdit');

togglePassword.addEventListener('click', () => {
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        togglePassword.textContent = '🔒';
    } else {
        passwordField.type = 'password';
        togglePassword.textContent = '👁️';
    }
});

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification ' + type;
    setTimeout(() => notification.className = 'notification', 3000);
}

function formatUserData(user) {
    return {
        id: user.id || user._id || 'N/A',
        username: user.username || 'Unknown',
        email: user.email || 'No email provided',
        first_name: user.first_name || user.name?.split(' ')[0] || 'Not specified',
        last_name: user.last_name || user.name?.split(' ')[1] || 'Not specified'
    };
}

function createUserCard(userData) {
    const user = formatUserData(userData);
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
        <div class="user-info">
            <div class="user-name">${user.first_name} ${user.last_name} (@${user.username})</div>
            <div class="user-details">
                <div>Email: ${user.email}</div>
                <div>ID: ${user.id}</div>
            </div>
        </div>
        <div class="actions">
            <button class="edit-btn" data-id="${user.id}">Edit</button>
            <button class="delete-btn" data-id="${user.id}">Delete</button>
        </div>
    `;
    return card;
}

function renderUsers(users) {
    const usersArray = users.users;
    if (!usersArray || usersArray.length === 0) {
        userList.innerHTML = '<div class="no-users">No users found</div>';
        return;
    }

    userList.innerHTML = '';
    usersArray.forEach(user => userList.appendChild(createUserCard(user)));

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId);
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openEditModal(userId);
        });
    });
}

async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw for the calling function to handle
    }
}

async function getUsers() {
    return await apiCall(API_BASE_URL);
}

async function createUser(userData) {
    const newUser = await apiCall(API_BASE_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    });
    
    showNotification('User created successfully!');
    setTimeout(loadUsers, 1000);
    return newUser;
}

async function updateUser(userId, userData) {
    try {
        const updatedUser = await apiCall(`${API_BASE_URL}/${userId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
        
        showNotification('User updated successfully!');
        setTimeout(loadUsers, 1000);
        return updatedUser;
    } catch (error) {
        console.error('Failed to update user:', error);
        showNotification('Failed to update user. Please try again.', 'error');
        throw error;
    }
}

async function deleteUser(userId) {
    await apiCall(`${API_BASE_URL}/${userId}`, {method: 'DELETE'});
    showNotification('User deleted successfully!');
    setTimeout(loadUsers, 1000);
}

function loadUsers() {
    userList.innerHTML = '<div class="loading">Loading users...</div>';
    getUsers().then(renderUsers).catch(() => {
        userList.innerHTML = '<div class="no-users">Error loading users. Please try again.</div>';
    });
}

function openEditModal(userId) {
    editUserId.value = userId;
    editUserModal.style.display = 'flex';
}

function closeEditModal() {
    editUserModal.style.display = 'none';
    editUserForm.reset();
}

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

window.addEventListener('click', (e) => {
    if (e.target === editUserModal) {
        closeEditModal();
    }
});

editUserForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        username: editUsername.value,
        email: editEmail.value,
        first_name: editFirstName.value,
        last_name: editLastName.value
    };
    
    if (editPassword.value) {
        userData.password = editPassword.value;
    }
    
    updateUser(editUserId.value, userData);
    closeEditModal();
});

createUserForm.addEventListener('submit', function(e) {
    e.preventDefault();
    createUser({
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value
    });
    this.reset();
});

document.addEventListener('DOMContentLoaded', loadUsers);
