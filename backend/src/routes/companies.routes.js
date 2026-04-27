const express = require('express');
const { body } = require('express-validator');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');
const validateMiddleware = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT * FROM companies WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT * FROM companies WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    res.json({ company: companies[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

router.post('/',
  body('name').notEmpty().trim(),
  body('sector').optional().trim(),
  body('website').optional().isURL(),
  validateMiddleware,
  authMiddleware,
  async (req, res) => {
    try {
      const { name, sector, website, notes, rating } = req.body;
      const [result] = await pool.query(
        'INSERT INTO companies (userId, name, sector, website, notes, rating) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, name, sector || null, website || null, notes || null, rating || 0]
      );
      const [companies] = await pool.query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
      res.status(201).json({ message: 'Empresa creada', company: companies[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
);

router.put('/:id',
  body('name').optional().trim(),
  body('sector').optional().trim(),
  body('website').optional().isURL(),
  validateMiddleware,
  authMiddleware,
  async (req, res) => {
    try {
      const { name, sector, website, notes, rating } = req.body;
      const [existing] = await pool.query(
        'SELECT id FROM companies WHERE id = ? AND userId = ?',
        [req.params.id, req.user.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Empresa no encontrada' });
      }
      await pool.query(
        'UPDATE companies SET name = COALESCE(?, name), sector = COALESCE(?, sector), website = COALESCE(?, website), notes = COALESCE(?, notes), rating = COALESCE(?, rating) WHERE id = ?',
        [name, sector, website, notes, rating, req.params.id]
      );
      const [companies] = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
      res.json({ message: 'Empresa actualizada', company: companies[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
);

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM companies WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    await pool.query('DELETE FROM companies WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Empresa eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;