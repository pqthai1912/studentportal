const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator')
const AccountsModel = require('../models/AccountsModel');


const checkLogin = [
  check('email')
  .exists().withMessage('Vui lòng cung cấp địa chỉ email')
  .notEmpty().withMessage('Địa chỉ email không được rỗng')
  .isEmail().withMessage('Địa chỉ email không hợp lệ')
  ,
  check('password')
  .exists().withMessage('Vui lòng cung cấp mật khẩu')
  .notEmpty().withMessage('Mật khẩu không được rỗng')
  .isLength({min: 6}).withMessage('Mật khẩu phải có tối thiểu 6 ký thự')
]

router.get('/login', function (req, res, next) {
    let error = req.flash('error') || '';
    let email = req.flash('email') || '';
    let password = req.flash('password') || '';
    res.render('login',{error: error, email: email, password: password});
});

router.get('/logout', (req,res) => {
    req.session.destroy()
    res.redirect('/user/login')
});

router.post('/login',checkLogin, async (req, res) => {
  let result = validationResult(req)
  let {email, password} = req.body;
  if(result.errors.length === 0){
    let account = await AccountsModel.findOne({ email })
    if (!account) {
      req.flash('error', "Email không tồn tại");
      req.flash('email', email);
      req.flash('password', password);
      return res.redirect('/user/login');
    }
    let matched = bcrypt.compareSync(password, account.password) //so sánh bcrypt
    if (!matched) {
      req.flash('error', "Password không chính xác");
      req.flash('email', email);
      req.flash('password', password);
      return res.redirect('/user/login');
      // return res.end(JSON.stringify({ code: 2, message: "Password không chính xác" }))
    }
    // req.session.user = email
    // req.session.id = { id: account._id}
    req.session.user = {user: account}
    // req.user = {user: account}
    // console.log(req.session.user)
    // return res.end(JSON.stringify({ code: 0, message: "Đăng nhập thành công"}));
    res.redirect('../department')
  }
  else{
    result = result.mapped()
    // let msg = ''
    for (let fields in result) {
      req.flash('error', result[fields].msg);
      break;
    }

    req.flash('email', email);
    req.flash('password', password);
    
    return res.redirect('/user/login');
  }

})


module.exports = router;
