const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

const sheetsByWeekday = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
};

router.get("/", async (req, res) => {
    try {
        let selectedDay = req.query.day || new Date().toLocaleString('en-us', { weekday: 'long' });
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:K`
        });
        const data = spreadsheet.data.values;

        const breakfastMenu = data[0].slice(0, 3);
        const lunchMenu = data[0].slice(4);

        const names = [];
        for (const innerArray of data.slice(2)) {
            const filtered = innerArray.filter(item => item !== '' && item !== 'TRUE');
            if (filtered.length >= 3) {
              const fullName = `${filtered[filtered.length - 3]}. ${filtered[filtered.length - 2]} ${filtered[filtered.length - 1]}`;
              names.push(fullName);
            }
        }

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
        });
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;
