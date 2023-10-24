const express = require('express'); //express 라이브러리를 첨부해주세요.
const app = express(); //첨부한 라이브러리를 이용해서 객체를 만들어주세요.
const MongoClient = require('mongodb').MongoClient;
const bodyParser= require('body-parser')

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//socket.io 세팅
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const { request } = require('http');
const io = new Server(http);

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json()); 
app.use(express.urlencoded( {extended : true } ));

app.use('/public', express.static('public'))
app.set('view engine', 'ejs');

var email = '';
var friendsLIst;
var user_id;

var db;
MongoClient.connect('mongodb+srv://admin:kjs01023@cluster0.vvzafbn.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if (error) return console.log(error);
    db = client.db('kakaotalk');
    app.db = db; //라우터 파일 분리를 위해서 작성
    http.listen(8080, function(){
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
    friendsLIst = user.friends;
    user_id = user._id
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

// app.use('/main',require('./routes/main.js'));
app.get('/main/friends', checkLogin, function(request, response){
    response.render('friends.ejs', {userInfo: request.user})
    
});

app.get('/main/chats', checkLogin, function(request, response){
    db.collection('chatroom').find( {creator: request.user.nickname}).toArray(function(error, result){
        
        response.render('chats.ejs', {userInfo: request.user, chatInfo: result})
    });
    
});

app.get('/main/setting', checkLogin, function(request, response){
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



//MARK: 암호화 진행하기 https://www.youtube.com/results?search_query=nodejs+%EC%95%94%ED%98%B8%ED%99%94


//MARK: 친구찾기 

app.post('/search', function(request, response){
    email = request.body.email;
});


app.get('/search', function(request, response){
    
    
    db.collection('user').findOne({ email: email }, function (error, result) {
       
        if (!result){
            response.writeHead(200, { //헤더를 변경해주는 부분
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
            });
            response.write('event: friendInfo\n');
            response.write(`data: 해당 이메일로 가입한 유저가 없습니다.\n\n`);
            
        } else{
            response.writeHead(200, { //헤더를 변경해주는 부분
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
            });
            response.write('event: friendInfo\n');
            response.write(`data: ${JSON.stringify(result)}\n\n`); 
            response.end()
        }
    })
});

//MARK: 친구추가 
app.post('/addfriend', function(request, response){
    friendsLIst.push(request.body.nickname);
    db.collection('user').updateOne( { email : request.user.email }, {$set : { friends: friendsLIst }}, function (error, result) {
        response.render('friends.ejs', {userInfo: request.user})
    });
});

//MARK: 채팅방 생성

app.post('/create_chatroom', function(request, response){
   db.collection('chatroom').insertOne({title: request.body.title, partner: request.body.partner, creator: request.user.nickname}, function (error, result) {
        if (!result) {
            
        } else {
            db.collection('chatroom').find( {creator: request.user.nickname}).toArray(function(error, result){
                response.render('chats.ejs', {userInfo: request.user, chatInfo: result})
            });
        }
    });
});

var title;

//MARK: socket.io
io.on('connection', function(socket){
    console.log('connet in webSocket...');

   
    //클라이언트에서 보낸 데이터 받기
    socket.on('chatroom-name', function(data){
        title = data;
        db.collection('message').find( {title: title}).toArray(function(error, result){
            io.emit('server-send', JSON.stringify(result))
            io.emit('user_id', user_id)
        });

    })

  
})

//MARK: 채팅 기능

app.post('/chat', function(request, response){
    db.collection('message').insertOne({title: title, writer: user_id, message: request.body.message, time: request.body.time }, function (error, result) {
        
        response.status(200).send({ message: '성공'})
    });
});

app.get('/get_message', function(request, response){
    db.collection('message').find( {title: title}).toArray(function(error, result){
        console.log(result);
        response.status(200).send({ message: result})
    });
});