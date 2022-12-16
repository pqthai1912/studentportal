const express = require('express');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const router = express.Router();
const checkLogged = require('../lib/middleware/checkLogin')
const AccountsModel = require('../models/AccountsModel');
const DepartmentsModel = require('../models/DepartmentsModel');
const NotificationsModel = require('../models/NotificationsModel');

const checkAccount = [
    check('name')
        .exists().withMessage('Chưa có tên người dùng, tên người dùng cần được gửi với key là name!')
        .notEmpty().withMessage('Vui lòng nhập tên người dùng!'),
    check('email')
        .exists().withMessage('Chưa có địa chỉ Email, Email cần được gửi với key là email!')
        .notEmpty().withMessage('Vui lòng nhập địa chỉ Email!')
        .isEmail().withMessage('Địa chỉ Email không hợp lệ!'),
    check('department')
        .exists().withMessage('Chưa có phòng/khoa, phòng/khoa cần được gửi với key là department!')
        .notEmpty().withMessage('Vui lòng chọn phòng/khoa!'),
]

const checkDepartment = [
    check('department')
        .exists().withMessage('Chưa có phòng/khoa, phòng/khoa cần được gửi với key là department!')
        .notEmpty().withMessage('Vui lòng nhập tên phòng/khoa!'),
    check('description')
        .exists().withMessage('Chưa có mô tả, mô tả cần được gửi với key là description!')
        .notEmpty().withMessage('Vui lòng nhập mô tả!'),
]

const checkNotification = [
    check('title')
        .exists().withMessage('Chưa có tiêu đề bài viết, tiêu đề cần được gửi với key là title!')
        .notEmpty().withMessage('Vui lòng nhập tiêu đề bài viết!'),
    check('content')
        .exists().withMessage('Chưa có nội dung bài viết, nội dung cần được gửi với key là content!')
        .notEmpty().withMessage('Vui lòng nhập nội dung bài viết!'),
    check('department')
        .exists().withMessage('Chưa có phòng/khoa, phòng/khoa cần được gửi với key là department!')
        .notEmpty().withMessage('Vui lòng nhập phòng/khoa!'),
]

// link : /admin/accounts
router.get('/account', checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        req.session.user = user; //thêm dòng này dô
        // console.log(user)
        let result = await AccountsModel.find().exec();
        let departments = await DepartmentsModel.find({})
        //res.render('admin/account/index', { code: 0, message: 'Tải dữ liệu thành công!', result });
        res.render('admin/account/index', {user: user.user,result:result, departments:departments});
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/account/add',checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let error = req.flash('error') || '';
        let email = req.flash('email') || '';
        let name = req.flash('name') || '';
        let users = { error, email, name };
        let result = await DepartmentsModel.find().exec();
        res.render('admin/account/add', {user: user.user, result, users });
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/account/edit/:id', checkLogged, async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let departments = await DepartmentsModel.find({})
        let result = await AccountsModel.findById(req.params.id).exec();
        //res.render('admin/account/edit', { code: 0, message: 'Tải dữ liệu thành công!', result });
        res.render('admin/account/edit', {user: user.user, result:result, departments:departments})
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/account/:id', async(req, res, next) => {
    try {
        let result = await AccountsModel.findById(req.params.id).exec();
        res.json({ code: 0, message: 'Tải dữ liệu thành công!', result });
    } catch (error) {
        res.status(500).render('error')
    }
});


router.post('/account', checkAccount, async(req, res, next) => {
    try {
        let { name, email, password, department } = req.body;
        let result = validationResult(req);
        if (result.errors.length === 0) {


            let user = await AccountsModel.findOne({ email: email }).exec();
            if (!user) {
                //băm mk ra
                let hashed = bcrypt.hashSync(password, 10);
                let data = { email, password: hashed, name, role: 1, department, post: 0, googleId: '' }; // password mặc định là email
                let result = await AccountsModel.create(data);
                return res.redirect('account');

            }
            req.flash('error', 'Tài khoản đã tồn tài!');
            req.flash('email', email);
            req.flash('name', name);
            return res.redirect('/admin/account/add');
        }
        result = result.mapped();

        for (fields in result) {
            req.flash('error', result[fields].msg);
            break;
        }

        req.flash('email', email);
        req.flash('name', name);
        return res.redirect('/admin/account/add');
    } catch (error) {
        return res.status(500).render('error')
    }
});

