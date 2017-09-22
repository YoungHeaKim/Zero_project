const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

const query = require('./query')

const app = express()

app.use(bodyParser.json())

const jwtMiddleware = expressJwt({secret: 'mysecret'})

// 토큰을 가진 사용자만 접속가능
app.get('/user', jwtMiddleware, (req, res) => {
  // 서명할때 넣었던 id가 들어온다.
  query.getUserById(req.user.id)
    .then(user => {
      res.send({
        username: user.username
      })
    })
})

// 토큰이 틀릴 경우 에러 핸들링
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: err.name,
      message: err.message
    });
  }
});

app.post('/user', (req, res) => {
  // 사용자 생성
  const {username, password} = req.body
  /*
  위의 코드는 밑의 두 코드를 디스트럭쳐링 한것이다.
  const username = req.body.username
  const password = req.body.password
  */
  query.createUser(username, password)
    .then(([id]) => {
      // JWT 발행
      const token = jwt.sign({id}, 'mysecret')
      // 반환
      res.send({
        token
      })
    })
})

app.post('/login', (req, res) => {
  const {username, password} = req.body
  query.compareUser(username, password)
    .then((user) => {
      const token = jwt.sign({id: user.id}, 'mysecret')
      res.send({
        token
      })
    })
})

app.listen(3000, () => {
  console.log(`listening...`)
})
