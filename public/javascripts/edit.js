
//edit hồ sơ
function editProfile(e){

    if(e.name.value === '' || e.class.value === '' || e.department.value === '')
    {
        alert("Vui lòng điền đủ thông tin!");
        
    }else{

        var formData = new FormData(document.getElementById("post-update-edit"))

        $.ajax({
            type:"PUT",
            url: "/profile/user/" + e._id.value,
            data: formData,
            processData: false,
            contentType: false,
            success: (data) =>{
                alert("Cập nhật thành công!")
                // location.reload(true); 
                location.replace("/profile/" + e._id.value)
            },
            error: (err) =>{
                alert(err.message)
            }

        })
    }
    return false;

}

function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
  
      reader.onload = function (e) {
        $('#blah').attr('src', e.target.result).width(150).height(150);
      };
  
      reader.readAsDataURL(input.files[0]);
    }
  }