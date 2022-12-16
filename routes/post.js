const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer')
const embed = require("embed-video")
const PostsModel = require('../models/PostsModel')
const AccountsModel = require('../models/AccountsModel');

const ObjectId = require('mongoose').Types.ObjectId; 

// const checkLogged = require('../lib/middleware/checkLogin')

const router = express.Router();

const upload = multer({
    dest: 'uploads',
    limits: {fileSize: 1024 * 1024 * 1024},
    fileFilter: (req,file,callback) =>{
        if (file.mimetype.startsWith('image/'))
            callback(null,true) //accept
        else
            callback(null,false) //deny
    },

})
router.use(bodyParser.json())
.use(bodyParser.urlencoded({
    extended: true
}));
// router.use(upload.array());

// router.use('/uploads',express.static('uploads')) 

router.post('/add-post',  upload.single('image') , async (req, res)=>{

    let newPost = req.body;
    let image = req.file;

    let createdAt = new Date().getTime();
    let img = "";
    let vid = "";
    // console.log(req.file)
    let user = await AccountsModel.findOne({"email": newPost.email})
    // console.log(req.body)
    //nếu upload là ảnh
    if(!user) return res.json({code: 1, message: "User không hợp lệ"})


    if (image) {
        img = "uploads/" + new Date().getTime() + "-" + image.originalname;
        fs.renameSync(image.path,img); 
    }

    //nhúng /embed vào url
    if(newPost.video) {
        try{
            vid = embed(newPost.video, {query: {portrait: 0, color: '333', autohide: 1,mute: 0}, attr:{width:'100%', height:400}})
        }
        catch (e){ res.json({code: 1, message: "Đây không phải là một đường dẫn URL"})} 
    }

    //chèn post vào db
    let post =  PostsModel({
        "caption": newPost.caption,
        "image": img,
        "video": vid,
        "type": newPost.type,
        "createdAt": createdAt,
        "likers": [],
        "comments": [],
        "account": {
            "_id": user._id,
            "name": user.name,
            "email": user.email,
            "image": user.image
        }
    })
    post.save()
    .then(() => {
        AccountsModel.updateOne({"email": newPost.email},
        {
            $push:{
                "post": {
                    "_id": post._id,
                    "caption": newPost.caption,
                    "image": img,
                    "video": vid,
                    "type": newPost.type,
                    "createdAt": createdAt,
                    "likers": [],
                    "comments": []
                }
            }
        })
        .then(a => {
            if(!a) return res.json({code: 1, message: "Bài post không hợp lệ"})
    
            return res.json({code: 0, message: "Đăng bài thành công!"})
    
        }).catch(e => {
            return res.json({code: 3, message: e.message})
        })
        
    })
    .catch(e => {return res.json({code: 2, message: e.message})})   

    
})