router.post("/account/edit", async(req, res, next) => {
    try {
        let result = await AccountsModel.findOneAndUpdate({ _id: req.body.id }, req.body)
        res.redirect('/admin/account');
    } catch (error) {
        res.status(500).render('error')
    }
});


router.get('/account/delete/:id', async(req, res, next) => {
    try {
        let result = await AccountsModel.deleteOne({ _id: req.params.id }).exec();
        res.redirect('/admin/account');
    } catch (error) {
        res.status(500).render('error')
    }
});

// link: admin/departments
router.get('/department', checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let result = await DepartmentsModel.find().exec();
        res.render('admin/department/index', {user: user.user, result:result});
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/department/add', checkLogged, async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let error = req.flash('error') || '';
        let department = req.flash('department') || '';
        let description = req.flash('description') || '';
        let departments = { error, department, description };
        let result = await DepartmentsModel.find().exec();
        res.render('admin/department/add', {user: user.user, result:result, departments:departments });
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/department/edit/:id', checkLogged, async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let result = await DepartmentsModel.findById(req.params.id).exec();
        res.render('admin/department/edit', {user: user.user, result:result});
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/department/:id', async(req, res, next) => {
    try {
        let result = await DepartmentsModel.findById(req.params.id).exec();
        res.json({ code: 0, message: 'Tải dữ liệu thành công!', result });
    } catch (error) {
        res.status(500).render('error')
    }
});

router.post('/department', checkDepartment, async(req, res, next) => {
    try {
        let { department, description } = req.body;
        let result = validationResult(req);
        if (result.errors.length === 0) {
            let descriptions = await DepartmentsModel.findOne({ department: department }).exec();
            if (!descriptions) {
                let result = await DepartmentsModel.create({ department, description });
                return res.redirect('department');
            }
            req.flash('error', 'Phòng/Khoa đã tồn tài!');
            req.flash('department', department);
            req.flash('description', description);
            return res.redirect('/admin/department/add');
        }
        result = result.mapped();

        for (fields in result) {
            req.flash('error', result[fields].msg);
            break;
        }

        req.flash('department', department);
        req.flash('description', description);
        return res.redirect('/admin/department/add');
    } catch (error) {
        return res.status(500).render('error')
    }
});

router.post("/department/edit", async(req, res, next) => {
    try {
        let result = await DepartmentsModel.findOneAndUpdate({ _id: req.body.id }, req.body)
        res.redirect('/admin/department');
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/department/delete/:id', async(req, res, next) => {
    try {
        let result = await DepartmentsModel.deleteOne({ _id: req.params.id }).exec();
        res.redirect('/admin/department');
    } catch (error) {
        res.status(500).render('error')
    }
});

// link: admin/notification
router.get('/notification', checkLogged,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let result = await NotificationsModel.find().sort({ "created_at": -1 }).exec();
        let departments = await DepartmentsModel.find({})
        //res.render("notification/index", { code: 0, message: 'Tải dữ liệu thành công!', result });
        res.render('notification/index', {user:((req.session.user.user) ? user.user : user), result:result, departments:departments});
    } catch (error) {
        res.status(500).render('error')
    }
});
router.get('/notification/post', checkLogged ,async(req, res, next) => {
    try {
        let user = req.session.user.user;
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        // console.log(user)
        let error = req.flash('error') || '';
        let title = req.flash('title') || '';
        let content = req.flash('content') || '';
        let notifications = { error, title, content };
        let result = await DepartmentsModel.find().exec();
        res.render('notification/post', {user,result, notifications });
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/notification/manager', checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        // console.log(req.session.user)
        let result = await NotificationsModel.find().sort({ "created_at": -1 }).exec();
        let departments = await DepartmentsModel.find({})
        //res.render('notification/manager', { code: 0, message: 'Tải dữ liệu thành công!', result });
        res.render('notification/manager', {user: user.user, result:result, departments:departments});
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/notification/type', checkLogged ,async (req, res, next) => {

    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let departments = await DepartmentsModel.find({});
        //console.log(departments)
        res.render('notification/type', {user: user.user, departments: departments});
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/notification/edit/:id', checkLogged ,async(req, res, next) => {
    try {
        let user = req.session.user.user;
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let result = await NotificationsModel.findById(req.params.id).exec();
        res.render('notification/edit', { user, result });
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/notification/detail', checkLogged , async(req, res) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let result = await NotificationsModel.find({}).sort({"created_at": -1}).limit(1);
        // console.log(result)
        let departments = await DepartmentsModel.find({})
 
        res.render('notification/detail', {result:result[0], departments:departments, user:user});
    } catch (error) {
        res.status(500).render('error')
    }
});


router.get('/notification/:id', checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user = req.session.user;
        let result = await NotificationsModel.findById(req.params.id).exec();
        let departments = await DepartmentsModel.find({})
        //res.render("notification/detail", { code: 0, message: 'Tải dữ liệu thành công!', result });
        res.render('notification/detail', {user:((req.session.user.user) ? user.user : user),result:result, departments:departments});
    } catch (error) {
        res.status(500).render('error')
    }
});


