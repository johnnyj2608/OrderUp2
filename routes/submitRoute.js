const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.post("/submit", async (req, res) => {
    const { 
        memberID,
        formattedDate,
        breakfastName, 
        lunchName,
    } = req.body;

    const timestamp = new Date();

    try {
        const client = await connectToDb();

        const orderInsertQuery = `
            INSERT INTO orders (member_id, date, breakfast, lunch, timestamp)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(orderInsertQuery, [
            memberID,
            formattedDate,
            breakfastName,
            lunchName,
            timestamp
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

module.exports = router;