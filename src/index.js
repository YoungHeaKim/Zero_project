const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const cors = require('cors')

const query = require('./query')

const app = express()

app.use(bodyParser.json())
app.use(cors())

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

// collection API 해당 사용자가 가지고있는 모든 todo를 가지고오는 API
app.get('/todos', jwtMiddleware, (req, res) => {
  // jwt 미들웨어는 토큰에 들어있는 값을 req.user에 넣어준다.
  // 스네이크 케이스를 쓰는 이유는 데이터베이스와의 깔끔한 연동을 위하여 사용
  const user_id = req.user.id
  // userId가 소유하고 있는 할 일 목록을 불러와서 반환
  query.getTodosByUserId(user_id)
    .then(todos => {
      res.send(todos)
    })
})

// 해당 사용자가 todo를 생성하는 API 생성
app.post('/todos', jwtMiddleware, (req, res) => {
  const user_id = req.user.id
  const title = req.body.title
  query.createTodo(user_id, title)
    .then(([id]) => {
      return query.getTodoById(id)
    })
    .then(todo => {
      // 201은 잘 만들어 졌다라는 상태 코드이다.
      res.status(201)
      res.send(todo)
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
})

class NotFoundError extends Error {}
class ForbiddenError extends Error {}

// 글 수정하기(체크박스 체크되는지 안되는지 만든 것)
app.patch('/todos/:id', jwtMiddleware, (req, res) => {
  const id = req.params.id
  const title = req.body.title
  const complete = req.body.complete
  const user_id = req.user.id
  query.getTodoById(id)
    .then(todo => {
      if(!todo) {
        // 404 에러 코드
        throw new NotFoundError('경로를 찾을 수 없습니다.')
      } else if(todo.user_id !== user_id) {
        // 지울수 있는 권한이 없다.(403 에러 코드)
        throw new ForbiddenError('허가되지 않은 접근입니다.')
        } else {
          return
      }
    })
    .then(() => {
      query.updateTodoById(id, {title, complete})
        .then(id => {
          return query.getTodoById(id)
        })
        .then(todo => {
          res.send(todo)
        })
  })
  .catch(err => {
    if (err instanceof NotFoundError) {
      res.status(404),
      res.send({
        message:err.message
      })
    } else if (err instanceof ForbiddenError) {
      res.status(403)
      res.send({
        message:err.message
      })
    }
  })
})

// 글 삭제하기 (404가 뜨면 요청페이지 확인하기)
app.delete('/todos/:id', jwtMiddleware, (req, res) => {
  const id = req.params.id
  query.deleateTodoById(id)
    .then(() => {
      res.end()
    })
})

app.listen(3000, () => {
  console.log(`listening...`)
})
