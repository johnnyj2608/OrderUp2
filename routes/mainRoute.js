const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');
const { dayOfWeekColumns } = require('../utils/utils');

router.get("/", async (req, res) => {
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

        const members = await getEligibleMembers(client, selectedDate);
        const names = members.map(member => ({
            id: member.id,
            index: member.index,
            name: member.name,
            max: member.max,
            breakfast: member.breakfast,
            lunch: member.lunch,
        }));

        const formattedTitle = 
            req.__('titles.date_title', 
            req.__('titles.' + dayOfWeekColumns[selectedWeekday])
            ) + 
            `, ${month}/${day}/${year}`;

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
            formattedTitle,
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
        ORDER BY name ASC;
    `;
    const result = await client.query(query, [menuType]);
    return result.rows;
}

// Helper function to get members for a specific day
async function getEligibleMembers(client, targetDate) {
    if (targetDate.getDay() === 0) {
        return []
    }

    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    const orderCountQuery = `
        SELECT m.id
        FROM members m
        LEFT JOIN orders o
        ON m.id = o.member_id AND o.date BETWEEN $1 AND $2
        GROUP BY m.id, m.units
        HAVING COUNT(o.id) < m.units;
    `;
    const validUnitsResult = await client.query(orderCountQuery, [startDate, endDate]);
    const validMemberIds = validUnitsResult.rows.map(row => row.id);

    const query = `
        SELECT m.id, m.index, m.name, m.max,
            COUNT(o.breakfast)::INTEGER AS breakfast,
            COUNT(o.lunch)::INTEGER AS lunch
        FROM members m
        LEFT JOIN orders o
        ON m.id = o.member_id AND o.date = $1
        GROUP BY m.id, m.index, m.name, m.max
        ORDER BY m.index ASC;
    `;
    const menuTypeResult = await client.query(query, [targetDate]);

    const eligibleMembers = menuTypeResult.rows.filter(member => {
        // Ordered both breakfast and lunch for the day
        if (member.breakfast === member.max && member.lunch === member.max) {
            return false;
        }
        // If hasn't ordered, ensure units are not exceeded
        if (member.breakfast === 0 && member.lunch === 0 && !validMemberIds.includes(member.id)) {
            return false;
        }
        return true;
    });

    return eligibleMembers;
}

module.exports = router;
