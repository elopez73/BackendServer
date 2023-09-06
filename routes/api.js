
import express from 'express';
import pool, { checkAndCacheData }  from '../database/pool.js';

const router = express.Router();


router.get('/feed/:sport', checkAndCacheData, async (req, res) => {
    const sport = req.params.sport;

    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT game_data FROM cached_data WHERE sport = ?', [sport]);

    connection.release();

    if (rows.length > 0) {
        res.json({ gameData: JSON.parse(rows[0].game_data) });
    } else {
        res.status(404).json({ error: 'No cached data found for the specified sport.' });
    }
});
export default router;
