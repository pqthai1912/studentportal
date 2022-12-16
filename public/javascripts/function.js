var userSettings = document.querySelector(".user-settings");
var darkBtn = document.getElementById("dark-button");
var LoadMoreBackground =document.querySelector(".btn-LoadMore");

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var players = [];


function UserSettingToggle(){
    userSettings.classList.toggle("user-setting-showup-toggle");
}


function darkModeON(){
    darkBtn.classList.toggle("dark-mode-on");
   document.body.classList.toggle("dark-theme");
}

function LoadMoreToggle(){
    LoadMoreBackground.classList.toggle("loadMoreToggle");
}

function previewPostImage(self) {
    var file = self.files;
    if (file.length > 0) {
        var fileReader = new FileReader();

        fileReader.onload = function (event) {
            $("<span class=\"pip\">" +
              "<img id=\"post-img-preview\" src=\"" + event.target.result + "\"/>" +
              "<span class=\"remove\"><i id=\"remove\" class=\"fa fa-window-close\" aria-hidden=\"true\"></i>" + "</span>" +
              "</span>").insertAfter("#preview-image");
            $(".remove").click(function(){
              $(this).parent(".pip").remove();
              $("#image").val("");
            });
        };

        fileReader.readAsDataURL(file[0]);
    }
}

function previewPostImageDialog(self) {
    var file = self.files;
    if (file.length > 0) {
        var fileReader = new FileReader();

        fileReader.onload = function (event) {
            $("<span class=\"dialog-pip\">" +
              "<img id=\"post-img-preview-dialog\" src=\"" + event.target.result + "\"/>" +
              "<span class=\"remove-dialog\"><i id=\"remove-dialog\" class=\"fa fa-window-close\" aria-hidden=\"true\"></i>" + "</span>" +
              "</span>").insertAfter("#preview-image-dialog");
            $(".remove-dialog").click(function(){
              $(this).parent(".dialog-pip").remove();
              $("#image-dialog").val("");
            //   $('#image-check').val("");
            });
        };

        fileReader.readAsDataURL(file[0]);
    }
}

//Thêm bài viết
function addPost(e){
    //console.log(e.type.value)

    if(e.caption.value === '' && e.image.value === '' && e.video.value === '')
    {
        alert("Vui lòng cung cấp nội dung cho bài viết!");
        
    }else{
        var formData = new FormData(document.getElementById("form-add-post"));
        $.ajax({
            type: "POST",
            url: "/post/add-post",
            data: formData,
            processData: false,
            contentType: false,
            success: (data)=>{
                alert("Post bài viết thành công!");

                // console.log(data)
                // làm mới post

                let URL = window.location.href + ''
                if(URL.includes("/profile")){
                    getUserNews()
                }
                else{
                    displayNews()
                }
                document.getElementById("form-add-post").querySelector("input[name='image']").value = "";
                document.getElementById("form-add-post").querySelector("input[name='video']").value = "";
                document.getElementById("form-add-post").querySelector("textarea[name='caption']").value = "";
                const elements = document.getElementsByClassName('pip');
                while(elements.length > 0){
                    elements[0].parentNode.removeChild(elements[0]);
                }




            },
            error:  (err) => {
                // console.log(err);
                alert(err);
            }
        }); 
    }

    
    return false;
}