router.put('/edit-post/:id', upload.single('imageDialog'),async (req, res)=>{

    let editPost = req.body;
    let image = req.file;
    // console.log(editPost, image)
    let createdAt = new Date().getTime();
    let img = "";
    let vid = "";
    // console.log(req.file)
    let user = await AccountsModel.findOne({"email": editPost.email})
    // console.log(req.body)
    //nếu upload là ảnh
    if(!user) return res.json({code: 1, message: "User không hợp lệ"})

    //nếu có ảnh
    if (image) {
        img = "uploads/" + new Date().getTime() + "-" + image.originalname;
        fs.renameSync(image.path,img); 
    }

    let videoUp = editPost.videoDialog +""
    // console.log(editPost)
    //nhúng /embed vào url
    if(editPost.videoDialog ) {
        if(videoUp.includes("embed")){
            vid = `<iframe src=`+ videoUp +` width="100%" height="400" frameborder="0" allowfullscreen></iframe>`
        }else{
            try{
                vid = embed(editPost.videoDialog, {query: {portrait: 0, color: '333', autohide: 1,mute: 0}, attr:{width:'100%', height:400}})
            }
            catch (e){ res.json({code: 1, message: "Đây không phải là một đường dẫn URL"})} 
        }

    }


    //nếu cả 2 đều có -> chọn image Dialog
    if(img != '' && editPost.imageCheck) {
        await PostsModel.updateOne({'_id': ObjectId(req.params.id)},{
            "caption": editPost.captionDialog,
            "image": img,
            "video": vid,
            "type": editPost.type,
            "createdAt": createdAt
        })
        console.log("Đã vào trường hợp 1")
        //tìm post sau khi cập nhật
        PostsModel.findOne({'_id': ObjectId(req.params)})
        .then((post) => {
            return res.json({code: 0, message: "Cập nhật thành công!", data: post})
        })
        .catch(e => {return res.json({code: 2, message: e.message})})   

    }else if(img == '' && editPost.imageCheck){
        //giữ ảnh cũ
        await PostsModel.updateOne({'_id': ObjectId(req.params.id)},{
            "caption": editPost.captionDialog,
            "video": vid,
            "type": editPost.type,
            "createdAt": createdAt
        })
        console.log("Đã vào trường hợp 2")
        //tìm post sau khi cập nhật
        PostsModel.findOne({'_id': ObjectId(req.params)})
        .then((post) => {
            return res.json({code: 0, message: "Cập nhật thành công!", data: post})
        })
        .catch(e => {return res.json({code: 2, message: e.message})})   
    }else if(img == '' && !editPost.imageCheck){
        //giữ ảnh cũ
        await PostsModel.updateOne({'_id': ObjectId(req.params.id)},{
            "caption": editPost.captionDialog,
            "image": '',
            "video": vid,
            "type": editPost.type,
            "createdAt": createdAt
        })
        console.log("Đã vào trường hợp 3")
        //tìm post sau khi cập nhật
        PostsModel.findOne({'_id': ObjectId(req.params)})
        .then((post) => {
            return res.json({code: 0, message: "Cập nhật thành công!", data: post})
        })
        .catch(e => {return res.json({code: 2, message: e.message})})   
    }

    // if(!image){
        //cập nhật cap vs video
        

    else{
        //nếu trước khi up mà kh có ảnh -> chỉ có video hoặc caption
        await PostsModel.updateOne({'_id': ObjectId(req.params.id)},{
            "caption": editPost.captionDialog,
            "image": img,
            "video": vid,
            "type": editPost.type,
            "createdAt": createdAt
        })

        console.log("Đã vào trường hợp 4")
        
        //tìm post sau khi cập nhật
        PostsModel.findOne({'_id': ObjectId(req.params)})
        .then((post) => {
            return res.json({code: 0, message: "Cập nhật thành công!", data: post})
        })
        .catch(e => {return res.json({code: 2, message: e.message})})   

    }

})

router.post('/get-news-post', async (req, res) => {
    let {email} = req.body
    let user = await AccountsModel.findOne({"email": email})
    // console.log(email, user)
    if(!user) return res.json({code: 1, message: "User không hợp lệ"})
    // let _id = []
    // _id.push(user._id) //thêm id vào mảng
    // "user._id": {$in: _id}
    // {"user._id": {$in: _id}}
    let fetchData = await PostsModel.find({}) //tìm trong mảng id có id nào bằng id của user trong post
    .sort({"created_at": -1}) //xếp theo thời gian mới nhất
    // .limit(10)
    // .exec(
    //     function (err, data) {
    //         // if (err) { return reject(new Error('ERROR : ' + err)) }
    //         // return data;
    //     }
    // )

    // console.log(fetchData)
    if(fetchData){
        return res.json({
            code: 0,
            message: "Lấy danh sách post thành công",
            data: fetchData
        })
    }
    return res.json({code: 1, message: "Không có dữ liệu từ server"})

})

router.post('/like-post', async (req,res) => {

    let whoLike = req.body;
    // console.log(whoLike)

    let user = await AccountsModel.findOne({"email": whoLike.email})

    if(!user) return res.json({code: 1, message: "User không hợp lệ"})
    
    let fetchPost= await PostsModel.findOne( {"_id": whoLike.id}) 
    // console.log(fetchPost)

    if(!fetchPost) return res.json({code: 1, message: "Không có dữ liệu từ server"})
    // console.log(fetchPost.likers)
    let isLiked = false;

    //nếu liker tồn tại
    if(fetchPost.likers._id){
        isLiked = fetchPost.likers._id.some(function(_id){
            return _id.equals(user._id);//true
        });
        // console.log(ObjectId(user._id)) //được
    }
    
    //nếu đã like r -> hủy like
    if (isLiked) {
        let post = await PostsModel.findOneAndUpdate({"_id": fetchPost._id}, 
        {
            $pull: {
                "likers": {
                    "_id": user._id
                }
        }})//chờ xóa
        if(!post) return res.json({code: 1, message: "Không có j cần update"})

        return res.json({
            "status": "unliked",
            "message": "Post has been unliked."
        })

    }

    else{
        let post = await PostsModel.findOneAndUpdate({"_id": whoLike.id},
        {
            $push: {
                "likers": {
                    "_id": user._id,
                    "name": user.name,
                    "image": user.image
            }
        }})

        if(!post) return res.json({code: 1, message: "Không có j cần update"})
        
        return res.json({
            "status": "liked",
            "message": "Post has been liked."
        })
        // .catch(err => res.status(500).json({ code: 1, message: err.message }))
    
    }


})

