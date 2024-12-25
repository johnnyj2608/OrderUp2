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

router.get("/", async (req, res) => {
    try {
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        const convertedDate = new Date(selectedDate + 'T00:00:00');
        const selectedWeekday = new Date(convertedDate).getDay();

        const client = await connectToDb();

        const breakfastMenu = await getMenuItems(client, selectedWeekday, 'B');
        const lunchMenu = await getMenuItems(client, selectedWeekday, 'L');

        const members = await getMembersForDay(client, selectedWeekday, convertedDate);
        const names = members.map(member => ({
            id: member.id,
            name: member.name,
            menu: member.menu,
        }));

        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(convertedDate);
        const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format(convertedDate);
        const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(convertedDate);
        const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(convertedDate);

        const formattedDate = `${weekday}, ${month}/${day}/${year}`;

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
            formattedDate,
            selectedDate
        });
    } catch (error) {
        console.error("Error loading data: ", error);
        res.status(500).send("Error loading database data");
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
    return result.rows;
}

// Helper function to get members for a specific day
async function getMembersForDay(client, selectedDay, targetDate) {
    if (selectedDay === 0) {
        return []
    }
    const selectedDayColumn = dayOfWeekColumns[selectedDay];
    const query = `
        SELECT m.id, m.index, m.name, 
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