router.post('/notification', checkNotification, async(req, res, next) => {
    try {
        let { email, title, content, department } = req.body;
        let result = validationResult(req);
        if (result.errors.length === 0) {
            let user = await AccountsModel.findOne({"email": email})
            if(!user) return res.json({code: 1, message: "User không hợp lệ"})

            let result = await NotificationsModel.create({ title, content, department,
                account: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            } });
            return res.redirect("notification/manager");

        }

        result = result.mapped();

        for (fields in result) {
            req.flash('error', result[fields].msg);
            break;
        }

        req.flash('title', title);
        req.flash('content', content);
        return res.redirect('/admin/notification/post');
    } catch (error) {
        return res.status(500).render('error')
    }
});



router.post("/notification/edit", async(req, res, next) => {
    try {
        let result = await NotificationsModel.findOneAndUpdate({ _id: req.body.id }, req.body)
        res.redirect('/admin/notification/manager');
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/notification/delete/:id', async(req, res, next) => {
    try {
        let result = await NotificationsModel.deleteOne({ _id: req.params.id }).exec();
        res.redirect('/admin/notification/manager');
    } catch (error) {
        res.status(500).render('error')
    }
});

router.get('/rePwd/:id', checkLogged ,async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user= req.session.user;
        req.session.user = user;

        let error = req.flash('error') || '';
        let result = await AccountsModel.findById(req.params.id).exec();
        res.render('admin/rePwd', {user: user.user, result, error });
    } catch (error) {
        res.status(500).render('error')
    }
});


router.post('/rePwd', async(req, res, next) => {
    try {
        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = 100 * hour
        let user= req.session.user;
        
        let { password, newpassword, repassword } = req.body
        // console.log(password, newpassword, repassword);
        if(!password){
            req.flash('error', 'Mật khẩu cũ không được để trống!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
        if(!newpassword){
            req.flash('error', 'Mật khẩu mới không được để trống!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
        if(newpassword.length < 6){
            req.flash('error', 'Mật khẩu phải có ít 6 ký tự!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
        if(!repassword){
            req.flash('error', 'Mật khẩu xác nhận không được để trống!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
        if (newpassword !== repassword){
            req.flash('error', 'Mật khẩu xác nhận không đúng!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
         
        let account = await AccountsModel.findById(req.body.id).exec();
        let matched = bcrypt.compareSync(password, account.password)
        if (!matched) {
            req.flash('error', 'Mật khẩu không đúng!');
            return res.redirect(`rePwd/${req.body.id}`)
        }
        let hashed = bcrypt.hashSync(newpassword, 10);
        let data = { password: hashed }
        await AccountsModel.findOneAndUpdate({ _id: req.body.id }, data)
        res.redirect('/admin/account');
    } catch (error) {
        res.status(500).render('error')
    }
})


router.get('/notification/type-detail/:id', checkLogged,async (req, res) => {
    let id = req.params.id 
    var hour = 3600000
    req.session.cookie.expires = new Date(Date.now() + hour)
    req.session.cookie.maxAge = 100 * hour
    let user = req.session.user;
    req.session.user = user;

    let department = await DepartmentsModel.findById({"_id": id})
    if(!department) return res.json({code: 1, message: "Khoa không hợp lệ"})

    let notifications = await NotificationsModel.find({"department": department._id})
    if(!notifications) return res.json({code: 1, message: "Thông báo không hợp lệ"})

    res.render('notification/typeDetail',{user:((req.session.user.user) ? user.user : user), department: department, notifications: notifications})


})

module.exports = router;
