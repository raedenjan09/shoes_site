$(document).ready(function () {
    const url = window.location.origin + '/'

    $("#registerForm").on('submit', function (e) {
        e.preventDefault();
        var form = $('#registerForm')[0];
        var formData = new FormData(form);
        $.ajax({
            method: "POST",
            url: url + "api/v1/register",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (data) {
                // Auto-login after successful registration
                const email = formData.get('email');
                const password = formData.get('password');
                $.ajax({
                    method: "POST",
                    url: url + "api/v1/login",
                    data: JSON.stringify({ email, password }),
                    processData: false,
                    contentType: 'application/json; charset=utf-8',
                    dataType: "json",
                    success: function (loginData) {
                        sessionStorage.setItem('token', JSON.stringify(loginData.token));
                        sessionStorage.setItem('userId', loginData.user.id);
                        sessionStorage.setItem('role', loginData.user.role);
                        if (loginData.user.role === 'admin') {
                            window.location.href = 'dashboard.html';
                        } else {
                            window.location.href = 'home.html';
                        }
                    },
                    error: function (loginError) {
                        Swal.fire({ icon: 'error', text: 'Auto-login failed. Please login manually.' });
                    }
                });
            },
            error: function (error) {
                Swal.fire({ icon: 'error', text: 'Registration failed.' });
            }
        });
    });

    $('#avatar').on('change', function () {
        const file = this.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarPreview').attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        } else {
            $('#avatarPreview').hide();
        }
    });

    $("#login").on('click', function (e) {
        e.preventDefault();

        let email = $("#email").val()
        let password = $("#password").val()
        let user = {
            email,
            password
        }
        $.ajax({
            method: "POST",
            url: `${url}api/v1/login`,
            data: JSON.stringify(user),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({
                    text: data.success,
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 1000,
                    timerProgressBar: true
                });
                sessionStorage.setItem('token', JSON.stringify(data.token));
                sessionStorage.setItem('userId', data.user.id); // Ensure userId is saved after login
                sessionStorage.setItem('role', data.user.role); // Save role for later use
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'home.html';
                }
            },
            error: function (error) {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    text: error.responseJSON.message,
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 1000,
                    timerProgressBar: true
                });
            }
        });
    });

    $("#updateBtn").on('click', function (event) {
        event.preventDefault();
        userId = sessionStorage.getItem('userId') ?? sessionStorage.getItem('userId')
       
        var data = $('#profileForm')[0];
       
        let formData = new FormData(data);
        formData.append('userId', userId)

        $.ajax({
            method: "POST",
            url: `${url}api/v1/update-profile`,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "json",
            headers: {
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('token'))
            },
            success: function (data) {
                console.log(data);
                Swal.fire({
                    icon: 'success',
                    title: 'Profile updated!',
                    showConfirmButton: false,
                    timer: 1500
                });
                if (data.user && data.user.image_path) {
                    $('#avatarPreview').attr('src', data.user.image_path).show();
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

     $("#deactivateBtn").on('click', function (e) {
        e.preventDefault();
        let email = $("#email").val()
        let user = {
            email,
        }
        $.ajax({
            method: "DELETE",
            url: `${url}api/v1/deactivate`,
            data: JSON.stringify(user),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({
                    text: data.message,
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 2000,
                    timerProgressBar: true
                });
                sessionStorage.removeItem('userId')
                // window.location.href = 'home.html'
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // Fetch and display user profile on profile.html
    if (window.location.pathname.endsWith('profile.html')) {
        console.log("Profile page JS running!");
        const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        $.ajax({
            method: 'GET',
            url: url + 'api/v1/profile',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (data) {
                console.log("Profile data received:", data);
                if (data && data.user) {
                    $('#title').val(data.user.title || '');
                    $('#firstName').val(data.user.fname || '');
                    $('#lastName').val(data.user.lname || '');
                    $('#address').val(data.user.addressline || '');
                    $('#town').val(data.user.town || '');
                    $('#zipcode').val(data.user.zipcode || '');
                    $('#phone').val(data.user.phone || '');
                    if (data.user.image_path) {
                        $('#avatarPreview').attr('src', data.user.image_path).show();
                    } else {
                        $('#avatarPreview').hide();
                    }
                }
            },
            error: function (err) {
                Swal.fire({ icon: 'error', text: 'Failed to load profile.' });
            }
        });
        // Add back button
        if ($('#backBtn').length === 0) {
            $('.container').prepend('<button id="backBtn" class="btn btn-secondary mb-3">Back</button>');
            $('#backBtn').on('click', function() {
                window.location.href = 'home.html';
            });
        }
    }

    // --- Profile Modal Logic ---
    function getToken() {
        return sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
    }
    function getUserId() {
        return sessionStorage.getItem('userId');
    }
    function setNavbarAvatar(user) {
        if (user && user.image_path) {
            $('#navbarAvatar').attr('src', user.image_path);
        } else if (user && user.fname && user.lname) {
            const initials = user.fname.charAt(0) + user.lname.charAt(0);
            $('#navbarAvatar').attr('src', `https://ui-avatars.com/api/?name=${initials}`);
        } else {
            $('#navbarAvatar').attr('src', 'https://ui-avatars.com/api/?name=U');
        }
    }

    const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
    if (token) {
        $.ajax({
            method: 'GET',
            url: window.location.origin + '/api/v1/profile',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                if (data && data.user) {
                    setNavbarAvatar(data.user);
                }
            }
        });
    }
});