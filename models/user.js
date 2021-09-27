const db = require('../utils/db');

class User {
    email;
    password;

    save(next) {
        // try {
        //     const client = await db().connect();
        //     const result = await client.query('SELECT * FROM test_table');
        //     const results = { 'results': (result) ? result.rows : null };
        //     res.send(JSON.stringify(results));
        //     client.release();
        // } catch (err) {
        //     console.error(err);
        //     res.send("Error " + err);
        // }
    }

    // app.get('/db', async (req, res) => {
    //     try {
    //         const client = await pool.connect();
    //         const result = await client.query('SELECT * FROM test_table');
    //         const results = { 'results': (result) ? result.rows : null };
    //         res.send(JSON.stringify(results));
    //         client.release();
    //     } catch (err) {
    //         console.error(err);
    //         res.send("Error " + err);
    //     }
    // });

    static async findOne(email, next) {
        let err = null;
        try {
            const client = await db().connect();
            const result = await client.query('SELECT * FROM users WHERE email = \''+ email+'\'');
            // const results = { 'results': (result) ? result.rows : null };
            // const results = [new User(), new User()];
            // res.send(JSON.stringify(results));
            next(err, result.rows);
            client.release();
        } catch (err) {
            console.error(err);
            next(err);
        }

        // const err = new Error('hahahaha');
        // const err = null;
        // const result = null;
        // next(err, result);
    }
}

module.exports.User = User;