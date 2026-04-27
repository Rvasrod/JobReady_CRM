const express = require('express');
const pool = require('../db/connection');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM companies WHERE userId = ?',
      [userId]
    );

    const [bySector] = await pool.execute(
      `SELECT COALESCE(NULLIF(sector, ''), 'Sin sector') AS sector, COUNT(*) AS count
       FROM companies WHERE userId = ?
       GROUP BY COALESCE(NULLIF(sector, ''), 'Sin sector')
       ORDER BY count DESC`,
      [userId]
    );

    const [byRating] = await pool.execute(
      `SELECT COALESCE(rating, 0) AS rating, COUNT(*) AS count
       FROM companies WHERE userId = ?
       GROUP BY COALESCE(rating, 0)
       ORDER BY rating DESC`,
      [userId]
    );

    const [[{ avg_rating }]] = await pool.execute(
      `SELECT ROUND(AVG(NULLIF(rating, 0)), 2) AS avg_rating
       FROM companies WHERE userId = ?`,
      [userId]
    );

    const [recent] = await pool.execute(
      `SELECT id, name, sector, rating, createdAt
       FROM companies WHERE userId = ?
       ORDER BY createdAt DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        total,
        avgRating: avg_rating ?? 0,
        bySector,
        byRating,
        recent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
