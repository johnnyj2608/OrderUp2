const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/history', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = `
            SELECT o.id, m.name AS member_name, o.date, o.breakfast, o.lunch, o.timestamp
            FROM orders o
            INNER JOIN members m ON o.member_id = m.id
        `;
        const result = await client.query(query);
        const rawOrderList = result.rows;

        const orderList = rawOrderList.map(order => {
            // Format date as MM/DD/YY
            const formattedDate = new Intl.DateTimeFormat('en-US', { 
                year: '2-digit', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(new Date(order.date));

            // Format timestamp as MM/DD/YY HH:MM
            const formattedTimestamp = new Intl.DateTimeFormat('en-US', { 
                year: '2-digit', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            }).format(new Date(order.timestamp));

            return {
                ...order,
                date: formattedDate,
                timestamp: formattedTimestamp,
            };
        });

        res.render('history', { orderList });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});

module.exports = router;