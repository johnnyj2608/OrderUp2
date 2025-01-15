const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');

router.post("/submit", async (req, res) => {
    const { 
        memberID,
        dateInput,
        breakfastID,
        breakfastName,
        lunchID,
        lunchName,
    } = req.body;

    const dateArray = dateInput.split("-");
    const year = dateArray[0];
    const month = dateArray[1];
    const day = dateArray[2];
    const selectedDate = new Date(year, parseInt(month, 10)-1, day);
    
    const timestamp = new Date().toLocaleString();

    try {
        const client = await connectToDb();

        const existingOrderQuery = `
            SELECT id, breakfast, lunch
            FROM orders
            WHERE member_id = $1 AND date = $2
        `;
        const result = await client.query(existingOrderQuery, [memberID, selectedDate]);
        const existingOrder = result.rows[0];

        if (existingOrder) {
            const updateOrderQuery = `
                UPDATE orders
                SET 
                    breakfast = COALESCE($1, breakfast),
                    lunch = COALESCE($2, lunch),
                    timestamp = $3
                WHERE id = $4
            `;
            await client.query(updateOrderQuery, [
                breakfastName,
                lunchName,
                timestamp,
                existingOrder.id,
            ]);
        } else {
            const orderInsertQuery = `
                INSERT INTO orders (member_id, date, breakfast, lunch, timestamp)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(orderInsertQuery, [
                memberID,
                selectedDate,
                breakfastName,
                lunchName,
                timestamp,
            ]);
        }
        const incrementCountQuery = `
            UPDATE menu
            SET count = count + 1
            WHERE id = $1
        `;
        if (breakfastID) {
            await client.query(incrementCountQuery, [breakfastID]);
        }
        if (lunchID) {
            await client.query(incrementCountQuery, [lunchID]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

module.exports = router;