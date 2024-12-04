const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/menu', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = 'SELECT * FROM menu';
        const result = await client.query(query);
        const menuList = result.rows;

        res.render('menu', { menuList });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});

module.exports = router;