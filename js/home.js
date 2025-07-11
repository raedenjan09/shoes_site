$(document).ready(function () {
    const url = window.location.origin + '/'
    var itemCount = 0;
    var priceTotal = 0;
    var quantity = 0;
    var allProducts = []; // Store all products for filtering/sorting
    
    // Helper to get the current cart key
    function getCartKey() {
        const userId = sessionStorage.getItem('userId');
        return userId ? `cart_${userId}` : null;
    }

    // Get cart for current user
    const getCart = () => {
        const key = getCartKey();
        if (!key) return [];
        let cart = localStorage.getItem(key);
        return cart ? JSON.parse(cart) : [];
    }
    
    // Save cart for current user
    const saveCart = (cart) => {
        const key = getCartKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(cart));
        updateCartCount(); // Update cart count in header
    }

    // Update cart count in header
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

    const getToken = () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            Swal.fire({
                icon: 'warning',
                text: 'You must be logged in to access this page.',
                showConfirmButton: true
            }).then(() => {
                window.location.href = 'login.html';
            });
            return;
        }
        return true
    }

    // Load all products
    function loadProducts() {
        $.ajax({
            method: "GET",
            url: `${url}api/v1/items`,
            dataType: 'json',
            success: function (data) {
                console.log(data.rows);
                allProducts = data.rows;
                
                // Display featured products (first 4)
                displayFeaturedProducts(data.rows.slice(0, 4));
                
                // Display all products
                displayAllProducts(data.rows);
                
                // Setup product details modal
                setupProductModal();
            },
            error: function (error) {
                console.log(error);
                $('#items').html('<div class="col-12 text-center"><p class="text-danger">Error loading products. Please try again.</p></div>');
            }
        });
    }

    // Display featured products
    function displayFeaturedProducts(products) {
        $("#featuredProducts").empty();
        
        if (products.length === 0) {
            $("#featuredProducts").html('<div class="col-12 text-center"><p>No featured products available.</p></div>');
            return;
        }

        let row = $('<div class="row"></div>');
        $.each(products, function (key, value) {
            if (key % 2 === 0 && key !== 0) {
                $("#featuredProducts").append(row);
                row = $('<div class="row"></div>');
            }
            
            var item = `<div class="col-md-6 mb-4">
                <div class="card h-100 featured-product">
                    <div class="featured-badge">Featured</div>
                    <img src="${url}${value.image}" class="card-img-top" alt="${value.description}">
                    <div class="card-body">
                        <h5 class="card-title">${value.description}</h5>
                        <p class="card-text price">₱ ${value.sell_price}</p>
                        <p class="card-text stock-info"><i class="fas fa-box mr-1"></i>Stock: ${value.quantity ?? 0}</p>
                        <a href="#!" class="btn btn-primary show-details" role="button" 
                           data-id="${value.item_id}"
                           data-description="${value.description}"
                           data-price="${value.sell_price}"
                           data-image="${value.image}"
                           data-stock="${value.quantity ?? 0}">
                           <i class="fas fa-eye mr-2"></i>View Details
                        </a>
                    </div>
                </div>
            </div>`;
            row.append(item);
        });
        $("#featuredProducts").append(row);
    }

    // Display all products
    function displayAllProducts(products) {
        $("#items").empty();
        
        if (products.length === 0) {
            $("#items").html('<div class="col-12 text-center"><p>No products available.</p></div>');
            return;
        }

        let row;
        $.each(products, function (key, value) {
            if (key % 4 === 0) {
                row = $('<div class="row"></div>');
                $("#items").append(row);
            }
            
            var item = `<div class="col-md-3 mb-4 product-item" data-name="${value.description.toLowerCase()}" data-brand="${getBrandFromName(value.description)}">
                <div class="card h-100">
                    <img src="${url}${value.image}" class="card-img-top" alt="${value.description}">
                    <div class="card-body">
                        <h5 class="card-title">${value.description}</h5>
                        <p class="card-text price">₱ ${value.sell_price}</p>
                        <p class="card-text stock-info"><i class="fas fa-box mr-1"></i>Stock: ${value.quantity ?? 0}</p>
                        <a href="#!" class="btn btn-primary show-details" role="button" 
                           data-id="${value.item_id}"
                           data-description="${value.description}"
                           data-price="${value.sell_price}"
                           data-image="${value.image}"
                           data-stock="${value.quantity ?? 0}">
                           <i class="fas fa-eye mr-2"></i>View Details
                        </a>
                    </div>
                </div>
            </div>`;
            row.append(item);
        });
    }

    // Get brand from product name
    function getBrandFromName(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('nike')) return 'nike';
        if (lowerName.includes('adidas')) return 'adidas';
        if (lowerName.includes('puma')) return 'puma';
        if (lowerName.includes('converse')) return 'converse';
        if (lowerName.includes('vans')) return 'vans';
        if (lowerName.includes('new balance')) return 'new balance';
        return 'other';
    }

    // Setup product details modal
    function setupProductModal() {
        if ($('#productDetailsModal').length === 0) {
            $('body').append(`
                <div class="modal fade" id="productDetailsModal" tabindex="-1" role="dialog" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="productDetailsModalLabel"></h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body text-center" id="productDetailsModalBody">
                                <!-- Product details will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }

        $(".show-details").on('click', function () {
            const id = $(this).data('id');
            const description = $(this).data('description');
            const price = $(this).data('price');
            const image = $(this).data('image');
            const stock = $(this).data('stock');

            $('#productDetailsModalLabel').text(description);
            $('#productDetailsModalBody').html(`
                <img src="${url}${image}" class="img-fluid mb-3" style="max-height:200px;">
                <p id="price">Price: ₱<strong>${price}</strong></p>
                <p>Stock: ${stock}</p>
                <input type="number" class="form-control mb-3" id="detailsQty" min="1" max="${stock}" value="1">
                <input type="hidden" id="detailsItemId" value="${id}">
                <button type="button" class="btn btn-primary" id="detailsAddToCart">
                    <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                </button>
            `);

            $('#productDetailsModal').modal('show');
        });
    }

    // Search functionality
    $("#searchBtn").on('click', function() {
        performSearch();
    });

    $("#searchInput").on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = $("#searchInput").val().toLowerCase();
        
        if (searchTerm === '') {
            displayAllProducts(allProducts);
            return;
        }

        const filteredProducts = allProducts.filter(product => 
            product.description.toLowerCase().includes(searchTerm)
        );
        
        displayAllProducts(filteredProducts);
    }

    // Filter functionality
    $(".filter-btn").on('click', function() {
        $(".filter-btn").removeClass('active');
        $(this).addClass('active');
        
        const filter = $(this).data('filter');
        
        if (filter === 'all') {
            displayAllProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product => 
                getBrandFromName(product.description) === filter
            );
            displayAllProducts(filteredProducts);
        }
    });

    // Sort functionality
    $(".sort-btn").on('click', function() {
        const sortBy = $(this).data('sort');
        let sortedProducts = [...allProducts];
        
        switch(sortBy) {
            case 'name':
                sortedProducts.sort((a, b) => a.description.localeCompare(b.description));
                break;
            case 'price':
                sortedProducts.sort((a, b) => parseFloat(a.sell_price) - parseFloat(b.sell_price));
                break;
            case 'stock':
                sortedProducts.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
                break;
        }
        
        displayAllProducts(sortedProducts);
    });

    // Add to cart functionality (update this logic wherever items are added to cart)
    $(document).on('click', '#detailsAddToCart', function () {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            Swal.fire({
                icon: 'warning',
                title: 'Register Required',
                text: 'You must register and log in to add items to your cart.',
                confirmButtonText: 'Register',
                showCancelButton: true,
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'register.html';
                }
            });
            return;
        }
        const qty = parseInt($("#detailsQty").val());
        const id = $("#detailsItemId").val();
        const description = $("#productDetailsModalLabel").text();
        const price = $("#productDetailsModalBody strong").text().replace(/[^\d.]/g, '');
        const image = $("#productDetailsModalBody img").attr('src');
        const stock = parseInt($("#productDetailsModalBody p:contains('Stock')").text().replace(/[^\d]/g, ''));
        let cart = getCart();
        let existing = cart.find(item => item.item_id == id);
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({
                item_id: id,
                description: description,
                price: parseFloat(price),
                image: image,
                stock: stock,
                quantity: qty
            });
        }
        saveCart(cart);
        Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: `${description} has been added to your cart.`,
            showConfirmButton: false,
            timer: 1500,
            position: 'top-end'
        });
        $('#productDetailsModal').modal('hide');
        console.log(cart);
    });

    // Add checkout confirmation modal to the page
    function setupCheckoutModal() {
        if ($('#checkoutModal').length === 0) {
            $('body').append(`
                <div class="modal fade" id="checkoutModal" tabindex="-1" role="dialog" aria-labelledby="checkoutModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="checkoutModalLabel">
                                    <i class="fas fa-credit-card mr-2"></i>Order Confirmation
                                </h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="checkoutModalBody">
                                <!-- Order summary will be loaded here -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-success" id="placeOrderBtn">
                                    <i class="fas fa-check mr-2"></i>Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    // Show checkout modal with order summary
    function showCheckoutModal() {
        const cart = getCart();
        let summaryHTML = '';
        let total = 0;
        if (cart.length === 0) {
            summaryHTML = '<div class="text-center py-5"><h5>Your cart is empty.</h5></div>';
        } else {
            summaryHTML += '<h5>Order Summary</h5><ul class="list-group mb-3">';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                summaryHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${item.description} <small class="text-muted">x${item.quantity}</small></span>
                    <span>₱${itemTotal.toFixed(2)}</span>
                </li>`;
            });
            summaryHTML += `</ul><h5 class="text-right">Total: ₱${total.toFixed(2)}</h5>`;
        }
        $('#checkoutModalBody').html(summaryHTML);
        $('#checkoutModal').modal('show');
    }

    // Place order handler
    $(document).on('click', '#placeOrderBtn', function() {
        const cart = getCart();
        if (cart.length === 0) return;
        // Send order to backend
        $.ajax({
            method: 'POST',
            url: url + 'api/v1/order',
            contentType: 'application/json',
            data: JSON.stringify({ cart }),
            success: function(res) {
                localStorage.removeItem(getCartKey());
                updateCartCount();
                $('#checkoutModal').modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed!',
                    text: 'Your order has been placed successfully.',
                    confirmButtonText: 'OK'
                });
            },
            error: function(err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failed',
                    text: 'There was a problem placing your order.'
                });
            }
        });
    });

    // Update cart modal checkout button to show checkout modal
    $(document).on('click', '#checkoutBtn', function() {
        const cart = getCart();
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Cart',
                text: 'Your cart is empty. Add some items before checkout.'
            });
            return;
        }
        if (!sessionStorage.getItem('userId')) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to proceed with checkout.',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
            return;
        }
        // Show the new checkout modal
        showCheckoutModal();
    });

    // Load header
    $("#home").load("header.html", function() {
        // After header is loaded, check sessionStorage for userId
        if (sessionStorage.getItem('userId')) {
            // Change Login link to Logout
            const $loginLink = $('a.nav-link[href="login.html"]');
            $loginLink.text('Logout').attr({ 'href': '#', 'id': 'logout-link' }).on('click', function (e) {
                e.preventDefault();
                // Remove user-specific cart on logout
                localStorage.removeItem(getCartKey());
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('token');
                window.location.href = 'login.html';
            });
        }
        
        // Cart link click handler
        $(document).on('click', '#cartLink', function(e) {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
        
        // Update cart count after header loads
        updateCartCount();
    });

    // Initialize the page
    loadProducts();

    // In document ready, setup the checkout modal
    setupCheckoutModal();
    updateCartCount();
});