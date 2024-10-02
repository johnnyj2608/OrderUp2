const express = require('express');
const router = express.Router();
const { getGoogleSheets, spreadsheetId } = require('../config/googleAPI');

const sheetsByWeekday = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

router.get("/", async (req, res) => {
    try {
        const estDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
        const today = new Date(estDate).getDay();

        let selectedDay = req.query.day || today;
        let sheetName = sheetsByWeekday[selectedDay];

        const googleSheets = getGoogleSheets();
        const spreadsheet = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:L`
        });
        const data = spreadsheet.data.values;

        const breakfastMenu = data[0].slice(0, 3);
        const lunchMenu = data[0].slice(4);

        const names = [];
        for (const member of data.slice(2)) {
            const memberInfo = member.slice(8, 12);
            if (memberInfo.length >= 3 && memberInfo[memberInfo.length-1] != 'TRUE') {
                const id = memberInfo[memberInfo.length-3];
                const name = memberInfo[memberInfo.length-2];
                const chinese = memberInfo[memberInfo.length-1];
                const fullName = `${id}. ${name}, ${chinese}`;
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
