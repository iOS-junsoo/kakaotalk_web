const express = require('express'); //express 라이브러리를 첨부해주세요.
const app = express(); //첨부한 라이브러리를 이용해서 객체를 만들어주세요.
const MongoClient = require('mongodb').MongoClient;
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

app.use('/public', express.static('public'))
app.set('view engine', 'ejs');


var db;
MongoClient.connect('mongodb+srv://admin:kjs01023@cluster0.vvzafbn.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if (error) return console.log(error);
    db = client.db('kakaotalk');

    app.listen(8080, function(){
        console.log('8080 포트에 입장하셨습니다.');
    });
})
 
// 8080port에 서버를 연다.


app.get('/login', function(request, response){
    response.render('login.ejs')
    // db.collection('user').insertOne({email: "rlawnstn01023@naver.com", pw: "1234", nickname: "김준수", imgURL: "https://mblogthumb-phinf.pstatic.net/MjAyMDAyMTBfODAg/MDAxNTgxMzA0MTE3ODMy.ACRLtB9v5NH-I2qjWrwiXLb7TeUiG442cJmcdzVum7cg.eTLpNg_n0rAS5sWOsofRrvBy0qZk_QcWSfUiIagTfd8g.JPEG.lattepain/1581304118739.jpg?type=w800"}, function (error, result) {
    //     console.log(result);
    // });
});

app.post('/login', function(request, response){
    response.render('login.ejs')
    db.collection('user').findOne({email: request.body.email, pw: request.body.pw}, function (error, result) {
        if (!result) {
            console.log('회원가입 필요');
        } else {
            console.log('회원가입 불 필요');
        }
    });
});