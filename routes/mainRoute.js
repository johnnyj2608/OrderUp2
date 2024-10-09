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

router.get("/", async (req, res) => {
    try {
        let selectedDay = req.query.day || 0;
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:M`
        });
        const data = spreadsheet.data.values;

        const breakfastMenu = data[0].slice(0, 3);
        const lunchMenu = data[0].slice(4);

        const names = [];
        const memberRows = {};
        const menuLimit = {};
        for (let i = 2; i < data.length; i++) {
            const member = data[i].slice(8, 13);
            if (member.length > 0) {
                if (member[member.length - 2] == 'TRUE' && member[member.length - 1] == 'TRUE') {
                    continue;
                }
                let orderedDay = 'A';
                if (member.length == 5) {
                    orderedDay = 'B';   // Breakfast only
                } else if (member.length == 4) {
                    orderedDay = 'L';   // Lunch only
                }
                const name = `${member[0]}. ${member[2] || member[1]}`;
                names.push(name);
                memberRows[name] = i+1;
                menuLimit[name] = orderedDay;
            }
        }

        res.render("main", { 
            breakfastMenu, 
            lunchMenu,
            names,
            memberRows,
            menuLimit,
        });
    } catch (error) {
        console.error("Error loading sheet data: ", error);
        res.status(500).send("Error loading sheet data");
    }
});

module.exports = router;
