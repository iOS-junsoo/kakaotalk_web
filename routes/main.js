var router = require('express').Router();

router.get('/friends', checkLogin, function(request, response){
    response.render('friends.ejs')
});

router.get('/chats', checkLogin, function(request, response){
    response.render('chats.ejs')
});

router.get('/setting', checkLogin, function(request, response){
    response.render('setting.ejs')
});

//로그인 되어 있는지 확인하는 함수
function checkLogin(request, response, next){
    if (request.user){
        next();
    }else {
        response.redirect('/login')
    }
}

module.exports = router;