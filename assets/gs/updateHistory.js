function updateHistory() {
    const weekday = new Date().getDay();
    if (weekday === 0) { // Sunday
      return;
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = ss.getSheetByName('History');
  
    let sourceRange = historySheet.getRange('A:DK');
    let sourceData = sourceRange.getValues();
    let targetRange = historySheet.getRange('E:DO');
    sourceRange.clearContent();
    targetRange.setValues(sourceData);
  
    const todayDate = new Date();
    const futureDate = new Date(todayDate);
    futureDate.setDate(todayDate.getDate() + 6);
  
    historySheet.getRange('A1').setValue(futureDate).setNumberFormat("MM/dd/yy");
    historySheet.getRange('A2').setValue('Name');
    historySheet.getRange('B2').setValue('Breakfast');
    historySheet.getRange('C2').setValue('Lunch');
  }
  