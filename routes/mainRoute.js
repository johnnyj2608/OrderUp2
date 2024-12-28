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
        const dateInput = req.query.date || new Date().toLocaleDateString('en-CA');

        const dateArray = dateInput.split("-");
        const year = dateArray[0];
        const month = parseInt(dateArray[1], 10) - 1;
        const day = dateArray[2];
        const selectedDate = new Date(year, month, day);

        const selectedWeekday = new Date(selectedDate).getDay();

        const client = await connectToDb();

        const breakfastMenu = await getMenuItems(client, selectedWeekday, 'B');
        const lunchMenu = await getMenuItems(client, selectedWeekday, 'L');

        const members = await getMembersForDay(client, selectedWeekday, selectedDate);
        const names = members.map(member => ({
            id: member.id,
            index: member.index,
            name: member.name,
            menu: member.menu,
        }));

        const formattedDate = req.__('titles.date_title', req.__('titles.'+dayOfWeekColumns[selectedWeekday]))+ `, ${month}/${day}/${year}`;

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
            formattedDate,
            dateInput,
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
        SELECT id, name, image
        FROM menu
        WHERE type = $1 AND ${selectedDayColumn} = TRUE
        ORDER BY id;
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
        WHERE ${selectedDayColumn} = TRUE
        ORDER BY m.index ASC;
    `;
    const result = await client.query(query, [targetDate]);
    return result.rows.filter(member => member.menu !== 'X');
}

module.exports = router;
