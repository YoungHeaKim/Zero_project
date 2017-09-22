const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

app.post('/user', (req, res) => {
  // 사용자 생성
  // JWT 발행
  // 반환
  res.send({
    token: jwtToken
  })
})

app.post('/login', (req, res) => {

})
