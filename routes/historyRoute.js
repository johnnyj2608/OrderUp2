const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');
const { 
    dayOfWeekColumns, 
    getStatusIcon,
    formatDate,
    formatTimestamp,
    getWeekNumber,
} = require('../utils/utils');


router.get('/history', async (req, res) => {
    try {
        const client = await connectToDb();
        let rawOrderList = [];
        let formattedTitle = '';
        let dateInput = new Date().toLocaleDateString('en-CA');

        if (req.query.member) {
            const member = req.query.member.trim();

            const query = `
                SELECT o.id, m.index AS table, m.name AS member_name, o.date, o.breakfast, o.b_received, o.lunch, o.l_received
                FROM orders o
                LEFT JOIN members m ON o.member_id = m.id
                WHERE LOWER(m.name) LIKE LOWER($1)
                ORDER BY m.index ASC, o.date ASC
            `;
            const result = await client.query(query, [`%${member}%`]);
            rawOrderList = result.rows;

            const totalOrders = rawOrderList.length;

            formattedTitle = `Search Results for Member: ${member} (${totalOrders})`
        } else {
            if (req.query.date) {
                dateInput = req.query.date
            }

            const separator = dateInput.includes('-') ? '-' : '/';
            const dateArray = dateInput.split(separator);
            
            let year, month, day;
            if (separator === '-') {
                year = dateArray[0];
                month = dateArray[1];
                day = dateArray[2];
            } else {
                month = dateArray[0];
                day = dateArray[1];
                year = `20${dateArray[2]}`;
            }

            dateInput = year+'-'+month+'-'+day;

            const selectedDate = new Date(year, parseInt(month, 10)-1, day);

            const query = `
                SELECT o.id, m.index AS table, m.name AS member_name, o.date, o.breakfast, o.b_received, o.lunch, o.l_received
                FROM orders o
                LEFT JOIN members m ON o.member_id = m.id
                WHERE o.date = $1
                ORDER BY m.index ASC, o.date ASC
            `;
            const result = await client.query(query, [selectedDate]);
            rawOrderList = result.rows;

            const selectedWeekday = new Date(selectedDate).getDay();
            const totalOrders = rawOrderList.length;

            formattedTitle = 
                req.__('titles.date_title', 
                req.__('titles.' + dayOfWeekColumns[selectedWeekday])
                ) + 
                `, ${month}/${day}/${year} (${totalOrders})`;
        }

        const orderList = rawOrderList.map(order => {
            let weekClass = '';
            if (req.query.member) {
                const weekMod = (getWeekNumber(order.date) % 4) + 1;
                weekClass = `week-${weekMod}`;
            }

            return {
                ...order,
                date: formatDate(order.date),
                timestamp: formatTimestamp(order.timestamp),
                weekClass,
            };
        });

        res.render("history", { 
            orderList, 
            formattedTitle,
            dateInput,
            getStatusIcon,
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
            const { id, breakfast, lunch, b_received, l_received, delete: isDelete, } = order;

            if (isDelete) {
                const deleteQuery = 'DELETE FROM orders WHERE id = $1';
                await client.query(deleteQuery, [id]);

                if (breakfast) {
                    const updateBreakfastQuery = `
                        UPDATE menu SET count = count - 1 
                        WHERE name = $1 AND count > 0
                    `;
                    await client.query(updateBreakfastQuery, [breakfast]);
                }

                if (lunch) {
                    const updateLunchQuery = `
                        UPDATE menu SET count = count - 1 
                        WHERE name = $1 AND count > 0
                    `;
                    await client.query(updateLunchQuery, [lunch]);
                }
            } else {
                const updateQuery = `
                    UPDATE orders
                    SET 
                        breakfast = $2,
                        lunch = $3,
                        b_received = $4,
                        l_received = $5
                    WHERE id = $1
                `;
                await client.query(updateQuery, [id, breakfast, lunch, b_received, l_received]);
            }
        }

        await client.query('COMMIT');
        res.status(200).send("History updated successfully.");
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating history:', error);
        res.status(500).send("Error saving data.");
    }
});

router.get('/menuData', async (req, res) => {
    const { weekday } = req.query;

    try {
        const client = await connectToDb();

        const query = `
            SELECT name, type
            FROM menu
            WHERE ${weekday} = true
            ORDER BY type ASC, name ASC;
        `;
        const result = await client.query(query);

        const menuItems = result.rows.reduce((acc, item) => {
            if (item.type === 'B') {
                acc.breakfastItems.push(item.name);
            } else if (item.type === 'L') {
                acc.lunchItems.push(item.name);
            }
            return acc;
        }, { breakfastItems: [], lunchItems: [] });
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu data:', error);
        res.status(500).send("Error loading menu data");
    }
});

module.exports = router;