//Hiển thị bài viết
function displayNews(){
    var email = document.getElementById("email").value;
    var googleId = document.getElementById("googleId").value;
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "/post/get-news-post", true);
    ajax.setRequestHeader("Content-Type", "application/json");

    ajax.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(this.responseText);
            //console.log(response)
            var html = "";
            for (var a = 0; a < response.data.length; a++) {
                var data = response.data[a];
                // console.log(data) 
                html += `<div id="`+data._id+`" class="status-field-container write-post-container blog-post `+((a<10) ? "visible"  : '')+ `">
                            <div class="central-meta item">
                                <div class="user-post"> 
                                    <div class="friend-info">
                                        <figure> <a href="/profile/`+ data.account._id +`">`
                                    html += '<img src="'+ data.account.image + '" style="width: 45px; height: 45px; object-fit: cover;border-radius: 50%;">';
                                html += '</a></figure>';

                                html += '<div class="friend-name">';
                                    html += '<ins>';
                                        html += `<a href="`+((googleId) ? '' : '/department') + `/profile/`+ data.account._id +`">`;
                                        html += data.account.name;
                                    html += '</a></ins>';

                                    var createdAt = new Date(data.created_at);
                                    var date = createdAt.getDate() + "";
                                    var dateTime = createdAt + ""
                                    var arrayDate = dateTime.split(" ");
                                    var time = arrayDate[4]
                                    var t = ''
                                    var count = 0
                                    for(var hhmm in time){
                                        if(time.charAt(hhmm)===':')
                                            count ++;

                                        if(count == 2)
                                            break; 

                                        t += time.charAt(hhmm);
                                    }
                                    date = t +", " + date.padStart(2, "0") + " " + months[createdAt.getMonth()] + ", " + createdAt.getFullYear() ;

                                    html += '<span>Published: ' + date + '</span>';
                                html += '</div>';
                                //kiểm tra quyền xóa,sửa có phải của email này?
                        if(data.account.email == email){
                            var src = $('<div>' + data.video + '</div>').find('iframe').attr('src'); // trả về src thành công <3
                            //console.log(src);
                            html +=  `<div id="custom">
                                        <button id="btnEdit" type="submit"
                                            data-id="`+data._id+`" 
                                            data-email="`+data.account.email+`"
                                            data-googleid="`+googleId+`"
                                            data-caption="`+data.caption+`"
                                            data-image="`+data.image+`"
                                            data-video="`+src+`"
                                            onclick="showDialogEdit(this);"
                                            >
                                            <i class="fa fa-pencil-square-o fa-lg"></i>
                                        </button>`
                            html +=    `<button type="submit" id="btnDelete" 
                                            data-id="`+data._id+`" 
                                            data-googleid="`+googleId+`"
                                            onclick="showDialog(this);"
                                            >
                                        
                                            <i class="fa fa-trash fa-lg"></i>
                                        </button>
                                    </div>`
                        }

                                html += '<div class="post-meta">';

                                    html += '<div class="description">';
                                        html += `<p id = "caption-`+ data._id +`">`;
                                            html += data.caption;
                                        html += '</p>';
                                    html += '</div>';
                                    
                                    if (data.image) {
                                        html += '<p id = "image-'+ data._id+'" hidden></p>' //chưa bik xóa dc hk
                                        html += '<span><img id = "image-'+ data._id+'" src="../../../' + data.image + '"></span>';
                                    }

                                    if (data.video) {
                                        html += '<p id = "video-'+ data._id+'" hidden></p>' //chưa bik xóa dc hk
                                        html += '<span id = "video-'+ data._id+'">'+ data.video+ '</span>';
                                    }
                                    
                                    html += likeLayout(data);
                                html += '</div>';
                            html += '</div>';

                            html += "<div id='post-comments-" + data._id + "'>";
                            html += cmtLayout(data);
                            html += "</div>";

                        html += '</div>';
                    html += '</div>';
                html += '</div>';
            }

            document.getElementById("newsfeed").innerHTML = html;
        }
    };

    var data = JSON.stringify({"email": email})
    // formData.append("")
    ajax.send(data);
    return false;
}

