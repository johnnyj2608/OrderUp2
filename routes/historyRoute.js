const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/history', async (req, res) => {
    try {
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        const convertedDate = new Date(selectedDate + 'T00:00:00');

        const client = await connectToDb();

        const query = `
            SELECT o.id, m.name AS member_name, o.date, o.breakfast, o.lunch, o.timestamp
            FROM orders o
            LEFT JOIN members m ON o.member_id = m.id
            WHERE o.date = $1
            ORDER BY o.timestamp ASC
        `;
        const result = await client.query(query, [convertedDate]);
        const rawOrderList = result.rows;

        const orderList = rawOrderList.map(order => {
            // Format date as MM/DD/YY
            const formattedDates = new Intl.DateTimeFormat('en-US', { 
                year: '2-digit', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(new Date(order.date));

            // Format timestamp as MM/DD/YY HH:MM
            const formattedTimestamps = new Intl.DateTimeFormat('en-US', { 
                year: '2-digit', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true,
            }).format(new Date(order.timestamp));

            return {
                ...order,
                date: formattedDates,
                timestamp: formattedTimestamps,
            };
        });

        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(convertedDate);
        const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format(convertedDate);
        const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(convertedDate);
        const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(convertedDate);

        const formattedDate = `${weekday}, ${month}/${day}/${year}`;

        res.render("history", { 
            orderList, 
            formattedDate,
            selectedDate,
        });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});


router.post('/history/update', async (req, res) => {
    try {
        const client = await connectToDb();
        await client.query('BEGIN');

        const orders = req.body.orders;
        for (let order of orders) {
            const { id } = order;

            const deleteQuery = 'DELETE FROM orders WHERE id = $1';
            await client.query(deleteQuery, [id]);
        }

        await client.query('COMMIT');
        res.status(200).send("History updated successfully.");
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating history:', error);
        res.status(500).send("Error saving data.");
    }
});

module.exports = router;