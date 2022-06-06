function Accounts() {
    $('.btn-add').click(e => {
        $('#confirm-add').modal('show');
    });

    $('#add-account').click(e => {
        let inputs = document.getElementById("formAdd").elements;
        let name = inputs["name"].value;
        let email = inputs["email"].value;
        let department = inputs["department"].value;

        console.log(name, email, department);
        fetch("/admin/accounts", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, email, department})
        })
        .then(res => res.json())
        .then((json) => {
            if (json.code === 0) {
                location.reload();
                $('#confirm-add').modal('hide');
            }
        })
        .catch((err) => console.log(err));
    });
}