const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require("./models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.urlencoded({extended: true}));
//위아래 코드는 bodyParser가 client에서 오는 정보를 server에서 분석해서 가져올 수 있게 해주는 것
//application/json 타입으로 된 것을 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true//, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...')) //잘 실행되고 있나 확인
  .catch(err => console.log(err)) //연결이 안됐을 경우

app.get('/', (req, res) => res.send('Hello World!sdasd'))

app.post('/register', (req, res) => {
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
	

app.listen(port, () => console.log(`Example app listening on port ${port}!`))