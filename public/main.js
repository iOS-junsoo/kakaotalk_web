$('.fa-user').click(function(){
    console.log('유저');
    location.href = 'http://localhost:8080/main/friends'
})
$('.fa-comment').click(function(){
    console.log('채팅');
    location.href = 'http://localhost:8080/main/chats'
    
})
$('.fa-ellipsis').click(function(){
    console.log('설정');
    location.href = 'http://localhost:8080/main/setting'
})

$('.main').css('height', window.innerHeight - 150)
        window.onresize = function() {
            $('.main').css('height', window.innerHeight - 150)
            console.log(window.innerHeight);
}

