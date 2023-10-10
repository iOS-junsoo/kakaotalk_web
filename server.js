const express = require('express'); //express 라이브러리를 첨부해주세요.
const app = express(); //첨부한 라이브러리를 이용해서 객체를 만들어주세요.
const MongoClient = require('mongodb').MongoClient;
const bodyParser= require('body-parser')

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');


app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}))

app.use('/public', express.static('public'))
app.set('view engine', 'ejs');


var db;
MongoClient.connect('mongodb+srv://admin:kjs01023@cluster0.vvzafbn.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if (error) return console.log(error);
    db = client.db('kakaotalk');
    app.db = db; //라우터 파일 분리를 위해서 작성
    app.listen(8080, function(){
        console.log('8080 포트에 입장하셨습니다.');
    });
})

// MARK: LOGIN - 비밀번호 암호화 기능 구현하기!!

app.get('/login', function(request, response){
    response.render('login.ejs')
});

app.get('/fail', function(request, response) {
    response.send('로그인에 실패하였습니다.');
})

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(request, response){
    response.redirect('/main/friends');
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (enteredEmail, enteredPW, done) {
    console.log(enteredEmail, enteredPW);
    db.collection('user').findOne({ email: enteredEmail }, function (error, result) {
        if (error) return done(error)

        if (!result) return done(null, false, { message: '존재하지 않는 아이디 입니다.' })
        if (enteredPW == result.pw) {
            return done(null, result)
            
            
        } else {
            return done(null, false, { message: '맞지 않는 비밀번호 입니다.' })
        }
        console.log(result);
    })
}));

// * [SESSION]

// 세션 발급
passport.serializeUser(function(user, done) {
    done(null, user.email);
});

// 세션 찾기
passport.deserializeUser(function (Email, done) {
    db.collection('user').findOne({ email: Email }, function (error, result) {
        done(null, result)
    })
});

//MARK: JOIN

app.use('/',require('./routes/join.js'));

//MARK: MAIN

app.use('/main',require('./routes/main.js'));



//MARK: 암호화 진행하기 https://www.youtube.com/results?search_query=nodejs+%EC%95%94%ED%98%B8%ED%99%94