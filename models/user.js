class User {
    email;
    password;

    static findOne(email, next) {
        const result = [new User(), new User()];
        // const err = new Error('hahahaha');
        const err = null;
        // const result = null;
        next(err, result);
    }
}

module.exports.User = User;