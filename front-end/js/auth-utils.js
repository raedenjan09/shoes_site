// Authentication utilities for frontend

// Check if user is logged in
function isLoggedIn() {
    const token = sessionStorage.getItem('token');
    return token && token !== 'null' && token !== 'undefined';
}

// Get current token
function getToken() {
    const token = sessionStorage.getItem('token');
    return token ? JSON.parse(token) : null;
}

// Get current user ID
function getUserId() {
    return sessionStorage.getItem('userId');
}

// Get current user role
function getRole() {
    return sessionStorage.getItem('role');
}

// Check if user is admin
function isAdmin() {
    return getRole() === 'admin';
}

// Logout function that calls backend API
function logout() {
    const token = getToken();
    if (token) {
        $.ajax({
            method: 'POST',
            url: window.location.origin + '/api/v1/logout',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(data) {
                console.log('Logged out successfully');
            },
            error: function(xhr) {
                console.log('Logout error:', xhr);
            },
            complete: function() {
                // Always clear storage and redirect, even if API call fails
                clearSession();
                window.location.href = 'login.html';
            }
        });
    } else {
        // If no token, just clear storage and redirect
        clearSession();
        window.location.href = 'login.html';
    }
}

// Clear all session data
function clearSession() {
    sessionStorage.clear();
    // Also clear any user-specific cart data
    const cartKey = 'cart_' + getUserId();
    if (cartKey) {
        localStorage.removeItem(cartKey);
    }
}

// Handle authentication errors
function handleAuthError(xhr) {
    if (xhr.status === 401) {
        // Token expired or invalid
        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'OK'
        }).then(() => {
            clearSession();
            window.location.href = 'login.html';
        });
        return true; // Error was handled
    }
    return false; // Error was not handled
}

// Add authentication headers to AJAX requests
function addAuthHeaders(headers = {}) {
    const token = getToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

// Setup global AJAX error handler for authentication
$(document).ready(function() {
    $(document).ajaxError(function(event, xhr, settings) {
        if (xhr.status === 401) {
            handleAuthError(xhr);
        }
    });
});

// Export functions for use in other files
window.authUtils = {
    isLoggedIn,
    getToken,
    getUserId,
    getRole,
    isAdmin,
    logout,
    clearSession,
    handleAuthError,
    addAuthHeaders
}; 