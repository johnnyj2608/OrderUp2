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
            range: `${sheetName}!A1:M`,
            valueRenderOption: 'FORMULA'
        });
        const data = spreadsheet.data.values;

        const breakfastMenu = [];
        for (let i = 0; i < 3; i++) {
            breakfastMenu.push({ title: data[1][i], image: data[0][i].slice(8, -5) });
        }

        const lunchMenu = [];
        for (let i = 4; i < 7; i++) {
            lunchMenu.push({ title: data[1][i], image: data[0][i].slice(8, -5) });
        }


        const names = [];
        for (let i = 3; i < data.length; i++) {
            const member = data[i].slice(8, 13);
            if (member.length > 0) {
                if (member.length == 5 && member[3] && member[4]) {
                    continue;   // Ordered for both meals already
                }
                let menu = 'A';
                if (member.length == 5) {
                    menu = 'B';   // Ordered for lunch, breakfast only
                } else if (member.length == 4) {
                    menu = 'L';   // Ordered for breakfast, lunch only
                }
                const name = `${member[0]}. ${member[2] || member[1]}`;
                names.push({name: name, row: i, menu: menu });
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