//Tạo sườn like
function likeLayout(data) {
    var _id = document.getElementById("_id").value;  //get email from html

    var isLiked = false;
    var commentLength = 0
    var likeLength = 0
    var className = "none"
    if(data.likers){
        likeLength = data.likers.length
        for (var i= 0; i < data.likers.length; i++) {
            var liker = data.likers[i];
            if (_id == liker._id) {
                isLiked = true;
                break;
            }
        }
    }
    if(data.comments){
        commentLength = data.comments.length
    }
    // console.log(data)//có hiện
    var html = `<div class="we-video-info">
                    <ul>
                        <li>`;

                    if (isLiked) {
                        className = "like";
                    }
                    html += '<span class="' + className + '" onclick="likePost(this);" data-id="' + data._id + '">';
                        html += '<i class="fas fa-thumbs-up"></i>';
                        html += '<ins>' + likeLength + '</ins>';
                    html += '</span>';

                html += '</li>';
                

                html += `<li>
                            <span class="comment" title="Comments">
                                <i class="fa fa-comments-o"></i>`;
                        html += '<ins id="count-post-comments-' + data._id + '">'+commentLength+'</ins>';
                    html += `</span>
                        </li>
                    </ul>
                </div>`;

    return html;
}

//Like bài viết
function likePost(self) {
    //console.log(self)
    var email = document.getElementById("email").value;  //get email from html
    var id = self.getAttribute("data-id");
    // var formData = new FormData();
    var likes = 0;
    // formData.append("_id",id);
    // console.log(formData)
    $.ajax({
        type: "POST",
        url: "/post/like-post",
        data: JSON.stringify({"id":id, "email": email}),
        processData: false,
        contentType: "application/json; charset=utf-8",
        success: (data) =>{
            var resp = data;
            if (resp.status == "liked") {
                self.className = "like";

                likes = parseInt(self.querySelector("ins").innerHTML);
                likes++;
                self.querySelector("ins").innerHTML = likes;
            }
            if (resp.status == "unliked") {
                self.className = "none";

                likes = parseInt(self.querySelector("ins").innerHTML);
                likes--;
                self.querySelector("ins").innerHTML = likes;
            }
            if (resp.status == "error") {
                alert(resp.message);
            }
        },
        error: (err) => {
            alert(err);
        }
    })
}

//Tạo sườn comment
function cmtLayout(data){
    var email = document.getElementById("email").value;  //get email from html
    var googleId = document.getElementById("googleId").value;
    var _id = document.getElementById("_id").value;  //get email from html
    var image = document.getElementById("avatar-image").src; //lấy path
    let URL = window.location.href + ''
    //console.log(URL)
    var createdAt, date, cmt

    var html = `<div class="coment-area">
                    <ul class="we-comet" style="max-height: 300px; overflow-y: scroll;">`;
        //nếu có cmt
        if(data.comments)
        {
            data.comments = data.comments.reverse(); //đưa cái mới nhất lên trc
            for (var b = 0; b < data.comments.length; b++) {
                cmt = data.comments[b]; //vào từng cmt
                var pathImage = cmt.account.image
                html += `<li id="`+ cmt._id + `"><a href="/profile/`+ cmt.account._id +`">`;
                    html += '<div class="comet-avatar">';
                    //path ảnh + /profile
                    if(pathImage.includes("uploads") && URL.includes("/profile")){
                        html += '<img src="../../' +((cmt.account._id.toString() == data.account._id.toString()) ?  data.account.image : cmt.account.image ) + '" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;">';
                    }
                    else if( pathImage.includes("lh3.googleusercontent.com")){
                        html += '<img src="' +((cmt.account._id.toString() == data.account._id.toString()) ?  data.account.image : cmt.account.image )+ '" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;">';
                    }
                    else{
                        html += '<img src="../' +((cmt.account._id.toString() == data.account._id.toString()) ?  data.account.image : cmt.account.image )+ '" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;">';
                    }
                    html += '</a></div>';

                    html += '<div class="we-comment">';
                        html += '<div class="coment-head">';
                            html += `<h5><a href="`+((googleId) ? '' : '/department') + `/profile/`+ cmt.account._id +`">` + ((cmt.account._id.toString() == data.account._id.toString()) ?  data.account.name : cmt.account.name )+ `</a></h5>`;

                            createdAt = new Date(cmt.createdAt);
                            date = createdAt.getDate() + "";
                            var dateTime = createdAt + ""
                            var arrayDate = dateTime.split(" ");
                            var time = arrayDate[4]
                            var t = ''
                            var count = 0
                            for(var hhmm in time){
                                if(time.charAt(hhmm)===':')
                                    count ++;

                                if(count == 2)
                                    break; 

                                t += time.charAt(hhmm);
                            }
                            date = t +", " + date.padStart(2, "0") + " " + months[createdAt.getMonth()] + ", " + createdAt.getFullYear() ;
                            html += '<span>' + date + '</span>';
                            // html += '<a class="we-reply" href="javascript:void(0);" data-post-id="' + data._id + '" data-comment-id="' + cmt._id + '" onclick="prepareToReply(this);" title="Reply"><i class="fa fa-reply"></i></a>';
                            if(cmt.account._id == _id){
                                html += `<button type="submit" class="del-comment" 
                                            onclick="delCmtPost(this);"
                                            data-id="`+cmt._id+`" 
                                            data-idpost="`+data._id+`" 
                                            data-googleid="`+googleId+`"
                                            >
                                            <i class="fa fa-times" aria-hidden="true"></i>
                                        </button>`;
                            }
                        html += '</div>';

                        html += '<p>' + cmt.comment + '</p>';
                    html += '</div>';

                html += '</li>';
            }
        }


            html += '</ul>';


            html += `<ul class="we-comet">
                        <li class="post-comment">
                            <div class="comet-avatar">`;
                        html += '<img src="' + image + '" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;">';
                    html += `</div>

                            <div class="post-comt-box">
                                <form method="post" onsubmit="return cmtPost(this);">`;
                            html += '<input type="hidden" name="_id" value="' + data._id + '">';
                            html += '<input type="hidden" name="email" value="' + email + '">';
                            html += `<textarea name="comment" placeholder="Nhập bình luận vào đây"></textarea>
                                    <button type="submit">Post</button>
                                </form>
                            </div>
                        </li>
                    </ul>

            </div>`;

    return html;
}

