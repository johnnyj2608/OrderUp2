const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');
const { getWeekRange } = require('../utils/utils');

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
            const memberQuery = 'SELECT units, max FROM members WHERE id = $1';
            const memberResult = await client.query(memberQuery, [memberID]);
            const units = memberResult.rows[0].units;
            const max = memberResult.rows[0].max;

            const dailyCountQuery = `
                SELECT 
                    COUNT(CASE WHEN breakfast IS NOT NULL THEN 1 END) AS breakfast_count,
                    COUNT(CASE WHEN lunch IS NOT NULL THEN 1 END) AS lunch_count
                FROM orders
                WHERE member_id = $1 AND date = $2
            `;
            const dailyCountResult = await client.query(dailyCountQuery, [memberID, selectedDate]);
            const dailyBreakfastCount = dailyCountResult.rows[0].breakfast_count || 0;
            const dailyLunchCount = dailyCountResult.rows[0].lunch_count || 0;

            if (dailyBreakfastCount >= max || dailyLunchCount >= max) {
                throw new Error('Cannot insert: Breakfast or lunch count already at limit for the day.');
            }

            const { startDate, endDate } = getWeekRange(selectedDate);
            const weeklyCountQuery = `
                SELECT 
                    COUNT(CASE WHEN breakfast IS NOT NULL THEN 1 END) AS breakfast_count,
                    COUNT(CASE WHEN lunch IS NOT NULL THEN 1 END) AS lunch_count
                FROM orders
                WHERE member_id = $1 AND date BETWEEN $2 AND $3
            `;
            const weeklyCountResult = await client.query(weeklyCountQuery, [memberID, startDate, endDate]);
            const weeklyBreakfastCount = weeklyCountResult.rows[0].breakfast_count || 0;
            const weeklyLunchCount = weeklyCountResult.rows[0].lunch_count || 0;

            if (weeklyBreakfastCount >= units || weeklyLunchCount >= units) {
                throw new Error('Cannot insert: Breakfast or lunch count already at weekly limit.');
            }

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