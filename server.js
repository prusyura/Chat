var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(express.static(__dirname));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var cookieParser = require('cookie-parser')()
app.use(cookieParser);
var session = require('cookie-session')({
	keys:['secret'],
	maxAge:2*60*60*1000
})
app.use(session);
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var User = require('./models/model');

//Підключаєм локальну стратегію для автентифікації

var localStrategy = require('passport-local').Strategy;

/*Створюємо екземпляр локальної стратегії, приєднуємо її до паспорту 
і реалізуємо логіку автентифікації
*/

passport.use(new localStrategy(function(username,password,done){
	console.log(username);
	console.log(password);

	User.find({username:username,password:password}, function(error,data){
			console.log(data);
			if(data.length){
				console.log("yes");
				return done(null,{
					id:data[0]._id,
					username:data[0].username
				})
			}
			else{
			console.log('none');
				return done(null,false);
			}
			
		})
}))

//Записуємо дані обєкта які повертає локальна стратегія після автентифікації в сессію
//Користувач авторизується

passport.serializeUser(function(user,done){
	console.log('Serialize User :');
	console.log(user);
	done(null,user);
})

/*При всіх наступних зверненнях авторизованого користувача до сервера відбувається десеріалізація
А саме використання даних сессії
*/

passport.deserializeUser(function(obj,done){
	User.find({_id:obj.id},function(error,data){
		done(null,{
			userobj:data[0]
		})
	})
})

//Дані десеріалізації завжди будуть доступні через req.user

app.get('/', function (req, res,next) {
  if(req.isAuthenticated())
  	next();
  else{
  	res.redirect('/login.html');
  }
})

app.get('/', function (req, res) {
	console.log(req.user);
	console.log(req.session);
  	res.sendFile(__dirname+'/chat.html');
})

app.post('/login',passport.authenticate('local',{
	successRedirect:'/',
	failureRedirect:'/login'
}));
app.get('/login', function (req, res) {
	res.sendFile(__dirname+'/login.html');
  })
  
app.post("/regist",function(req,res){
	console.log(req.body);
	var user = new User(req.body);
	user.save(function(err,data){
		console.log(data);
	})
});
app.get('/regist', function (req, res) {
	res.sendFile(__dirname+'/login.html');
	
  })


app.get('/getuser', function (req, res) {
  res.send(req.user);
})

app.get('/logout',function(req,res){
	req.session=null;
	res.send("Log out user!");
})

/*Привязуємо сокет який створюється до сессії авторизованого юзера*/

io.use(function(socket,next){
	var req = socket.handshake;
	var res = {};
	cookieParser(req,res,function(err){
		if(err){
			return next(err);
		}
		session(req,res,next);
	})
})
var users = [];//лобальний масив юзерів


io.on('connection',function(socket){
	var user = socket.handshake.session.passport.user.username;
	var pos = users.indexOf(user);

	if(pos == -1){
		users.push(user)
	}
	console.log(user);
	socket.on('joinclient',function(data){
		console.log(data);
		socket.emit('joinserver',{
			msg:"Hellow ",
			mas:users, 
			user:user
			});
		socket.broadcast.emit('joinserver',{
			msg:"До нас долучився ",
			mas:users,
			user:user
			});
	});
	socket.on("sendmsg",function(data){
		io.sockets.emit("msgserver",{
			msg:data,
			user:user
		});
	});
	socket.on('out',function(data){
		console.log(data);
		var pos = users.indexOf(user);
		users.splice(pos,1);
		socket.broadcast.emit('outserver',
			{msg:" Від нас пішов ",
			mas:users,
			user:user
			});
	});

});

server.listen(process.env.PORT || 8080);
console.log('Server run!');