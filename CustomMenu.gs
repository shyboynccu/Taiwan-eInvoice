function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('電子發票')
      .addItem('同步當月發票', 'openSidebar')
      .addToUi();
}

function openSidebar() {
 var html = HtmlService.createHtmlOutputFromFile('sidebar').setTitle('台灣電子發票')
                       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
 SpreadsheetApp.getUi().showSidebar(html);
}

function syncCurrentMonth() {
  var today = new Date();
  var startOfTheMonth = new Date(today.getYear(), today.getMonth(), 1)
  
  var overview_sheet_name = "電子發票:" + today.getYear() + "/" + (today.getMonth()+1);
  var active_spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var overview_sheet = active_spread_sheet.getSheetByName(overview_sheet_name);
  
  var startDate = formatDateString(startOfTheMonth.getYear(), startOfTheMonth.getMonth() + 1, startOfTheMonth.getDate());
  
  if (overview_sheet == null) {
    overview_sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(overview_sheet_name);
    overview_sheet.appendRow(["發票日期", "發票號碼", "發票金額", "商店名稱"]);
    overview_sheet.setColumnWidth(4, 300);
    overview_sheet.setFrozenRows(1);
  } else {
    var last_row = overview_sheet.getLastRow();
 
    if (last_row > 1) {
      var lastInvoiceDate = overview_sheet.getRange(overview_sheet.getLastRow(), 1).getValue();
      if (startOfTheMonth < lastInvoiceDate) {
        startDate = formatDateString(lastInvoiceDate.getYear(), lastInvoiceDate.getMonth() + 1, lastInvoiceDate.getDate() + 1);
      }
    } 
  }
  
  var endDate = formatDateString(today.getYear(), today.getMonth() + 1, today.getDate()); 
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

function updateInvDetail(invNum, invDate) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("電子發票明細");
  if (sheet == null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("電子發票明細");
    sheet.appendRow(["發票日期", "發票號碼", "消費項細", "項目金額", "商店名稱"]);
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