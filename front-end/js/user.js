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
                if (error.responseJSON && error.responseJSON.error === 'deactivated') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Your account is deactivated',
                        text: 'Please contact support if you think this is a mistake.',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then(() => {
                        sessionStorage.clear();
                        window.location.href = 'login.html';
                    });
                } else if (error.responseJSON && error.responseJSON.message) {
                    Swal.fire({ icon: 'error', text: error.responseJSON.message });
                } else {
                    Swal.fire({ icon: 'error', text: 'An error occurred. Please try again.' });
                }
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
                if (error.responseJSON && error.responseJSON.error === 'deactivated') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Your account is deactivated',
                        text: 'Please contact support if you think this is a mistake.',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then(() => {
                        sessionStorage.clear();
                        window.location.href = 'login.html';
                    });
                } else if (error.responseJSON && error.responseJSON.message) {
                    Swal.fire({ icon: 'error', text: error.responseJSON.message });
                } else {
                    Swal.fire({ icon: 'error', text: 'An error occurred. Please try again.' });
                }
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
                    const imgPath = data.user.image_path.startsWith('/') || data.user.image_path.startsWith('http') ? data.user.image_path : '/images/' + data.user.image_path.replace(/^.*[\\\/]/, '');
                    $('#avatarPreview').attr('src', imgPath).show();
                }
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
                        const imgPath = data.user.image_path.startsWith('/') || data.user.image_path.startsWith('http') ? data.user.image_path : '/images/' + data.user.image_path.replace(/^.*[\\\/]/, '');
                        $('#avatarPreview').attr('src', imgPath).show();
                    } else {
                        $('#avatarPreview').hide();
                    }
                }
            },
            error: function (err) {
                if (err.responseJSON && err.responseJSON.error === 'deactivated') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Your account is deactivated',
                        text: 'Please contact support if you think this is a mistake.',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then(() => {
                        sessionStorage.clear();
                        window.location.href = 'login.html';
                    });
                } else if (err.responseJSON && err.responseJSON.message) {
                    Swal.fire({ icon: 'error', text: err.responseJSON.message });
                } else {
                    Swal.fire({ icon: 'error', text: 'An error occurred. Please try again.' });
                }
            }
        });
        // Add back button
        if ($('#backBtn').length === 0) {
            $('.container').prepend('<button id="backBtn" class="btn btn-secondary mb-3">Back</button>');
            $('#backBtn').on('click', function() {
                window.location.href = 'home.html';
            });
        }

        // --- User Order Management Section ---
        let allOrders = [];

        // Updated renderOrders with filter and Bootstrap card
        function renderOrders(orders, filterStatus = 'all') {
            allOrders = orders; // Save for filtering
            let html = '';
            let filtered = (filterStatus === 'all') ? orders : orders.filter(order => order.status === filterStatus);

            if (filtered.length === 0) {
                html = '<p>No orders found.</p>';
            } else {
                filtered.forEach(order => {
                    html += `
                        <div class="card mb-2">
                          <div class="card-body">
                            <b>Order #${order.orderinfo_id}</b> - Placed: ${new Date(order.date_placed).toLocaleString()}
                            <span class="badge badge-pill badge-${getStatusBadge(order.status)} float-right">${order.status}</span>
                            <br>
                            <button class="btn btn-sm btn-primary view-order-btn mt-2" data-id="${order.orderinfo_id}">View Details</button>
                            ${order.status === 'pending' ? `<button class="btn btn-sm btn-danger cancel-order-btn mt-2" data-id="${order.orderinfo_id}">Cancel</button>` : ''}
                          </div>
                        </div>
                    `;
                });
            }
            $('#ordersSection').html(html);
        }

        // Helper for badge color
        function getStatusBadge(status) {
            switch (status) {
                case 'pending': return 'secondary';
                case 'processing': return 'info';
                case 'shipped': return 'warning';
                case 'delivered': return 'success';
                case 'cancelled': return 'danger';
                default: return 'light';
            }
        }

        // Filter button handler
        $(document).on('click', '.order-filter-btn', function () {
            const status = $(this).data('status');
            renderOrders(allOrders, status);
        });

        // Fetch and display user orders
        $.ajax({
            method: 'GET',
            url: url + 'api/v1/orders',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                if (data && data.orders) {
                    renderOrders(data.orders);
                }
            },
            error: function () {
                $('#ordersSection').html('<p>Failed to load orders.</p>');
            }
        });

        // Handle view details
        $(document).on('click', '.view-order-btn', function () {
            const orderId = $(this).data('id');
            $.ajax({
                method: 'GET',
                url: url + 'api/v1/order/' + orderId,
                headers: { 'Authorization': 'Bearer ' + token },
                success: function (data) {
                    if (data && data.order) {
                        showOrderDetails(data.order);
                    }
                },
                error: function () {
                    alert('Failed to load order details.');
                }
            });
        });

        // Handle cancel order
        $(document).on('click', '.cancel-order-btn', function () {
            const orderId = $(this).data('id');
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you really want to cancel this order?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        method: 'PATCH',
                        url: url + 'api/v1/orders/' + orderId + '/cancel',
                        headers: { 'Authorization': 'Bearer ' + token },
                        success: function (data) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Cancelled!',
                                text: 'Your order has been cancelled.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            setTimeout(() => location.reload(), 1600);
                        },
                        error: function (xhr) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: xhr.responseJSON?.error || 'Failed to cancel order.'
                            });
                        }
                    });
                }
            });
        });

        // Show order details in a Bootstrap modal
        function showOrderDetails(order) {
            let html = `<h5>Order #${order.orderinfo_id}</h5>
                        <p>Status: <span class="badge badge-${getStatusBadge(order.status)}">${order.status}</span></p>
                        <p>Placed: ${new Date(order.date_placed).toLocaleString()}</p>
                        <ul class="list-group mb-2">`;
            order.items.forEach(item => {
                html += `<li class="list-group-item d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;vertical-align:middle;margin-right:10px;">
                    <span class="flex-grow-1">${item.name} - Qty: ${item.quantity} Total: $${Number(item.sell_price * item.quantity).toFixed(2)}</span>
                </li>`;
                if (order.status === 'delivered') {
                    html += `<button class="btn btn-sm btn-success add-review-btn" data-item-id="${item.item_id}">Add Review</button>`;
                }
            });
            html += '</ul>';
            $('#orderDetailsModalBody').html(html);
            $('#orderDetailsModal').modal('show');
        }
        // --- End User Order Management Section ---
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
            const imgPath = user.image_path.startsWith('/') || user.image_path.startsWith('http') ? user.image_path : '/images/' + user.image_path.replace(/^.*[\\\/]/, '');
            $('#navbarAvatar').attr('src', imgPath);
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

    // Open review modal
    $(document).on('click', '.add-review-btn', function() {
      const itemId = $(this).data('item-id');
      $('#reviewItemId').val(itemId);
      $('#reviewRating').val('');
      $('#reviewComment').val('');
      $('#reviewModal').modal('show');
    });

    // Submit review
    $('#reviewForm').on('submit', function(e) {
      e.preventDefault();
      const item_id = $('#reviewItemId').val();
      const rating = $('#reviewRating').val();
      const comment = $('#reviewComment').val();
      const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
      $.ajax({
        method: 'POST',
        url: '/api/v1/reviews',
        headers: { 'Authorization': 'Bearer ' + token },
        data: JSON.stringify({ item_id, rating, comment }),
        contentType: 'application/json',
        success: function() {
          $('#reviewModal').modal('hide');
          Swal.fire('Thank you!', 'Your review has been submitted.', 'success');
          // Optionally refresh the order list or UI
        },
        error: function(xhr) {
          Swal.fire('Error', xhr.responseJSON?.error || 'Could not submit review.', 'error');
        }
      });
    });
});