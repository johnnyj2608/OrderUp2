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

// Helper function to get members for a specific day
async function getMembersForDay(client, selectedDay) {
    const selectedDayColumn = dayOfWeekColumns[selectedDay];
    const query = `
        SELECT id, name
        FROM members
        WHERE ${selectedDayColumn} = TRUE;
    `;
    const result = await client.query(query);
    console.log(result)
    return result.rows || [];
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

router.get("/", async (req, res) => {
    try {
        let selectedDay = req.query.day || 0;
        let dayOfWeek = Number(selectedDay);
        if (dayOfWeek === 0) {
            dayOfWeek = new Date().getDay();
        }

        const client = await connectToDb();

        const breakfastRow = await getMenuItems(client, dayOfWeek, 'Breakfast');
        const lunchRow = await getMenuItems(client, dayOfWeek, 'Lunch');

        const breakfastMenu = mapMenuItems(breakfastRow);
        const lunchMenu = mapMenuItems(lunchRow);

        const members = await getMembersForDay(client, dayOfWeek);
        const names = members.map(member => ({
            id: member.id,
            name: member.name,
            menu: 'A', // Placeholder, need to update
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

module.exports = router;
