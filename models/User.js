const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema) //Schema를 Model로 감싸줌

module.exports = { User }