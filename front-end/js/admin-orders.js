$(document).ready(function () {
    const url = window.location.origin + '/';
    const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch and render orders
    function fetchOrders() {
        const status = $('#statusFilter').val();
        const user = $('#orderSearch').val();
        let apiUrl = url + 'api/v1/admin/orders?';
        if (status) apiUrl += `status=${encodeURIComponent(status)}&`;
        if (user) apiUrl += `user=${encodeURIComponent(user)}&`;
        $.ajax({
            method: 'GET',
            url: apiUrl,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                renderOrders(data.orders || []);
            },
            error: function () {
                $('#adminOrdersTable').html('<tr><td colspan="7">Failed to load orders.</td></tr>');
            }
        });
    }

    // Render orders in table
    function renderOrders(orders) {
        let html = '';
        if (orders.length === 0) {
            html = '<tr><td colspan="7">No orders found.</td></tr>';
        } else {
            orders.forEach(order => {
                html += `<tr>
                    <td>${order.orderinfo_id}</td>
                    <td>${order.user_name}</td>
                    <td>${order.email}</td>
                    <td>${new Date(order.date_placed).toLocaleString()}</td>
                    <td>
                        <select class="form-control form-control-sm status-select" data-id="${order.orderinfo_id}">
                            ${['pending','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}"${order.status === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
                        </select>
                    </td>
                    <td>$${order.total}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order-btn" data-id="${order.orderinfo_id}"><i class="fas fa-eye"></i> View</button>
                    </td>
                </tr>`;
            });
        }
        $('#adminOrdersTable').html(html);
    }

    // Filter/search handlers
    $('#statusFilter, #searchBtn').on('change click', fetchOrders);
    $('#orderSearch').on('keypress', function(e) { if (e.which === 13) fetchOrders(); });

    // View order details
    $(document).on('click', '.view-order-btn', function () {
        const orderId = $(this).data('id');
        $.ajax({
            method: 'GET',
            url: url + 'api/v1/admin/orders/' + orderId,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                showOrderDetails(data.order);
            },
            error: function () {
                $('#orderDetailsModalBody').html('<p>Failed to load order details.</p>');
                $('#orderDetailsModal').modal('show');
            }
        });
    });

    // Show order details in modal
    function showOrderDetails(order) {
        let html = `<h5>Order #${order.orderinfo_id}</h5>
                    <p>Status: <span class="badge badge-${getStatusBadge(order.status)}">${order.status}</span></p>
                    <p>User: ${order.user.name} (${order.user.email})</p>
                    <p>Placed: ${new Date(order.date_placed).toLocaleString()}</p>
                    <ul class="list-group mb-2">`;
        order.items.forEach(item => {
            const imgPath = item.image ? (item.image.startsWith('/') || item.image.startsWith('http') ? item.image : '/images/' + item.image.replace(/^.*[\\\/]/, '')) : '';
            html += `<li class="list-group-item d-flex align-items-center">
                <img src="${imgPath}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;vertical-align:middle;margin-right:10px;">
                <span class="flex-grow-1">${item.name} - Qty: ${item.quantity} @ $${item.unit_price}</span>
            </li>`;
        });
        html += '</ul>';
        $('#orderDetailsModalBody').html(html);
        $('#orderDetailsModal').modal('show');
    }

    // Status change handler (with SweetAlert2)
    $(document).on('change', '.status-select', function () {
        const orderId = $(this).data('id');
        const newStatus = $(this).val();
        Swal.fire({
            title: 'Change Order Status?',
            text: `Set order #${orderId} to "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it',
            cancelButtonText: 'No',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                // Use Swal loading modal like in checkout
                Swal.fire({
                    title: 'Updating Order Status...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                $.ajax({
                    method: 'PATCH',
                    url: url + 'api/v1/admin/orders/' + orderId + '/status',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    data: JSON.stringify({ status: newStatus }),
                    success: function () {
                        Swal.close();
                        Swal.fire({ icon: 'success', title: 'Status updated!', timer: 1200, showConfirmButton: false });
                        fetchOrders();
                    },
                    error: function (xhr) {
                        Swal.close();
                        Swal.fire({ icon: 'error', title: 'Error', text: xhr.responseJSON?.error || 'Failed to update status.' });
                        fetchOrders();
                    }
                });
            } else {
                fetchOrders(); // revert select to previous value
            }
        });
    });

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

    // Initial load
    fetchOrders();
}); 