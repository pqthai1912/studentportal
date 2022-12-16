module.exports = (req,res,next) => //biến next giúp xác định có đi tiếp hk 
{
    if(req.session.user || req.user ){
        // 
        next()
    }
    else{
        res.redirect(303,'/user/login')
    }
}
