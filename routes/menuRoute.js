const express = require('express');
const router = express.Router();
const { connectToDb } = require('../utils/db');
const { getStatusIcon } = require('../utils/utils');

router.get('/menu', async (req, res) => {
    try {
        const client = await connectToDb();

        const query = `
            SELECT * FROM menu
            ORDER BY 
                type ASC,
                CASE WHEN monday THEN 1 ELSE 2 END,
                CASE WHEN tuesday THEN 1 ELSE 2 END,
                CASE WHEN wednesday THEN 1 ELSE 2 END,
                CASE WHEN thursday THEN 1 ELSE 2 END,
                CASE WHEN friday THEN 1 ELSE 2 END,
                CASE WHEN saturday THEN 1 ELSE 2 END,
                name ASC;
        `;
        const result = await client.query(query);
        const menuList = result.rows;

        res.render('menu', { 
            menuList, 
            getStatusIcon 
        });
    } catch (error) {
        res.status(500).send("Error loading data");
    }
});


router.post('/menu', async (req, res) => {
    const newIds = [];
    try {
        const client = await connectToDb();
        await client.query('BEGIN');
        
        const menu = req.body.menu;
        for (let food of menu) {
            const { id, type, name, monday, tuesday, wednesday, thursday, friday, saturday, count, delete: isDelete, } = food;
            if (isDelete) {
                const deleteMenuQuery = 'DELETE FROM menu WHERE id = $1';
                await client.query(deleteMenuQuery, [id]);
            } else if (id) {
                // If the id exists, update the existing row
                const updateQuery = `
                    UPDATE menu
                    SET type = $1,
                        name = $2,
                        monday = $3,
                        tuesday = $4,
                        wednesday = $5,
                        thursday = $6,
                        friday = $7,
                        saturday = $8,
                        count = $9
                    WHERE id = $10
                `;
                await client.query(updateQuery, [type, name, monday, tuesday, wednesday, thursday, friday, saturday, count, id]);
            } else {
                // If the id does not exist, insert a new row
                const insertQuery = `
                    INSERT INTO menu (type, name, monday, tuesday, wednesday, thursday, friday, saturday, count)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id
                `;
                const result = await client.query(insertQuery, [type, name, monday, tuesday, wednesday, thursday, friday, saturday, count]);
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