const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const query = require('./query')

const app = express()

app.use(bodyParser.json())

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
