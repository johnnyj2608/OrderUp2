const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

const dayOfWeekColumns = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
];

router.get('/history', async (req, res) => {
    try {
        const dateInput = req.query.date || new Date().toLocaleDateString('en-CA');

        const dateArray = dateInput.split("-");
        const year = dateArray[0];
        const month = dateArray[1];
        const day = dateArray[2];
        const selectedDate = new Date(year, parseInt(month, 10)-1, day);

        const selectedWeekday = new Date(selectedDate).getDay();

        const client = await connectToDb();

        const query = `
            SELECT o.id, m.name AS member_name, o.date, o.breakfast, o.b_received, o.lunch, o.l_received, o.timestamp
            FROM orders o
            LEFT JOIN members m ON o.member_id = m.id
            WHERE o.date = $1
            ORDER BY o.id ASC
        `;
        const result = await client.query(query, [selectedDate]);
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

        const formattedDate = req.__('titles.date_title', req.__('titles.'+dayOfWeekColumns[selectedWeekday]))+ `, ${month}/${day}/${year}`;

        res.render("history", { 
            orderList, 
            formattedDate,
            dateInput,
        });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});


router.post('/history', async (req, res) => {
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