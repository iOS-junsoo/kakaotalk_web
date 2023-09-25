var router = require('express').Router();

router.get('/join', function(request, response){
    response.render('join.ejs')
});

router.post('/adduser', function(request, response){

    request.app.db.collection('user').insertOne({email: request.body.email, pw: request.body.pw, realname: request.body.realname, nickname: request.body.nickname}, function (error, result) {
        if (!result) {

        } else {
            response.redirect('/login')
        }
    });
});

module.exports = router;