const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');
const { dayOfWeekColumns, getWeekRange } = require('../utils/utils');

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

    const { startDate, endDate } = getWeekRange(targetDate);
    const orderCountQuery = `
        SELECT m.id, m.units,
            COUNT(CASE WHEN o.breakfast IS NOT NULL THEN 1 END)::INTEGER AS breakfast_count,
            COUNT(CASE WHEN o.lunch IS NOT NULL THEN 1 END)::INTEGER AS lunch_count
        FROM members m
        LEFT JOIN orders o
        ON m.id = o.member_id AND o.date BETWEEN $1 AND $2
        GROUP BY m.id, m.units
        HAVING 
            COUNT(CASE WHEN o.breakfast IS NOT NULL THEN 1 END) < m.units
            OR COUNT(CASE WHEN o.lunch IS NOT NULL THEN 1 END) < m.units
    `;
    const validMembersResult = await client.query(orderCountQuery, [startDate, endDate]);
    const validMembers = validMembersResult.rows.map(row => ({
        id: row.id,
        units: row.units,
        breakfast_count: row.breakfast_count,
        lunch_count: row.lunch_count
    }));

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
        const validMember = validMembers.find(v => v.id === member.id);

        if (!validMember) return false;
        if (member.breakfast >= member.max && member.lunch >= member.max) return false;
    
        return true;
    });
    return eligibleMembers;
    
}


router.post('/', async (req, res) => {
    const { 
        memberID,
        dateInput,
        breakfastID,
        breakfastName,
        lunchID,
        lunchName,
    } = req.body;

    const dateArray = dateInput.split("-");
    const year = dateArray[0];
    const month = dateArray[1];
    const day = dateArray[2];
    const selectedDate = new Date(year, parseInt(month, 10)-1, day);
    
    const timestamp = new Date().toISOString();

    try {
        const client = await connectToDb();

        const findBreakfastQuery = `
            SELECT id FROM orders
            WHERE member_id = $1 AND date = $2 AND breakfast IS NULL
            ORDER BY id ASC
            LIMIT 1
        `;
        const breakfastResult = await client.query(findBreakfastQuery, [memberID, selectedDate]);
        const breakfastOrder = breakfastResult.rows[0];

        const findLunchQuery = `
            SELECT id FROM orders
            WHERE member_id = $1 AND date = $2 AND lunch IS NULL
            ORDER BY id ASC
            LIMIT 1
        `;
        const lunchResult = await client.query(findLunchQuery, [memberID, selectedDate]);
        const lunchOrder = lunchResult.rows[0];

        if (breakfastName && !lunchName && breakfastOrder) {
            const updateBreakfastQuery = `
                UPDATE orders
                SET breakfast = $1, timestamp = $2
                WHERE id = $3
            `;
            await client.query(updateBreakfastQuery, [breakfastName, timestamp, breakfastOrder.id]);
        } else if (!breakfastName && lunchName && lunchOrder) {
            const updateLunchQuery = `
                UPDATE orders
                SET lunch = $1, timestamp = $2
                WHERE id = $3
            `;
            await client.query(updateLunchQuery, [lunchName, timestamp, lunchOrder.id]);
        } else {
            const memberQuery = 'SELECT units, max FROM members WHERE id = $1';
            const memberResult = await client.query(memberQuery, [memberID]);
            const units = memberResult.rows[0].units;
            const max = memberResult.rows[0].max;

            const dailyCountQuery = `
                SELECT 
                    COUNT(CASE WHEN breakfast IS NOT NULL THEN 1 END) AS breakfast_count,
                    COUNT(CASE WHEN lunch IS NOT NULL THEN 1 END) AS lunch_count
                FROM orders
                WHERE member_id = $1 AND date = $2
            `;
            const dailyCountResult = await client.query(dailyCountQuery, [memberID, selectedDate]);
            const dailyBreakfastCount = dailyCountResult.rows[0].breakfast_count || 0;
            const dailyLunchCount = dailyCountResult.rows[0].lunch_count || 0;

            if (dailyBreakfastCount >= max || dailyLunchCount >= max) {
                throw new Error('Cannot insert: Breakfast or lunch count already at limit for the day.');
            }

            const { startDate, endDate } = getWeekRange(selectedDate);
            const weeklyCountQuery = `
                SELECT 
                    COUNT(CASE WHEN breakfast IS NOT NULL THEN 1 END) AS breakfast_count,
                    COUNT(CASE WHEN lunch IS NOT NULL THEN 1 END) AS lunch_count
                FROM orders
                WHERE member_id = $1 AND date BETWEEN $2 AND $3
            `;
            const weeklyCountResult = await client.query(weeklyCountQuery, [memberID, startDate, endDate]);
            const weeklyBreakfastCount = weeklyCountResult.rows[0].breakfast_count || 0;
            const weeklyLunchCount = weeklyCountResult.rows[0].lunch_count || 0;

            if (weeklyBreakfastCount >= units || weeklyLunchCount >= units) {
                throw new Error('Cannot insert: Breakfast or lunch count already at weekly limit.');
            }

            const orderInsertQuery = `
                INSERT INTO orders (member_id, date, breakfast, lunch, timestamp)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(orderInsertQuery, [
                memberID,
                selectedDate,
                breakfastName,
                lunchName,
                timestamp,
            ]);
        }
        const incrementCountQuery = `
            UPDATE menu
            SET count = count + 1
            WHERE id = $1
        `;
        if (breakfastID) {
            await client.query(incrementCountQuery, [breakfastID]);
        }
        if (lunchID) {
            await client.query(incrementCountQuery, [lunchID]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

module.exports = router;
