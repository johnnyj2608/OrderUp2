const express = require('express');
const router = express.Router();
const { connectToDb } = require('../database/db');

router.get('/menu', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = 'SELECT * FROM menu ORDER BY type ASC, id ASC';
        const result = await client.query(query);
        const menuList = result.rows;

        res.render('menu', { menuList });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});


router.post('/menu/update', async (req, res) => {
    const newIds = [];
    try {
        const client = await connectToDb();
        await client.query('BEGIN');
        
        const menu = req.body.menu;
        for (let food of menu) {
            const { id, type, name, image, monday, tuesday, wednesday, thursday, friday, saturday, count, delete: isDelete, } = food;
            if (isDelete) {
                const deleteMenuQuery = 'DELETE FROM menu WHERE id = $1';
                await client.query(deleteMenuQuery, [id]);
            } else if (id) {
                // If the id exists, update the existing row
                const updateQuery = `
                    UPDATE menu
                    SET name = $1,
                        image = $2,
                        monday = $3,
                        tuesday = $4,
                        wednesday = $5,
                        thursday = $6,
                        friday = $7,
                        saturday = $8,
                        count = $9
                    WHERE id = $10
                `;
                await client.query(updateQuery, [name, image, monday, tuesday, wednesday, thursday, friday, saturday, count, id]);
            } else {
                // If the id does not exist, insert a new row
                const insertQuery = `
                    INSERT INTO menu (type, name, image, monday, tuesday, wednesday, thursday, friday, saturday, count)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id
                `;
                const result = await client.query(insertQuery, [type, name, image, monday, tuesday, wednesday, thursday, friday, saturday, count]);
                newIds.push(result.rows[0].id);
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