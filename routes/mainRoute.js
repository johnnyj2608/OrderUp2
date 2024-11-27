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

router.get("/", async (req, res) => {
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

        const members = await getMembersForDay(client, dayOfWeek, formattedDate);
        const names = members.map(member => ({
            id: member.id,
            name: member.name,
            menu: member.menu,
        }));

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
        });
    } catch (error) {
        console.error("Error loading data: ", error);
        res.status(500).send("Error loading database data");
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
    const menuItems = [];
    for (let i = 1; i <= 3; i++) {
        const itemKey = `item_${i}`;
        const imageKey = `image_${i}`;
        menuItems.push({
            title: menuRow[itemKey],
            image: menuRow[imageKey],
        });
    }
    return menuItems;
}

// Helper function to get members for a specific day
async function getMembersForDay(client, selectedDay, targetDate) {
    const selectedDayColumn = dayOfWeekColumns[selectedDay];
    const query = `
        SELECT m.id, m.name, 
            CASE 
                WHEN o.breakfast IS NOT NULL AND o.lunch IS NOT NULL THEN 'X'
                WHEN o.breakfast IS NOT NULL THEN 'L'
                WHEN o.lunch IS NOT NULL THEN 'B'
                ELSE 'A'
            END AS menu
        FROM members m
        LEFT JOIN orders o
        ON m.id = o.member_id AND o.date = $1
        WHERE ${selectedDayColumn} = TRUE;
    `;
    const result = await client.query(query, [targetDate]);
    return result.rows.filter(member => member.menu !== 'X');
}

module.exports = router;