router.post('/comment-post', async (req, res) => {
    let cmtPost = req.body;
    // console.log(cmtPost)
    let createdAt = new Date().getTime();

    let user = await AccountsModel.findOne({"email": cmtPost.email})

    if(!user) return res.json({code: 1, message: "User không hợp lệ"})
    
    let id = ObjectId(); //id cmt

    let fetchPost= await PostsModel.findOneAndUpdate( {"_id": cmtPost.id},
    {
        $push: {
            "comments": {
                "_id": id,
                "account": {
                    "_id": user._id,
                    "name": user.name,
                    "image": user.image,
                },
                "comment": cmtPost.comment,
                "createdAt": createdAt
            }
        }
    }) 

    if(!fetchPost) return res.json({code: 1, message: "Không có cập nhật mới"})
    
    //đồng bộ post vs user
    let accountUp = await AccountsModel.findOneAndUpdate({
        "_id": fetchPost.account._id,
        "post._id": fetchPost._id
    },
    {
        $push: {
            "post.$[].comments": {
                "_id": id,
                "account": {
                    "_id": user._id,
                    "name": user.name,
                    "image": user.image,
                },
                "comment": cmtPost.comment,
                "createdAt": createdAt
            }
        }
    }
    )
    if(!accountUp) return res.json({code: 1, message: "Không có j cần update"})

    let fetchUpPost= await PostsModel.findOne({"_id": cmtPost.id})

    if(!fetchUpPost) return res.json({code: 1, message: "Bài viết không hợp lệ"})

    return res.json({
        "status": "success",
        "message": "Comment has been posted.",
        "fetchUpPost": fetchUpPost
    })

})

//đã xong//
router.post('/delete', async (req, res) =>{
    //:id này là object hk dùng trong postman dc
    let {id} = req.body

    if (!ObjectId.isValid(id)) {
        return res.json({code: 1, message: "ID không hợp lệ"});
      }

    // console.log(id)
    let post = await PostsModel.findOneAndRemove({"_id" : ObjectId(id)})
    // console.log(post)
    if(!post) return res.json({code: 1, message: "Không thấy bài viết!"})

    let accountUp = await AccountsModel.findOneAndUpdate({
        "_id": post.account._id, //id cua comment trong account =? vs id cua cmt trong post hk
        "post._id": ObjectId(id)
    },
    {
        $pull: {
            "post": {
                "_id": ObjectId(id)
            }
        }
    }
    )

    if(!accountUp) return res.json({code: 1, message: "Không xóa được bài viết"})

    return res.json({
        "status": "success",
        "message": "Xóa bài viết thành công!"
    })
})

//đã xong//
router.post('/comment-post/delete', async (req, res) =>{

    let delPost = req.body
    // console.log(ObjectId(delPost.id)) //cẩn thận nếu đã là objectId
    // let idPost = req.params.idPost
    // let id = req.params.idCmt

    //xóa cmt của post theo _id
    let post = await PostsModel.findOneAndUpdate({"_id": ObjectId(delPost.idPost)}, 
        {
            $pull: {
                "comments": {
                    "_id": ObjectId(delPost.id)
                }
        }})//chờ xóa
    if(post) {
        // console.log(fetchPost.account._id,fetchPost._id)
        // console.log(await PostsModel.findOne({"_id": delPost.idPost,"post._id": delPost.id}))
        
        // console.log(post.account._id,post._id)

        let accountUp = await AccountsModel.findOneAndUpdate({
            "_id": post.account._id,
            "post._id": post._id,
        },
        {
            $pull: {
                "post.$.comments": {
                    "_id": ObjectId(delPost.id)
                }
            }
        }
        )

        if(!accountUp) return res.json({code: 1, message: "Không xóa được cái này"})

        return res.json({
            "status": "success",
            "message": "Xóa cmt thành công!"
        })
    }
    return res.json({code: 1, message: "Không thấy bài viết!"})
   
})

module.exports = router;