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
   * 토큰을 가진 사용자만 접속가능
   * @param {String} id
   */
  getUserById(id) {
   return knex('user')
    .where({id})
    .first()
  }
}