//Comment bài viết
function cmtPost(e){
    // var formData = new FormData(e);
    if(e.comment.value === '')
    {
        alert("Vui lòng nhập bình luận!");
        
    }else{
        $.ajax({
            type: "POST",
            url: "/post/comment-post",
            data: JSON.stringify({"id": e._id.value, "email": e.email.value, "comment": e.comment.value}),
            processData: false,
            contentType: "application/json; charset=utf-8",
            success: (data)=>{
                alert("Bình luận thành công!");
                // console.log(data)
                e.comment.value = ""; //clear cmt
                var cmtHtml = cmtLayout(data.fetchUpPost); //xây dựng cmt lên
                document.getElementById("post-comments-" + e._id.value).innerHTML = cmtHtml; // thêm vào khung cmt
    
                var comments = parseInt(document.getElementById("count-post-comments-" + e._id.value).innerHTML); //lấy sl cmt hiện tại
                comments++;
                document.getElementById("count-post-comments-" + e._id.value).innerHTML = comments; //cập nhật lại số lượng
    
            },
            error:  (err) => {
                // console.log(err);
                alert(err);
            }
        }); 
    }

    return false;
}

//deletePost
function delPost(id,googleId) {
    // console.log(id)
    // var googleId = document.getElementById("googleId").value;  //get id from html
    //console.log(googleId,id);
    //hk có => hk phải sv

    let url = ''
    if(!googleId){
        url = '../post/delete'
    }
    else{
        url = '/post/delete'
    }

    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({"id": id}),
        processData: false,
        contentType: "application/json",
        success: (data) => {
            // console.log(data);
            if (data.code === 1) {
                console.log(data.message);

            } else {
                alert("Xóa bài viết thành công!");
                console.log(data.message);
                $(`#${id}`).remove(); // xoa the co id nay
            }

        },
        error: (err) => {
            console.log(err);
        }
    });

}

function showDialog(e){
    document.getElementById('deleteModal').style.display='block';

    var googleId = $(e).data('googleid')
    var id = $(e).data('id'); //chỉ cần e not e.target
    // console.log(id,googleId)
    
    $("#deleteModal .btn-delete-modal").attr({"data-id": id, "data-googleid": googleId}); //xong
    // $("#deleteModal .btn-delete-modal").attr(); //xong
    return false;
}

