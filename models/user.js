const { query } = require('../utils/db');

class User {
    email;
    password;

    save(next) {
        const text = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';
        const values = [this.email, this.password];

        query(text, values, next);
    }

    static findOne(email, next) {
        const text = 'SELECT * FROM users WHERE email = $1';
        const values = [email];

        query(text, values, next);
    }
}

module.exports.User = User;