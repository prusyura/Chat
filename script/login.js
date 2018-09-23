$(document).ready(function() {
    $(".regist").click(function(){
        $.get('/regist',function(data){
            console.log(data);
            document.location.reload();
        });
    });
})