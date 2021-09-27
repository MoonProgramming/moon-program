const { Pool } = require('pg');

// Postgres Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Whenever the pool establishes a new client connection
 */
pool.on('connect', client => {
    // client.query('SET DATESTYLE = iso, mdy');
    console.log('DB pool establishes a new client connection');
});

/**
 * Whenever a client is checked out from the pool
 */
pool.on('acquire', client => {
    console.log('a client is checked out from the pool');
});

/**
* Whenever DB error occur
*/
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err.stack);
});

/**
* Whenever a client is closed & removed from the pool
*/
pool.on('remove', (client) => {
    console.log('a client is closed & removed from the pool');
});

module.exports = {
    query: function (text, values, next) {

        pool.connect((err, client, release) => {
            if (err) {
                console.error('Error acquiring client', err.stack);
                return next(err);
            }
            client.query(text, values, (err, result) => {
                release();
                if (err) {
                    console.error('Error executing query', err.stack);
                    return next(err);
                }
                next(err, result.rows);
            })
        });
    }
}