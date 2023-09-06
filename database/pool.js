import mysql from 'mysql2';
import fetch from 'node-fetch';
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: "us-cdbr-east-06.cleardb.net",
    user: process.env.SQL_User,
    password: process.env.SQL_password,
    database: process.env.SQL_database,
    waitForConnections: true,
    connectionLimit: 10,
}).promise();
const sportUrls = {
    nba: 'https://chumley.barstoolsports.com/dev/data/games/6c974274-4bfc-4af8-a9c4-8b926637ba74.json',
    mlb: 'https://chumley.barstoolsports.com/dev/data/games/eed38457-db28-4658-ae4f-4d4d38e9e212.json',

};
export async function fetchAndStoreData(sport) {
    try {
        const apiUrl = sportUrls[sport];
        if (!apiUrl) {
            console.error(`No URL defined for sport: ${sport}`);
            return;
        }

        const response = await fetch(apiUrl);
        const newGameData = await response.json();

        // Retrieve existing cached data from the database
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT game_data FROM cached_data WHERE sport = ?', [sport]);
        const existingGameData = rows.length > 0 ? JSON.parse(rows[0].game_data) : null;

        // Compare newGameData with existingGameData
        if (!existingGameData || JSON.stringify(newGameData) !== JSON.stringify(existingGameData)) {
            const query = `
                INSERT INTO cached_data (sport, last_updated, game_data)
                VALUES (?, NOW(), ?)
                ON DUPLICATE KEY UPDATE
                    last_updated = IF(game_data <> ?, NOW(), last_updated),
                    game_data = IF(game_data <> ?, ?, game_data)
            `;

            await connection.query(query, [sport, JSON.stringify(newGameData), JSON.stringify(newGameData), JSON.stringify(newGameData), JSON.stringify(newGameData)]);
            console.log(`Data for ${sport} stored in MySQL`);
        } else {
            console.log(`Data for ${sport} is already up to date`);
        }

        connection.release();
    } catch (error) {
        console.error(`Error fetching and storing ${sport} data:`, error);
    }
}

export async function checkAndCacheData(req, res, next) {
    const sport = req.params.sport;

    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT last_updated FROM cached_data WHERE sport = ?', [sport]);

    if (rows.length === 0 || (Date.now() - new Date(rows[0].last_updated).getTime()) > 15000) {
        await fetchAndStoreData(sport);
    }

    connection.release();
    next();
}

export default pool;
