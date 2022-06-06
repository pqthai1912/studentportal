const express = require('express');
const router = express.Router();
const PostsModel = require('../models/PostsModel')
const AccountsModel = require('../models/AccountsModel');
const DepartmentsModel = require('../models/DepartmentsModel');
const NotificationsModel = require('../models/NotificationsModel');
const checkLogged = require('../lib/middleware/checkLogin')
const fs = require('fs');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/avatar',
  limits: {fileSize: 1024 * 1024 * 1024},
  fileFilter: (req,file,callback) =>{
      if (file.mimetype.startsWith('image/'))
          callback(null,true) //accept
      else
          callback(null,false) //deny
  },

})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/user/login');
  }

router.get('/', isLoggedIn , async function (req, res) {
  req.session.user = req.user //phải có
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = 100 * hour
  let result = await NotificationsModel.find().sort({ "created_at": -1 }).exec();
  let departments = await DepartmentsModel.find({})
  res.render('index',{user: req.user, departments:departments, result: result})
    
    // res.json(req.user)
});

//truy cập vào trang 1 user bất kỳ /user/id
router.get('/profile/:id', isLoggedIn ,async (req, res)=>{
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = 100 * hour
  let userNow = req.session.user
  // console.log(userCurr)
  let user = await AccountsModel.findOne({_id: req.params.id})
  if (!user) return res.json({ code: 0, message: 'Không tìm thấy người này'});


  //render ở đây
  // res.json({ code: 0, message: 'Đã tìm thấy user!', user: user, departments: departments});
  res.render("profile", {user: user, userNow: userNow})
})


router.get('/profile/user/:id', isLoggedIn ,async (req, res)=>{
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = 100 * hour
  let user = await AccountsModel.findOne({_id: req.params.id})
  if (!user) return res.json({ code: 0, message: 'Không tìm thấy người này'});

  let departments = await DepartmentsModel.find({})

  if(!departments)
    departments = undefined;

  //render ở đây
  // res.json({ code: 0, message: 'Đã tìm thấy user!', user});
  res.render("profileWall", {user: user, departments: departments})
})


//chỉnh sửa thông tin cá nhân
router.put("/profile/user/:id", upload.single('image') ,async (req, res) => {
  let profile = req.body
  let image = req.file
  let imgPath = ''
  let user
  if (image) {
    //nếu người dùng thêm ảnh
    imgPath = "uploads/avatar/" + new Date().getTime() + "-" + image.originalname;
    fs.renameSync(image.path,imgPath); 

    user = await AccountsModel.findOneAndUpdate({ _id: req.params.id },
      {
        $set: {
          "name": profile.name,
          "class": profile.class,
          "department": profile.department,
          "image": imgPath
        }
      }
     )
     if(!user) return res.json({code: 1, message: "User không hợp lệ và không thể update"})
     await PostsModel.updateMany({"account._id":user._id},
     {
       $set: 
         {
           "account.name": profile.name,
           "account.image": imgPath
         }
     }
     )
  }else{
    //cập nhật thông tin
    user = await AccountsModel.findOneAndUpdate({ _id: req.params.id },
      {
        $set: {
          "name": profile.name,
          "class": profile.class,
          "department": profile.department,
        }
      }
     )
     if(!user) return res.json({code: 1, message: "User không hợp lệ và không thể update"})
     await PostsModel.updateMany({"account._id":user._id},
     {
       $set: 
         {
           "account.name": profile.name,
         }
     }
     )
  }

  
  let userUp = await AccountsModel.findOne({ _id: req.params.id })
  req.session.user = userUp; //cập nhật lại session

  if(!userUp) return res.json({code: 1, message: "User không hợp lệ"})

  res.json({ code: 0, message: 'Cập nhật dữ liệu thành công!', userUp });
  // res.redirect('/',userUp)
});


router.get('/department',checkLogged, async (req, res) => {
  // req.session.user = req.session.user.user;
  let user = req.session.user;
  req.session.user = user
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = 100 * hour
  // console.log( req.session.user.user._id)
  let result = await NotificationsModel.find().sort({ "created_at": -1 }).exec();
  let departments = await DepartmentsModel.find({})
  res.render('index',{user: req.session.user.user, departments,result})
  // res.json(req.user)
});

//truy cập vào trang 1 khoa bất kỳ 
router.get('/department/profile/:id', checkLogged ,async (req, res)=>{
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = 100 * hour
  let userNow = req.session.user.user
  let user = await AccountsModel.findOne({_id: req.params.id})
  if (!user) return res.json({ code: 0, message: 'Không tìm thấy người này'});

  //render ở đây
  // res.json({ code: 0, message: 'Đã tìm thấy user!', user});
  res.render("profile", {user: user, userNow: userNow})
})

module.exports = router;
