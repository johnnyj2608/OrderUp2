const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/members', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = 'SELECT * FROM members ORDER BY id ASC';
        const result = await client.query(query);
        const memberList = result.rows;

        res.render('members', { memberList });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});

router.post('/members/update', async (req, res) => {
    try {
        const client = await connectToDb();
        await client.query('BEGIN');

        const members = req.body.members;
        for (let member of members) {
            const { id, name, monday, tuesday, wednesday, thursday, friday, saturday } = member;
            const selectQuery = 'SELECT id FROM members WHERE id = $1';
            const result = await client.query(selectQuery, [id]);

            if (result.rows.length > 0) {
                // If the id exists, update the existing row
                const updateQuery = `
                    UPDATE members
                    SET name = $1,
                        monday = $2,
                        tuesday = $3,
                        wednesday = $4,
                        thursday = $5,
                        friday = $6,
                        saturday = $7
                    WHERE id = $8
                `;
                await client.query(updateQuery, [name, monday, tuesday, wednesday, thursday, friday, saturday, id]);
            } else {
                // If the id does not exist, insert a new row
                const insertQuery = `
                    INSERT INTO members (id, name, monday, tuesday, wednesday, thursday, friday, saturday)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;
                await client.query(insertQuery, [id, name, monday, tuesday, wednesday, thursday, friday, saturday]);
            }
        }

        await client.query('COMMIT');
        res.status(200).send("Members updated successfully.");
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating members:', error);
        res.status(500).send("Error saving data.");
    }
});

module.exports = router;