//xong
function doDelete(e){
    // var googleId = $(e).submit.data('googleid')
    // var id = $(e).submit.data('id');
    var button = e.elements["submit"] //get tag button with name submit
    // console.log(button);
    var googleId = button.getAttribute("data-googleid"); //get value of attribute
    var id =  button.getAttribute("data-id")
    // var email = document.getElementById("email").value;
    // console.log(googleId,id);

    document.getElementById('deleteModal').style.display='none';

    delPost(id,googleId);
    return false;
}

//delete comment post
function delCmtPost(e){

    var googleId = $(e).data('googleid')
    var id = $(e).data('id'); //chỉ cần e not e.target
    var idPost = $(e).data('idpost')

    let url = ''
    //phân quyền
    if(!googleId){
        url = '../post/comment-post/delete'
    }
    else{
        url = '/post/comment-post/delete'
    }

    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({"id": id, "idPost": idPost}),
        processData: false,
        contentType: "application/json",
        success: (data) => {
            // console.log(data);
            if (data.code === 1) {
                console.log(data.message);

            } else {
                alert("Xóa bình luận thành công!");
                console.log(data.message);
                $(`#${id}`).remove(); // xoa the co id nay
                var comments = parseInt(document.getElementById("count-post-comments-" + idPost).innerHTML); //lấy sl cmt hiện tại
                comments--;
                document.getElementById("count-post-comments-" + idPost).innerHTML = comments; //cập nhật lại số lượng
                // if(data.comments){
                //     commentLength = data.comments.length
                // }
            }

        },
        error: (err) => {
            console.log(err);
        }
    });
}

//editPost
function showDialogEdit(e){
    document.getElementById('editModal').style.display='block';

    var googleId = $(e).data('googleid')
    var id = $(e).data('id'); //chỉ cần e not e.target
    var caption = $(e).data('caption')
    var image = $(e).data('image')
    var video = $(e).data('video')
    var email = $(e).data('email')
    //console.log(email)
    if(video !== 'undefined'){
        $('input[name="videoDialog"]').val(video) //set val by name
        // console.log(video) //nó là chuỗi
    }

    $('input[name="email"]').val(email) //set val by name

    
    $('input[name="imageCheck"]').val(image)

    $('textarea[name="captionDialog"]').val(caption) //set val by name


    //có thể sai đường dẫn tương đối
    if(image){
        let URL = window.location.href + ''
        if(URL.includes("/profile")){
            $("<span class=\"dialog-pip\">" +
            "<img id=\"post-img-preview-dialog\" src=\"../" + image + "\"/>" +
            "<span class=\"remove-dialog\"><i id=\"remove-dialog\" class=\"fa fa-window-close\" aria-hidden=\"true\"></i>" + "</span>" +
            "</span>").insertAfter("#preview-image-dialog");
        //cho phép gỡ ảnh xuống
            $(".remove-dialog").click(function(){
                $(this).parent(".dialog-pip").remove();
                $("#image-dialog").val("");
                $('#image-check').val("");

            });
        }
            
        else{
            //"/"
            $("<span class=\"dialog-pip\">" +
                "<img id=\"post-img-preview-dialog\" src=\"" + image + "\"/>" +
                "<span class=\"remove-dialog\"><i id=\"remove-dialog\" class=\"fa fa-window-close\" aria-hidden=\"true\"></i>" + "</span>" +
                "</span>").insertAfter("#preview-image-dialog");
            //cho phép gỡ ảnh xuống
            $(".remove-dialog").click(function(){
                $(this).parent(".dialog-pip").remove();
                $("#image-dialog").val("");
                $('#image-check').val("");
            });
        }        

    }
    //đã xong- khi ấn cancel -> clear
    $(".cancelbtn").click(function(){
        if(image) $('.remove-dialog').parent(".dialog-pip").remove();
        $("#image-dialog").val("");
        $('#caption-dialog').val("");
        $('#video-dialog').val("");

    });
    $("#editModal .btn-edit-modal").attr({"data-id": id, "data-googleid": googleId, "data-caption": caption, "data-image": image, "data-video": video}); //xong
    // $("#deleteModal .btn-delete-modal").attr(); //xong
    return false;
}

