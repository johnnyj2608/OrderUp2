const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

const sheetsByWeekday = {
    0: 'Today',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

router.get('/member', async (req, res) => {
    try {
        let selectedDay = req.query.day || 0;
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!I4:M`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        const memberList = [];

        data.forEach(row => {
            const member = {
                id: row[0],
                name: row[1],
                chinese: row[2],
                breakfast: row[3],
                lunch: row[4],
            };
            memberList.push(member);
        });

        res.render('member', { memberList });
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;