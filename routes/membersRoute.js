const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/members', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = 'SELECT * FROM members';
        const result = await client.query(query);
        const memberList = result.rows;

        res.render('members', { memberList });
    } catch (error) {
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;