const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //띄어쓴 부분을 없애주는 역할
        unique: 1 //똑같은 내용을 쓰지 못하도록...
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    }, //유효성 관리
    tokenExp: {
        type: Number
    }//토큰 사용할 수 있는 유효기간
})

userSchema.pre('save', function( next ){
    var user = this;

    //비밀번호 바꿀 때만 암호화
    if(user.isModified('password')) {

        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if(err) return next(err) //에러코드로 이동
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {

    //plainPassword 1234567 암호화된 비밀번호 $2b$10$xDtS5yX2BG7pIyL.YL5wHun6VHVnhrkqx0EqD
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err),
            cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {

    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secret Token')

    //user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    //user._id + '' = token
    //토큰을 deconde 한다
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema) //Schema를 Model로 감싸줌

module.exports = { User }