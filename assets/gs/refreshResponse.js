function refreshResponse() {
    const weekday = new Date().getDay();
    if (weekday === 0) { // Sunday
      return;
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sourceSheet;
    
    switch (weekday) {
      case 1: // Monday
        sourceSheet = ss.getSheetByName('Mon');
        break;
      case 2: // Tuesday
        sourceSheet = ss.getSheetByName('Tue');
        break;
      case 3: // Wednesday
        sourceSheet = ss.getSheetByName('Wed');
        break;
      case 4: // Thursday
        sourceSheet = ss.getSheetByName('Thu');
        break;
      case 5: // Friday
        sourceSheet = ss.getSheetByName('Fri');
        break;
      case 6: // Saturday
        sourceSheet = ss.getSheetByName('Sat');
        break;
    }
  
    if (sourceSheet) {
      const todaySheet = ss.getSheetByName('Today');
      todaySheet.clear(); 
  
      const sourceRange = sourceSheet.getRange('A1:M500');
      sourceRange.copyTo(todaySheet.getRange('A1'));
  
      sourceSheet.getRangeList(['A4:G500', 'L4:M500']).clearContent();
    }
}