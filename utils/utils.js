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

module.exports = { dayOfWeekColumns, getStatusIcon };