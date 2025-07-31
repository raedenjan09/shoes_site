$(document).ready(function () {
    const url = window.location.origin + '/'
    const token = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : null;
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    $.ajax({
        method: "GET",
        url: `${url}api/v1/address-chart`,
        dataType: "json",
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (data) {
            console.log(data.rows);
            const { rows } = data
            var ctx = $("#addressChart");

            new Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: ['taguig', 'tenment']
                    labels: rows.map(row => row.addressline),
                    datasets: [{
                        label: 'Number of Customers per town',
                        data: rows.map(row => row.total),
                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < rows.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1,

                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    indexAxis: 'y',
                },
            });
        },
        error: function (error) {
            console.log(error);
        }
    });

    $.ajax({
        type: "GET",
        url: `${url}api/v1/sales-chart`,
        dataType: "json",
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (data) {
            console.log(data);
            const { rows } = data
            var ctx = $("#salesChart");
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: rows.map(row => row.month),
                    datasets: [{
                        label: 'Monthly sales',
                        data: rows.map(row => row.total),
                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < rows.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },

                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                },
            });

        },
        error: function (error) {
            console.log(error);
        }
    });

    $.ajax({
        type: "GET",
        url: `${url}api/v1/items-chart`,
        dataType: "json",
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (data) {
            console.log(data);
            const {rows} = data
            var ctx = $("#itemsChart");
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: rows.map(row => row.items),
                    datasets: [{
                        label: 'number of items sold',
                         data: rows.map(row => row.total),

                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < rows.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255,99,132,1)'
                        ],
                        borderWidth: 1,
                        responsive: true,
                        // hoverBackgroundColor: colors,
                    }]
                },
                options: {
                    plugins: {
                        datalabels: {
                            backgroundColor: function (context) {
                                return context.dataset.backgroundColor;
                            },
                            borderColor: 'white',
                            borderRadius: 25,
                            borderWidth: 2,
                            color: 'white',
                            display: function (context) {
                                var dataset = context.dataset;
                                var count = dataset.data.length;
                                var value = dataset.data[context.dataIndex];
                                return value > count * 1.5;
                            },
                            font: {
                                weight: 'bold'
                            },
                            padding: 6,
                            formatter: Math.round
                        },
                        aspectRatio: 4 / 3,
                        cutoutPercentage: 32,
                        layout: {
                            padding: 32
                        },
                        elements: {
                            line: {
                                fill: false
                            },
                            point: {
                                hoverRadius: 7,
                                radius: 5
                            }
                        },
                    }
                }


            });

        },
        error: function (error) {
            console.log(error);
        }
    });

  // --- Admin User Management ---
  function fetchUsers() {
    $.ajax({
      method: 'GET',
      url: url + 'api/v1/users',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (data) {
        renderUsersTable(data.users);
      },
      error: function (err) {
        $('#usersTableBody').html('<tr><td colspan="7" class="text-center text-danger">Failed to load users.</td></tr>');
      }
    });
  }

  function renderUsersTable(users) {
    let html = '';
    users.forEach(user => {
      html += `<tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <select class="form-control form-control-sm user-role-select" data-id="${user.id}" ${user.deleted_at ? 'disabled' : ''}>
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>
          ${user.deleted_at ? '<span class="badge badge-danger">Deactivated</span>' : '<span class="badge badge-success">Active</span>'}
        </td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
        <td>
          <button class="btn btn-sm btn-danger deactivate-user-btn" data-id="${user.id}" ${user.deleted_at ? 'disabled' : ''}>Deactivate</button>
          ${user.deleted_at ? `<button class="btn btn-sm btn-success reactivate-user-btn" data-id="${user.id}">Reactivate</button>` : ''}
        </td>
      </tr>`;
    });
    $('#usersTableBody').html(html);
  }

  // Change user role
  $(document).on('change', '.user-role-select', function () {
    const userId = $(this).data('id');
    const newRole = $(this).val();
    $.ajax({
      method: 'PATCH',
      url: url + 'api/v1/users/' + userId + '/role',
      headers: { 'Authorization': 'Bearer ' + token },
      contentType: 'application/json',
      data: JSON.stringify({ role: newRole }),
      success: function (res) {
        Swal.fire({ icon: 'success', text: 'Role updated successfully!' });
        fetchUsers();
      },
      error: function (err) {
        Swal.fire({ icon: 'error', text: 'Failed to update role.' });
        fetchUsers();
      }
    });
  });

  // Deactivate user
  $(document).on('click', '.deactivate-user-btn', function () {
    const userId = $(this).data('id');
    Swal.fire({
      title: 'Deactivate User?',
      text: 'Are you sure you want to deactivate this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          method: 'PATCH',
          url: url + 'api/v1/users/' + userId + '/deactivate',
          headers: { 'Authorization': 'Bearer ' + token },
          success: function (res) {
            Swal.fire({ icon: 'success', text: 'User deactivated successfully!' });
            fetchUsers();
          },
          error: function (err) {
            Swal.fire({ icon: 'error', text: 'Failed to deactivate user.' });
            fetchUsers();
          }
        });
      }
    });
  });

  // Reactivate user
  $(document).on('click', '.reactivate-user-btn', function () {
    const userId = $(this).data('id');
    Swal.fire({
      title: 'Reactivate User?',
      text: 'Are you sure you want to reactivate this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reactivate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          method: 'PATCH',
          url: url + 'api/v1/users/' + userId + '/reactivate',
          headers: { 'Authorization': 'Bearer ' + token },
          success: function (res) {
            Swal.fire({ icon: 'success', text: 'User reactivated successfully!' });
            fetchUsers();
          },
          error: function (err) {
            Swal.fire({ icon: 'error', text: 'Failed to reactivate user.' });
            fetchUsers();
          }
        });
      }
    });
  });

  // Initial load for users
  fetchUsers();

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
});