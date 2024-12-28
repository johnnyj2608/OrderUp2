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
        const dateInput = req.query.date || new Date().toLocaleDateString('en-CA');

        const dateArray = dateInput.split("-");
        const year = dateArray[0];
        const month = dateArray[1];
        const day = dateArray[2];
        const selectedDate = new Date(year, parseInt(month, 10)-1, day);

        const selectedWeekday = new Date(selectedDate).getDay();

        const client = await connectToDb();

        const breakfastMenu = await getMenuItems(client, selectedWeekday, 'B');
        const lunchMenu = await getMenuItems(client, selectedWeekday, 'L');
        
        const orders = await getOrdersByDate(client, selectedDate);

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

        const formattedDate = req.__('titles.date_title', req.__('titles.'+dayOfWeekColumns[selectedWeekday]))+ `, ${month}/${day}/${year}`;

        res.render('orders', { 
            breakfastMenu, 
            lunchMenu,
            formattedDate,
            dateInput,
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
        WHERE type = $1 AND ${selectedDayColumn} = TRUE
        ORDER BY id ASC;
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
        WHERE o.date = $1
        ORDER BY o.id ASC;
    `;
    const result = await client.query(query, [targetDate]);
    return result.rows; 
}

module.exports = router;