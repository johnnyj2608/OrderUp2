const express = require('express');
const router = express.Router();

const sheetsByWeekday = {
    0: 'Today',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

router.get('/members', async (req, res) => {
    try {
        let selectedDay = req.query.day || 0;
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!I4:L`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        const memberList = [];

        data.forEach(row => {
            const member = {
                id: row[0],
                name: row[1],
                breakfast: row[2],
                lunch: row[3],
            };
            memberList.push(member);
        });

        res.render('members', { memberList });
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;