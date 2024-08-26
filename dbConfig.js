// dbConfig.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'coderoom',
    password: 'SyedSaad1114',
    port: 5432,
});

module.exports = pool;
