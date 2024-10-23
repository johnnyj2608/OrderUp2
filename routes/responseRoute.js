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

router.get('/response', async (req, res) => {
    try {
        let selectedDay = req.query.day || 0;
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:G`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        const breakfastResponses = [];
        for (let i = 0; i < 3; i++) {
            const title = data[1][i];
            const image = data[0][i].slice(8, -5);
            
            const names = data.slice(3).map(row => row[i]).filter(name => name);
            const count = names.length;
            
            breakfastResponses.push({
                image,
                title,
                count,
                names
            });
        }

        const lunchResponses = [];
        for (let i = 4; i < 7; i++) {
            const title = data[1][i];
            const image = data[0][i].slice(8, -5);
            
            const names = data.slice(3).map(row => row[i]).filter(name => name);
            const count = names.length;
            lunchResponses.push({
                image,
                title,
                count,
                names
            });
        }

        res.render("response", { 
            breakfastResponses, 
            lunchResponses,
        });
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;