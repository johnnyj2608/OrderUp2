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

function formatTimestamp(timestamp) {
    return new Intl.DateTimeFormat('en-US', { 
        year: '2-digit', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
    }).format(new Date(timestamp));
}

module.exports = { 
    dayOfWeekColumns, 
    getStatusIcon, 
    formatDate, 
    formatTimestamp, 
};