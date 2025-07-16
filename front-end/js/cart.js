$(document).ready(function () {
    const url = window.location.origin + '/'
    
    function getCartKey() {
        const userId = sessionStorage.getItem('userId');
        return userId ? `cart_${userId}` : null;
    }

    function getCart() {
        const key = getCartKey();
        if (!key) return [];
        let cart = localStorage.getItem(key);
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        const key = getCartKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = $('#cartCount');
        
        if (totalItems > 0) {
            cartCount.text(totalItems).show();
        } else {
            cartCount.hide();
        }
    }

    function renderCart() {
        let cart = getCart();
        let html = '';
        let total = 0;
        if (cart.length === 0) {
            html = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h4 class="text-muted">Your cart is empty</h4>
                    <p class="text-muted">Add some products to get started!</p>
                    <a href="home.html" class="btn btn-primary mt-3">
                        <i class="fas fa-shopping-bag mr-2"></i>Continue Shopping
                    </a>
                </div>`;
        } else {
            html = `<table class="table table-striped table-hover align-middle">
                <thead class="thead-dark">
                    <tr>
                        <th style="width:60px; text-align:center;">Image</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>`;
            cart.forEach((item, idx) => {
                let subtotal = item.price * item.quantity;
                total += subtotal;
                let imageSrc = item.image ? (item.image.startsWith('http') ? item.image : '/images/' + item.image.replace(/^.*[\\\/]/, '')) : 'https://via.placeholder.com/70?text=No+Image';
                html += `<tr>
                    <td class="cart-img-cell" style="width:32px;">
                        <img src="${imageSrc}" class="cart-img" alt="${item.description}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;display:block;margin:0 auto;">
                    </td>
                    <td>${item.description}</td>
                    <td>₱ ${item.price.toFixed(2)}</td>
                    <td>
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary decrease-qty" data-idx="${idx}">-</button>
                            <input type="number" class="form-control text-center qty-input" value="${item.quantity}" min="1" max="${item.stock}" data-idx="${idx}">
                            <button class="btn btn-outline-secondary increase-qty" data-idx="${idx}">+</button>
                        </div>
                    </td>
                    <td>₱ ${(subtotal).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-item" data-idx="${idx}" title="Remove">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
            });
            html += `</tbody></table>
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
                    <div>
                        <a href="home.html" class="btn btn-outline-primary mb-2 mb-md-0">
                            <i class="fas fa-arrow-left mr-2"></i>Continue Shopping
                        </a>
                    </div>
                    <div class="text-right">
                        <div class="cart-total-row mb-2">Total: ₱ ${total.toFixed(2)}</div>
                        <button class="btn btn-success checkout-btn" id="checkoutBtn">
                            <i class="fas fa-credit-card mr-2"></i>Proceed to Checkout
                        </button>
                    </div>
                </div>`;
        }
        $('#cartTable').html(html);
        updateCartCount();
    }

    const getToken = () => {
        const token = sessionStorage.getItem('token');
        return token ? JSON.parse(token) : null;
    }

    const isLoggedIn = () => {
        return sessionStorage.getItem('token') !== null;
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

    // Remove item from cart
    $('#cartTable').on('click', '.remove-item', function () {
        let idx = $(this).data('idx');
        let cart = getCart();
        
        Swal.fire({
            title: 'Remove Item?',
            text: 'Are you sure you want to remove this item from your cart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                cart.splice(idx, 1);
                saveCart(cart);
                renderCart();
                
                Swal.fire(
                    'Removed!',
                    'Item has been removed from your cart.',
                    'success'
                );
            }
        });
    });

    // Increase quantity
    $('#cartTable').on('click', '.increase-qty', function() {
        let idx = $(this).data('idx');
        let cart = getCart();
        
        if (cart[idx].quantity < cart[idx].stock) {
            cart[idx].quantity++;
            saveCart(cart);
            renderCart();
        } else {
            Swal.fire('Warning', 'Cannot exceed available stock!', 'warning');
        }
    });

    // Decrease quantity
    $('#cartTable').on('click', '.decrease-qty', function() {
        let idx = $(this).data('idx');
        let cart = getCart();
        
        if (cart[idx].quantity > 1) {
            cart[idx].quantity--;
            saveCart(cart);
            renderCart();
        } else {
            Swal.fire('Warning', 'Quantity cannot be less than 1!', 'warning');
        }
    });

    // Manual quantity input
    $('#cartTable').on('change', '.qty-input', function() {
        let idx = $(this).data('idx');
        let newQty = parseInt($(this).val());
        let cart = getCart();
        
        if (newQty >= 1 && newQty <= cart[idx].stock) {
            cart[idx].quantity = newQty;
            saveCart(cart);
            renderCart();
        } else {
            Swal.fire('Warning', 'Invalid quantity!', 'warning');
            renderCart(); // Reset to previous value
        }
    });

    // Checkout functionality
    $(document).on('click', '#checkoutBtn', function () {
        console.log("Checkout button clicked");
        // Check if user is logged in
        if (!isLoggedIn()) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'You must be logged in to checkout. Please login or register first.',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Register',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = 'register.html';
                }
            });
            return;
        }

        let cart = getCart();
        
        if (cart.length === 0) {
            Swal.fire('Warning', 'Your cart is empty!', 'warning');
            return;
        }

        // Show confirmation dialog
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        Swal.fire({
            title: 'Confirm Order',
            html: `
                <p>Total Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p><strong>Total Amount: ₱ ${total.toFixed(2)}</strong></p>
                <p>Are you sure you want to proceed with this order?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, place order!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading
                Swal.fire({
                    title: 'Processing Order...',
                    text: 'Please wait while we process your order.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const payload = JSON.stringify({ cart });
                
                $.ajax({
                    type: "POST",
                    url: `${url}api/v1/order`,
                    data: payload,
                    dataType: "json",
                    processData: false,
                    contentType: 'application/json; charset=utf-8',
                    headers: {
                        "Authorization": "Bearer " + getToken()
                    },
                    success: function (data) {
                        console.log(data);
                        Swal.fire({
                            icon: "success",
                            title: "Order Placed Successfully!",
                            text: data.message,
                            confirmButtonText: 'Continue Shopping'
                        }).then(() => {
                            localStorage.removeItem(getCartKey());
                            renderCart();
                            window.location.href = 'home.html';
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        Swal.fire({
                            icon: "error",
                            title: "Order Failed",
                            text: error.responseJSON?.message || "Something went wrong. Please try again.",
                        });
                    }
                });
            }
        });
    });

    // Load header and initialize
    $("#header").load("header.html", function() {
        updateCartCount();
    });

    renderCart();
    updateCartCount();
});