const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const auth = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.urlencoded({extended: true}));
//위아래 코드는 bodyParser가 client에서 오는 정보를 server에서 분석해서 가져올 수 있게 해주는 것
//application/json 타입으로 된 것을 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true//, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...')) //잘 실행되고 있나 확인
  .catch(err => console.log(err)) //연결이 안됐을 경우

app.get('/', (req, res) => res.send('Hello World!sdasd'))

app.get('/api/hello', (req, res) => {
  res.send("안녕하세용~~")
})

app.post('/api/users/register', (req, res) => {
    //회원 가입 할 때 필요한 정보들을 client에서 가져오면
		//그것들을 데이터 베이스에 넣어준다
    //이 정보들을 데베에 넣기 위해서는
  const user = new User(req.body)
  
    user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {

  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})
      
      //비밀번호 까지 맞다면 토큰 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        res.cookie("x_auth", user.token)
          .status(200) //성공
          .json({ loginSuccess: true, userId: user._id })
      })

    })
    return res.json({user});
  })
})

app.get('/api/users/auth', auth, (req, res) => {

  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말
  //role 1 어드민 role 2 특정 부서 어드민
  //여기서는 role이 0일 경우엔 일반유저, role이 0이 아닐 경우엔 관리자로 예시를 들었음
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

//로그아웃 route 만들기
app.get('/api/users/logout', auth, (req, res) => {

  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})
	
const port = 5000


app.listen(port, () => console.log(`Example app listening on port ${port}!`))