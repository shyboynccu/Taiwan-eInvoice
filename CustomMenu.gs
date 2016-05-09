function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu(RES.TOP_MENU_NAME)
      .addItem(RES.MENU_SYNC_BY_MONTH, 'openSidebar')
      .addToUi();
}

function openSidebar() {
 //var html = HtmlService.createHtmlOutputFromFile('sidebar').setTitle(RES.SIDEBAR_TITLE)
 var html = HtmlService.createTemplateFromFile('sidebar').evaluate().setTitle(RES.SIDEBAR_TITLE)
                       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
 SpreadsheetApp.getUi().showSidebar(html);
}

function syncByMonth(year, month /*start from 0*/) {
  var startOfTheMonth = new Date(year, month, 1);
  var endOfTheMonth = new Date(year, month+1, 0);
  
  var startDate = formatDateString(startOfTheMonth.getFullYear(), startOfTheMonth.getMonth() + 1, startOfTheMonth.getDate());
  var endDate = formatDateString(endOfTheMonth.getFullYear(), endOfTheMonth.getMonth() + 1, endOfTheMonth.getDate()); 
  
  var active_spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var overview_sheet_name = RES.OVERVIEW_SHEET_PREFIX + ":" + year + "/" + (month + 1);
  var overview_sheet = active_spread_sheet.getSheetByName(overview_sheet_name);  
  if (overview_sheet == null) {
    // User clicked "Yes".
    overview_sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(overview_sheet_name);
    overview_sheet.appendRow(RES.OVERVIEW_SHEET_COLUMN_NAMES);
    overview_sheet.setColumnWidth(4, 300);
    overview_sheet.setFrozenRows(1);
  } else {
    var last_row = overview_sheet.getLastRow();
 
    if (last_row > 1) {
      var lastInvoiceDate = overview_sheet.getRange(overview_sheet.getLastRow(), 1).getValue();
      if (startOfTheMonth < lastInvoiceDate) {
        startDate = formatDateString(lastInvoiceDate.getFullYear(), lastInvoiceDate.getMonth() + 1, lastInvoiceDate.getDate() + 1);
      }
    } 
  }
  
  Logger.log("Sync from " + startDate + " to " + endDate);
  
  var invoice_headers = query_carrier_invoice_header(startDate, endDate).details;
  
  if (invoice_headers) {
    invoice_headers.forEach (function (invoice_header) {
      var invNum = invoice_header['invNum'];
      var invDate = formatDateString(invoice_header['invDate'].year + 1911, invoice_header['invDate'].month, invoice_header['invDate'].date);
      var invSeller = invoice_header['sellerName'];
      var invAmount = invoice_header['amount'];
      
      overview_sheet.appendRow([invDate, invNum, invAmount, invSeller] );
    }); 
    
    overview_sheet.sort(1);
    
    return true;
  } else {
    return false;
  }
}

function syncCurrentMonth() {
  var today = new Date();
  
  var year = today.getFullYear();
  var month = today.getMonth();
  
  return syncByMonth(year, month);
}

function updateInvDetail(invNum, invDate) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RES.DETAIL_SHEET_PREFIX);
  if (sheet == null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(RES.DETAIL_SHEET_PREFIX);
    sheet.appendRow(RES.DETAIL_SHEET_COLUMN_NAMES);
    sheet.setFrozenRows(1);
  }
  
  var invoice_detail = query_carrier_invoice_detail(invNum, invDate);
  var item_details = invoice_detail.details;
  item_details.forEach (function (item_detail) {
    //Logger.log([invoice_detail.invDate, invoice_detail.sellerName, item_detail.description, item_detail.amount]);
    
    sheet.appendRow([invDate, invNum, item_detail.description, item_detail.amount, invSeller] );
  });
  
  sheet.sort(1); //sort on date column
  
}