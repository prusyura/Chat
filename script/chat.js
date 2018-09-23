$(document).ready(function() {
    var socket = io.connect('https://chatprusyura.herokuapp.com');
    
	socket.emit('joinclient',"is connect");
	socket.on('joinserver',function(data){
        var mas = data.mas;
        var msg = data.msg;
        var user =data.user;
        $(".users").empty();
        for(var i = 0; i < mas.length; i++){
            $("<li>").text(mas[i]).appendTo(".users")
        }
        var date = new Date();
        date =date.toLocaleTimeString();
        $("<p>").text(date+":"+" "+msg+" "+user).appendTo(".chat");
		console.log(data);

	});
    
    function getUser(){
    	$.get('/getuser',function(data){
    		$("#log").css("color","red").text(data.userobj.username);
    	});
    }
    getUser();
    
    
    
    $(".send").click(function(){
        var text = $(".msg").val();
        if(!text) return
        $(".msg").val("");
        socket.emit("sendmsg",text)
    });
    $(".msg").keyup(function(){
        if(event.keyCode==13) {
            $(".send").click();
            return false;
        }
    });
    socket.on("msgserver",function(data){
        var date = new Date();
        date =date.toLocaleTimeString();
        $("<p>").text(date+": "+data.user+": "+data.msg).appendTo(".chat");
    });


    $(".logout").click(function(){
    	$.get('/logout',function(data){
    		console.log(data);
            document.location.reload();
            socket.emit("out","outserver");
    	});
    });
    socket.on("outserver",function(data){
        var mas = data.mas;
        var date = new Date();
        date =date.toLocaleTimeString();
        $("<p>").text(date+": "+data.msg+data.user).appendTo(".chat")
        $(".users").empty();
        for(var i = 0; i < mas.length; i++){
            $("<p>").text(mas[i]).appendTo(".users")
        }
    });
});