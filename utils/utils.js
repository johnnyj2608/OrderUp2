const dayOfWeekColumns = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
];

function getStatusIcon(status) {
    if (status === true) {
        return "<i class='fas fa-check'></i>";
    } else if (status === false) {
        return "<i class='fas fa-times'></i>";
    } else {
        return "";
    }
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { 
        year: '2-digit', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(new Date(date));
}

const moment = require('moment-timezone');

function formatTimestamp(timestamp) {
    const formattedTimestamp = moment.utc(timestamp)
        .tz('America/New_York', true)
        .format('MM/DD/YY, hh:mm A');
    return formattedTimestamp;
}

function getWeekNumber(date) {
    const currentDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    
    const dayOfWeek = currentDate.getUTCDay() || 7;
    currentDate.setUTCDate(currentDate.getUTCDate() + (4 - dayOfWeek));

    const yearStart = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((currentDate - yearStart) / 86400000) + 1) / 7);

    return weekNumber;
}

function getWeekRange(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    return {startDate: startDate, endDate: endDate};
}

module.exports = { 
    dayOfWeekColumns, 
    getStatusIcon, 
    formatDate, 
    formatTimestamp,
    getWeekNumber,
    getWeekRange,
};