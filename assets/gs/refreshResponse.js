function refreshResponse() {
    const weekday = new Date().getDay();
    if (weekday === 0) { // Sunday
      return;
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    switch (weekday) {
      case 0: // Sunday
        break;
      case 1: // Monday
      const mondaySheet = ss.getSheetByName('Mon');
        mondaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
      case 2: // Tuesday
      const tuesdaySheet = ss.getSheetByName('Tue');
        tuesdaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
      case 3: // Wednesday
      const wednesdaySheet = ss.getSheetByName('Wed');
        wednesdaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
      case 4: // Thursday
      const thursdaySheet = ss.getSheetByName('Thu');
        thursdaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
      case 5: // Friday
      const fridaySheet = ss.getSheetByName('Fri');
        fridaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
      case 6: // Saturday
      const saturdaySheet = ss.getSheetByName('Sat');
        saturdaySheet.getRangeList(['A4:G1000', 'L4:M1000']).clearContent();
        break;
    }
  }