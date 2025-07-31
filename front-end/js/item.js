$(document).ready(function () {
    const url = window.location.origin + '/';
    const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Global function for product submission (called by validation)
    window.submitProduct = function() {
        const formData = new FormData($('#productForm')[0]);
        const id = $('#productId').val();
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `${url}api/v1/items/${id}` : `${url}api/v1/items`;
        $.ajax({
            method: method,
            url: endpoint,
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                Swal.fire({ icon: 'success', text: id ? 'Product updated!' : 'Product added!' });
                $('#productModal').modal('hide');
                fetchProducts();
            },
            error: function (xhr) {
                Swal.fire({ icon: 'error', text: xhr.responseJSON?.error || 'Failed to save product.' });
            }
        });
    };

    // Fetch and render products
    function fetchProducts() {
        $.ajax({
            method: 'GET',
            url: url + 'api/v1/items',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                renderProductsTable(data.rows || data);
            },
            error: function () {
                $('#productsTableBody').html('<tr><td colspan="7" class="text-center text-danger">Failed to load products.</td></tr>');
            }
        });
    }

    function renderProductsTable(products) {
        let html = '';
        products.forEach(product => {
            html += `<tr>
                <td>${product.item_id}</td>
                <td><img src="/images/${product.image.replace(/^.*[\\\/]/, '')}" alt="${product.description}" style="max-width:60px;max-height:60px;"></td>
                <td>${product.description}</td>
                <td>₱ ${parseFloat(product.cost_price).toFixed(2)}</td>
                <td>₱ ${parseFloat(product.sell_price).toFixed(2)}</td>
                <td>${product.quantity ?? ''}</td>
                <td>
                    <button class="btn btn-sm btn-info edit-product-btn" data-id="${product.item_id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-product-btn" data-id="${product.item_id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        $('#productsTableBody').html(html);
    }

    // Add Product button
    $('#addProductBtn').on('click', function () {
        $('#productForm')[0].reset();
        $('#productId').val('');
        $('#imagePreview').hide();
        $('#productModalLabel').text('Add Product');
        $('#productModal').modal('show');
    });

    // Image preview
    $('#image').on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        } else {
            $('#imagePreview').hide();
        }
    });

    // Save (Add/Edit) Product - Legacy handler (validation will handle this now)
    $('#productForm').on('submit', function (e) {
        e.preventDefault();
        // Validation will handle this now
    });

    // Edit Product
    $(document).on('click', '.edit-product-btn', function () {
        const id = $(this).data('id');
        $.ajax({
            method: 'GET',
            url: `${url}api/v1/items/${id}`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                const product = data.result ? data.result[0] : (data.rows ? data.rows[0] : data);
                $('#productId').val(product.item_id);
                $('#description').val(product.description);
                $('#cost_price').val(product.cost_price);
                $('#sell_price').val(product.sell_price);
                $('#quantity').val(product.quantity);
                if (product.image) {
                    $('#imagePreview').attr('src', url + '/images/' + product.image.replace(/^.*[\\\/]/, '')).show();
                } else {
                    $('#imagePreview').hide();
                }
                $('#productModalLabel').text('Edit Product');
                $('#productModal').modal('show');
            },
            error: function () {
                Swal.fire({ icon: 'error', text: 'Failed to load product.' });
            }
        });
    });

    // Delete Product
    $(document).on('click', '.delete-product-btn', function () {
        const id = $(this).data('id');
        Swal.fire({
            title: 'Delete Product?',
            text: 'Are you sure you want to delete this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    method: 'DELETE',
                    url: `${url}api/v1/items/${id}`,
                    headers: { 'Authorization': 'Bearer ' + token },
                    success: function () {
                        Swal.fire({ icon: 'success', text: 'Product deleted!' });
                        fetchProducts();
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', text: 'Failed to delete product.' });
                    }
                });
            }
        });
    });

    // Bulk Upload CSV button
    $('#uploadCsvBtn').on('click', function () {
        $('#csvUploadForm')[0].reset();
        $('#csvUploadModal').modal('show');
    });

    // Handle CSV upload form submit
    $('#csvUploadForm').on('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            method: 'POST',
            url: url + 'api/v1/items/upload-csv',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                Swal.fire({ icon: 'success', text: res.message || 'CSV uploaded successfully!' });
                $('#csvUploadModal').modal('hide');
                fetchProducts();
            },
            error: function (xhr) {
                Swal.fire({ icon: 'error', text: xhr.responseJSON?.error || 'Failed to upload CSV.' });
            }
        });
    });

    // Admin sidebar logout button
    $(document).on('click', '#adminLogout', function(e) {
        e.preventDefault();
        
        // Call backend logout API to invalidate token
        const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
        if (token) {
            $.ajax({
                method: 'POST',
                url: url + 'api/v1/logout',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(data) {
                    console.log('Admin logged out successfully');
                },
                error: function(xhr) {
                    console.log('Admin logout error:', xhr);
                },
                complete: function() {
                    // Always clear session storage and redirect, even if API call fails
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        } else {
            // If no token, just clear storage and redirect
        sessionStorage.clear();
        window.location.href = 'login.html';
        }
    });

    // Initial load
    fetchProducts();
});