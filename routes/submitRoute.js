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

        const findBreakfastQuery = `
            SELECT id FROM orders
            WHERE member_id = $1 AND date = $2 AND breakfast IS NULL
            ORDER BY id ASC
            LIMIT 1
        `;
        const breakfastResult = await client.query(findBreakfastQuery, [memberID, selectedDate]);
        const breakfastOrder = breakfastResult.rows[0];

        const findLunchQuery = `
            SELECT id FROM orders
            WHERE member_id = $1 AND date = $2 AND lunch IS NULL
            ORDER BY id ASC
            LIMIT 1
        `;
        const lunchResult = await client.query(findLunchQuery, [memberID, selectedDate]);
        const lunchOrder = lunchResult.rows[0];

        if (breakfastName && !lunchName && breakfastOrder) {
            const updateBreakfastQuery = `
                UPDATE orders
                SET breakfast = $1, timestamp = $2
                WHERE id = $3
            `;
            await client.query(updateBreakfastQuery, [breakfastName, timestamp, breakfastOrder.id]);
        } else if (!breakfastName && lunchName && lunchOrder) {
            const updateLunchQuery = `
                UPDATE orders
                SET lunch = $1, timestamp = $2
                WHERE id = $3
            `;
            await client.query(updateLunchQuery, [lunchName, timestamp, lunchOrder.id]);
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