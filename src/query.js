const knex = require('./knex')
const bcrypt = require('bcrypt')

module.exports = {
  /**
   * 사용자 레코드를 생성합니다.
   * @param {String} username - 사용자 이름
   * @param {String} password - 해시 적용 전 암호
   * @return {Promise}
   */
  createUser(username, password) {
    return knex('user')
      .insert({
        username,
        hashed_password: bcrypt.hashSync(password, 10)
      })
  },

  /**
   * 사용자 정보와 일치하는 사용자가 있는지의 여부를 반환합니다.
   * @param {String} username - 사용자 이름
   * @param {String} password - 해시 적용 전 암호
   * @returns {Promise} - user
   */
  compareUser(username, password) {
    return knex('user')
      .where({username})
      .first()
      .then(user => {
        if(user) {
          const isMatch = bcrypt.compareSync(password, user.hashed_password)
          if(isMatch) {
            return user
          }
        }
        throw new Error('아이디와 비밀번호가 일치하지 않습니다.')
      })
  },

  /**
   * id로 유저데이터를 가지고옴
   * @param {String} id
   */
  getUserById(id) {
   return knex('user')
    .where({id})
    .first()
  },

  /**
   * 할일의 데이터를 불러옴
   * @param {String} user_id
   * REPL
   */
  getTodosByUserId(user_id) {
    return knex('todo')
      .where({user_id})
  },
  createTodo(user_id, title) {
    return knex('todo')
      .insert({
        user_id,
        title
      })
  },
  getTodoById(id) {
    return knex('todo')
      .where({id})
      .first()
  },
  /**
   *
   * @param {String} id
   * @param {String} param1
   */
  updateTodoById(id, {title, complete}) {
    return knex('todo')
      .where({id})
      .update({title, complete})
  },
  deleateTodoById(id) {
    return knex('todo')
      .where({id})
      .delete()
  }
}
