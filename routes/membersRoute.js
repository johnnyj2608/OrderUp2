const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/members', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = 'SELECT * FROM members ORDER BY index ASC, name ASC';
        const result = await client.query(query);
        const memberList = result.rows;

        res.render('members', { memberList });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});


router.post('/members/update', async (req, res) => {
    const newIds = [];
    try {
        const client = await connectToDb();
        await client.query('BEGIN');
        
        const members = req.body.members;
        for (let member of members) {
            const { id, name, index, monday, tuesday, wednesday, thursday, friday, saturday, delete: isDelete,  } = member;
            if (isDelete) {
                const deleteMenuQuery = 'DELETE FROM members WHERE id = $1';
                await client.query(deleteMenuQuery, [id]);
            } else { 
                const selectQuery = 'SELECT id FROM members WHERE id = $1';
                const result = await client.query(selectQuery, [id]);

                if (result.rows.length > 0) {
                    // If the id exists, update the existing row
                    const updateQuery = `
                        UPDATE members
                        SET name = $1,
                            index = $2,
                            monday = $3,
                            tuesday = $4,
                            wednesday = $5,
                            thursday = $6,
                            friday = $7,
                            saturday = $8
                        WHERE id = $9
                    `;
                    await client.query(updateQuery, [name, index, monday, tuesday, wednesday, thursday, friday, saturday, id]);
                } else {
                    // If the id does not exist, insert a new row
                    const insertQuery = `
                        INSERT INTO members (index, name, monday, tuesday, wednesday, thursday, friday, saturday)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING id
                    `;
                    const result = await client.query(insertQuery, [index, name, monday, tuesday, wednesday, thursday, friday, saturday]);
                    newIds.push(result.rows[0].id);
                }
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ newIds });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating menu:', error);
        res.status(500).send("Error saving data.");
    }
});

module.exports = router;