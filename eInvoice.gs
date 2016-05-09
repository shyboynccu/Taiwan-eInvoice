DEBUG = false
APPID = get_script_property("APPID");
UUID = gen_uuid();

function get_script_property(key) {
  scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty(key);
}

function gen_uuid() {
  //return UiApp.getActiveApplication().getId();
  return get_script_property("UUID");
}

function get_timestamp() {
  return ((new Date()).getTime()/1000).toFixed(0);
}

function formatDateString(year, month, date) {
  return Utilities.formatString('%d/%02d/%02d', year, month, date);
}

function query_carrier_invoice_detail(invNum, invDate) {
  var data = {
    "version": 0.2,
    "cardType": "3J0002",
    "cardNo": CARDNO,
    "expTimeStamp": "2147483647",
    "action": "carrierInvDetail",
    "timeStamp": get_timestamp()+10,
    "invNum": invNum,
    "invDate": invDate,
    "uuid": UUID,
    "appID": APPID,
    "cardEncrypt": CARDENCRYPT
  };

  var response_data = make_request("/PB2CAPIVAN/invServ/InvServ", data);
  return response_data;
}

function query_carrier_invoice_header(startDate, endDate) {
  var data = {
    "version": 0.2,
    "cardType": "3J0002",
    "cardNo": CARDNO,
    "expTimeStamp": "2147483647",
    "action": "carrierInvChk",
    "timeStamp": get_timestamp()+10,
    "startDate": startDate,
    "endDate": endDate,
    "onlyWinningInv": "N",
    "uuid": UUID,
    "appID": APPID,
    "cardEncrypt": CARDENCRYPT
  };

  var response_data = make_request("/PB2CAPIVAN/invServ/InvServ", data);
  return response_data;
}

function make_request(api_method, data) {

  var options = {
    'method': 'post',
    'payload': data
  };
  
  var response_data = null;
  
  if (!DEBUG) {  
    var url = "https://www.einvoice.nat.gov.tw" + api_method;
    var response = UrlFetchApp.fetch(url, options);
    var json = response.getContentText();
    
    response_data = JSON.parse(json);
  }
  
  return response_data;
}
