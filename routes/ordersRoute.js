const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/orders', async (req, res) => {
    try {
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        const convertedDate = new Date(selectedDate + 'T00:00:00');
        const selectedWeekday = new Date(convertedDate).getDay();

        const client = await connectToDb();

        const breakfastRow = await getMenuItems(client, selectedWeekday, 'Breakfast');
        const lunchRow = await getMenuItems(client, selectedWeekday, 'Lunch');

        const breakfastMenu = mapMenuItems(breakfastRow);
        const lunchMenu = mapMenuItems(lunchRow);


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
async function getMenuItems(client, targetDate, menuType) {
    const query = `
        SELECT item_1, item_2, item_3, image_1, image_2, image_3
        FROM menu
        WHERE day_of_week = $1 AND menu_type = $2;
    `;
    const result = await client.query(query, [targetDate, menuType]);
    return result.rows[0];
}

// Helper function to map the rows into a structured menu format
function mapMenuItems(menuRow) {
    const menuItems = {};
    for (let i = 1; i <= 3; i++) {
        const itemKey = menuRow[`item_${i}`];
        if (itemKey) {
            menuItems[itemKey] = {
                image: menuRow[`image_${i}`],
                names: [],
                amt: 0,
            };
        }
    }
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