function doEdit(e){
    // var googleId = $(e).submit.data('googleid')
    // var id = $(e).submit.data('id');
    var button = e.elements["submitEdit"] //get tag button with name submit
    // console.log(button);
    var googleId = button.getAttribute("data-googleid"); //get value of attribute
    var id =  button.getAttribute("data-id")
    // var caption = e.captionDialog.value
    var imageCheck =button.getAttribute("data-image")
    // var video = e.videoDialog.value
    // var email = e.email.value




    document.getElementById('editModal').style.display='none';
    
    //ajax
    let url = ''
    if(!googleId){
        url = '../../post/edit-post/'
    }
    else{
        url = '/post/edit-post/'
    }

    var formData = new FormData(document.getElementById("form-edit-post"))

    $.ajax({
        type: 'PUT',
        url: url + id,
        data: formData,
        processData: false,
        contentType: false,
        success: (data) => {
            // console.log(data);
            if (data.code === 0) {
                alert("Cập nhật bài viết thành công!");
                console.log(data.message);
                let URL = window.location.href + ''
                if(URL.includes("/profile")){
                    getUserNews()
                    //vấn đề is here
                    //nếu là ảnh
                }
                    
                else{
                    displayNews()
                }
                // console.log(data)
                // if(data.caption){
                //     // document.getElementById("caption-" + id).innerHTML = data.caption; //cập nhật lại số lượng
                //     $(`#caption-${id}`).text(text.replace(captionBefore, data.caption)); 
                // }
                // if(data.image){
                //     $(`#image-${id}`).attr("src",data.image)
                // }

                // if(data.video){
                //     document.getElementById("video-" + id).innerHTML = data.video; //cập nhật lại số lượng
                // }
                    
                console.log("I'm here")
                //clear dialog


            } else {
                alert("Cập nhật bài viết thất bại!");
                console.log(data.message);

            }

            $('span.dialog-pip').remove(); //được
            $("#image-dialog").val("");
            $('#caption-dialog').val("");
            $('#video-dialog').val("");


        },
        error: (err) => {
            console.log(err);
        }
    });

    // $(".btn-edit-modal").click(function(){


    // });
    

    return false;
}


