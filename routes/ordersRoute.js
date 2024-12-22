const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

const dayOfWeekColumns = [
    'today',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
];

router.get('/orders', async (req, res) => {
    try {
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        const convertedDate = new Date(selectedDate + 'T00:00:00');
        const selectedWeekday = new Date(convertedDate).getDay();

        const client = await connectToDb();

        const breakfastMenu = await getMenuItems(client, selectedWeekday, 'B');
        const lunchMenu = await getMenuItems(client, selectedWeekday, 'L');
        
        const orders = await getOrdersByDate(client, convertedDate);

        orders.forEach(order => {
            const breakfastItem = breakfastMenu[order.breakfast];
            if (breakfastItem) {
                breakfastItem.names.push(order.name);
                breakfastItem.amt += 1;
            }
            const lunchItem = lunchMenu[order.lunch];
            if (lunchItem) {
                lunchItem.names.push(order.name);
                lunchItem.amt += 1;
            }
        });

        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(convertedDate);
        const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format(convertedDate);
        const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(convertedDate);
        const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(convertedDate);

        const formattedDate = `${weekday}, ${month}/${day}/${year}`;

        res.render('orders', { 
            breakfastMenu, 
            lunchMenu,
            formattedDate,
            selectedDate
        });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});

// Helper function to fetch menu items for a given day and menu type
async function getMenuItems(client, selectedDay, menuType) {
    if (selectedDay === 0) {
        return []
    }
    const selectedDayColumn = dayOfWeekColumns[selectedDay];
    const query = `
        SELECT name, image
        FROM menu
        WHERE type = $1 AND ${selectedDayColumn} = TRUE; 
    `;
    const result = await client.query(query, [menuType]);
    const menuItems = result.rows.reduce((acc, item) => {
        acc[item.name] = {
            ...item,
            amt: 0,
            names: []
        };
        return acc;
    }, {});
    return menuItems;
}

async function getOrdersByDate(client, targetDate) {
    const query = `
        SELECT o.id, o.breakfast, o.lunch, m.name AS name
        FROM orders o
        INNER JOIN members m
        ON o.member_id = m.id
        WHERE o.date = $1;
    `;
    const result = await client.query(query, [targetDate]);
    return result.rows; 
}

module.exports = router;