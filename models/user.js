const db = require('../utils/db');

class User {
    email;
    password;

    validateAndSave(next) {
        db.tx(async client => {
            const text = 'SELECT * FROM users WHERE email = $1';
            const values = [this.email];
            const { rows } = await client.query(text, values);
            if (rows.length) {
                return next(null, {
                    status: 'danger',
                    message: 'Account with that email address already exists.'
                });
            }

            const text2 = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';
            const values2 = [this.email, this.password];
            const result2 = await client.query(text2, values2);
            if (result2.rows.length) {
                return next(null, {
                    status: 'success',
                    message: 'Account succesfully created.'
                });
            }
        }, next);
    }

    save(next) {
        const text = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';
        const values = [this.email, this.password];
        db.query(text, values, next);
    }

    static findOne(email, next) {
        const text = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        db.query(text, values, next);
    }
}

module.exports.User = User;