//Hiển thị bài viết
function getUserNews(){
    var email = document.getElementById("email").value;
    var googleId = document.getElementById("googleId").value;
    var _id = document.getElementById("_id").value;
    var ajax = new XMLHttpRequest();
    var URL = window.location.href + '';

    ajax.open("POST", "/post/get-news-post", true);
    ajax.setRequestHeader("Content-Type", "application/json");

    ajax.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var response = JSON.parse(this.responseText);
            // console.log(response)
            var html = "";
            for (var a = 0; a < response.data.length; a++) {
                var data = response.data[a];
                var pathImage = data.account.image
                // console.log(data)
                if(data.account._id === _id){
                    html += `<div id="`+data._id+`" class="status-field-container write-post-container blog-post `+((a<10) ? "visible"  : '')+ `">
                    <div class="central-meta item">
                        <div class="user-post"> 
                            <div class="friend-info">
                                <figure><a href="/profile/`+ data.account._id +`">`
                        if((pathImage.includes("uploads") && URL.includes("/profile"))){
                            html += '<img src="../../'+ data.account.image + '" style="width: 45px; height: 45px; object-fit: cover;border-radius: 50%;">';
                        }
                        else{
                            html += '<img src="'+ data.account.image + '" style="width: 45px; height: 45px; object-fit: cover;border-radius: 50%;">';

                        }
                        html += '</a></figure>';

                        html += '<div class="friend-name">';
                            html += '<ins>';
                                // if (data.type == "post")
                                // {
                                //     // html += '<a href="/user/' + data.account.email + '">';
                                // }
                                // else
                                // {
                                //     html += data.account.name;
                                // }
                                html += `<a href="/profile/`+ data.account._id +`">`;
                                html += data.account.name;
                            html += '</a>';
                            html += '</ins>';

                            var createdAt = new Date(data.created_at);
                            var date = createdAt.getDate() + "";
                            var dateTime = createdAt + ""
                            var arrayDate = dateTime.split(" ");
                            var time = arrayDate[4]
                            var t = ''
                            var count = 0
                            for(var hhmm in time){
                                if(time.charAt(hhmm)===':')
                                    count ++;

                                if(count == 2)
                                    break; 

                                t += time.charAt(hhmm);
                            }
                            date = t +", " + date.padStart(2, "0") + " " + months[createdAt.getMonth()] + ", " + createdAt.getFullYear() ;

                            html += '<span>Published: ' + date + '</span>';
                        html += '</div>';
                        //kiểm tra quyền xóa,sửa có phải của email này?
                if(data.account.email == email){
                    var src = $('<div>' + data.video + '</div>').find('iframe').attr('src'); // trả về src thành công <3
                    //console.log(src);
                    html +=  `<div id="custom">
                                <button id="btnEdit" type="submit"
                                    data-id="`+data._id+`" 
                                    data-email="`+data.account.email+`"
                                    data-googleid="`+googleId+`"
                                    data-caption="`+data.caption+`"
                                    data-image="`+data.image+`"
                                    data-video="`+src+`"
                                    onclick="showDialogEdit(this);"
                                    >
                                    <i class="fa fa-pencil-square-o fa-lg"></i>
                                </button>`
                    html +=    `<button type="submit" id="btnDelete" 
                                    data-id="`+data._id+`" 
                                    data-googleid="`+googleId+`"
                                    onclick="showDialog(this);"
                                    >
                                
                                    <i class="fa fa-trash fa-lg"></i>
                                </button>
                            </div>`
                }
                        html += '<div class="post-meta">';

                            html += '<div class="description">';
                                html += `<p id = "caption-`+ data._id +`">`;
                                    html += data.caption;
                                html += '</p>';
                            html += '</div>';
                            
                            if (data.image) {
                                html += '<p id = "image-'+ data._id+'" hidden></p>' //chưa bik xóa dc hk
                                html += '<span><img id = "image-'+ data._id+'" src="../../../' + data.image + '"></span>';
                            }

                        if (data.video) {
                            html += '<p id = "video-'+ data._id+'" hidden></p>' //chưa bik xóa dc hk
                            html += '<span id = "video-'+ data._id+'">'+ data.video+ '</span>';
                        }
                
                            
                            html += likeLayout(data);
                        html += '</div>';
                    html += '</div>';

                    html += "<div id='post-comments-" + data._id + "'>";
                    html += cmtLayout(data);
                    html += "</div>";

                html += '</div>';
            html += '</div>';
        html += '</div>';
                }

            }
            document.getElementById("newsfeed").innerHTML = html;
        }
    };

    var data = JSON.stringify({"email": email})
    // formData.append("")
    ajax.send(data);
    return false;
}


window.onload = function () {
    // addPost()
    // displayNews()
    let URL = window.location.href + ''
    if(URL.includes("/profile")){
        // getUserNews()
        getUserNews()
        //console.log("I'm here")
    }
        
    else{
        displayNews()
    }

    var modal = document.getElementById('deleteModal');

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    //load
    // var posts = document.querySelectorAll('.blog-post:not(.visible)'); //những post not visible

    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
          // you're at the bottom of the page
          console.log("Bottom of page");
            
            var posts = document.querySelectorAll('.blog-post:not(.visible)'); //những post not visible

            // $('#change-end').html("Loading...")
            //nếu còn hơn 10 bài viết chưa hiển thị
            if(posts.length > 0 ){
                for(let i = 0; i < 10; i++){
                    if(posts[i] != undefined){
                        posts[i].className += "visible";          
                    }  
                }
            }
        }
        


    };
     
};







