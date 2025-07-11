$(document).ready(function () {
    const url = window.location.origin + '/'

    const getToken = () => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            Swal.fire({
                icon: 'warning',
                text: 'You must be logged in to access this page.',
                showConfirmButton: true
            }).then(() => {
                window.location.href = 'login.html';
            });
            return;
        }
        return JSON.parse(token)
    }

    $('#itable').DataTable({
        ajax: {
            url: `${url}api/v1/items`,
            dataSrc: "rows",
            // headers: {
            //     "Authorization": "Bearer " + access_token 
            // },
        },
        dom: 'Bfrtip',
        buttons: [
            'pdf',
            'excel',
            {
                text: 'Add item',
                className: 'btn btn-primary',
                action: function (e, dt, node, config) {
                    $("#iform").trigger("reset");
                    $('#itemModal').modal('show');
                    $('#itemUpdate').hide();
                    $('#itemImage').remove()
                }
            }
        ],
        columns: [
            { data: 'item_id' },
            {
                data: null,
                render: function (data, type, row) {
                    return `<img src="${url}${data.image}" width="50" height="60">`;
                }
            },

            { data: 'description' },
            { data: 'cost_price' },
            { data: 'sell_price' },
            { data: 'quantity' },
            {
                data: null,
                render: function (data, type, row) {
                    return "<a href='#' class = 'editBtn' id='editbtn' data-id=" + data.item_id + "><i class='fas fa-edit' aria-hidden='true' style='font-size:24px' ></i></a><a href='#'  class='deletebtn' data-id=" + data.item_id + "><i  class='fas fa-trash-alt' style='font-size:24px; color:red' ></a></i>";
                }
            }
        ],
    });

    $("#itemSubmit").on('click', function (e) {
        e.preventDefault();
        var data = $('#iform')[0];
        console.log(data);
        if (getToken()) {
            let formData = new FormData(data);
            console.log(formData);
            for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            const token = getToken()

            $.ajax({
                method: "POST",
                url: `${url}api/v1/items`,
                data: formData,
                contentType: false,
                processData: false,
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (data) {
                    console.log(data);
                    $("#itemModal").modal("hide");

                    var $itable = $('#itable').DataTable();

                    $itable.ajax.reload()
                },
                error: function (error) {
                    // Swal.fire({
                    //     icon: "error",
                    //     text: error.responseText,
                    //     showConfirmButton: false,
                    //     // position: 'bottom-right',
                    //     timer: 3000,
                    //     timerProgressBar: true

                    // });
                    console.log(error);
                }
            });

        }

    });

    $('#itable tbody').on('click', 'a.editBtn', function (e) {
        e.preventDefault();
        $('#itemImage').remove()
        $('#itemId').remove()
        $("#iform").trigger("reset");


        var id = $(this).data('id');
        console.log(id);
        $('#itemModal').modal('show');
        $('<input>').attr({ type: 'hidden', id: 'itemId', name: 'item_id', value: id }).appendTo('#iform');

        $('#itemSubmit').hide()
        $('#itemUpdate').show()

        $.ajax({
            method: "GET",
            url: `${url}api/v1/items/${id}`,
            dataType: "json",
            success: function (data) {
                const { result } = data
                console.log(result);
                $('#desc').val(result[0].description)
                $('#sell').val(result[0].sell_price)
                $('#cost').val(result[0].cost_price)
                $('#qty').val(result[0].quantity)
                $("#iform").append(`<img src="${url}${result[0].image}" width='200px', height='200px' id="itemImage"   />`)

            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    $("#itemUpdate").on('click', function (e) {
        e.preventDefault();
        var id = $('#itemId').val();
        console.log(id);
        var table = $('#itable').DataTable();

        var data = $('#iform')[0];
        let formData = new FormData(data);


        $.ajax({
            method: "PUT",
            url: `${url}api/v1/items/${id}`,
            data: formData,
            contentType: false,
            processData: false,

            dataType: "json",
            success: function (data) {
                console.log(data);
                $('#itemModal').modal("hide");
                table.ajax.reload()

            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    $('#itable tbody').on('click', 'a.deletebtn', function (e) {
        e.preventDefault();
        var table = $('#itable').DataTable();
        var id = $(this).data('id');
        var $row = $(this).closest('tr');
        console.log(id);
        if (getToken()) {
            bootbox.confirm({
                message: "do you want to delete this item",
                buttons: {
                    confirm: {
                        label: 'yes',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'no',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    console.log(result);
                    if (result) {
                        $.ajax({
                            method: "DELETE",
                            url: `${url}api/v1/items/${id}`,
                            dataType: "json",
                            headers: {
                                "Authorization": "Bearer " + getToken()
                            },
                            success: function (data) {
                                console.log(data);
                                $row.fadeOut(4000, function () {
                                    table.row($row).remove().draw();
                                });

                                bootbox.alert(data.message);
                            },
                            error: function (error) {
                                bootbox.alert(data.error);
                            }
                        });

                    }

                }
            });

        }

    })
})