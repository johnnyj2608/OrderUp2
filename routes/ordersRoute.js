const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/orders', async (req, res) => {
    try {
        const today = new Date();
        const currentWeekday = today.getDay();

        let selectedDay = req.query.day || 0;
        let dayOfWeek = Number(selectedDay);

        let nextTargetDate = new Date(today);
        if (dayOfWeek === 0) {
            dayOfWeek = currentWeekday;
        } else {
            let daysToAdd = dayOfWeek - currentWeekday;
            if (daysToAdd <= 0) {
                daysToAdd += 7;
            }
            nextTargetDate.setDate(today.getDate() + daysToAdd);
        }
        const formattedDate = nextTargetDate.toISOString().split('T')[0];

        const client = await connectToDb();

        const breakfastRow = await getMenuItems(client, dayOfWeek, 'Breakfast');
        const lunchRow = await getMenuItems(client, dayOfWeek, 'Lunch');

        const breakfastMenu = mapMenuItems(breakfastRow);
        const lunchMenu = mapMenuItems(lunchRow);

        const orders = await getOrdersByDate(client, formattedDate);

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

        res.render("orders", { 
            breakfastMenu, 
            lunchMenu,
        });
    } catch (error) {
        res.status(500).send("Error loading sheet data");
    }
});

// Helper function to fetch menu items for a given day and menu type
async function getMenuItems(client, selectedDay, menuType) {
    const query = `
        SELECT item_1, item_2, item_3, image_1, image_2, image_3
        FROM menu
        WHERE day_of_week = $1 AND menu_type = $2;
    `;
    const result = await client.query(query, [selectedDay, menuType]);
    return result.rows[0]; // Only ever one row per menu type
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

// Helper function to fetch orders with member names for a given date
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