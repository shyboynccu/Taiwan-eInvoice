function doSync(settings) {
  var userProperties = PropertiesService.getUserProperties();
  
  if (settings['savePrefs'] == true) {
    userProperties.setProperty('savePrefs', 'true')
    userProperties.setProperty('cardNo', settings['cardNo'] );
    userProperties.setProperty('cardPin', settings['cardPin']);
  } else {
    userProperties.deleteProperty('savePrefs');
    userProperties.deleteProperty('cardNo');
    userProperties.deleteProperty('cardPin');
  }
  
  CARDNO = settings['cardNo'];
  CARDENCRYPT = settings['cardPin'];
  
  year = parseInt(settings['einvoice-year']);
  month = parseInt(settings['einvoice-month']);
  
  return syncByMonth(year, month);
}

function getSettings() {
  var userProperties = PropertiesService.getUserProperties();
  var settings = {
    savePrefs: userProperties.getProperty('savePrefs'),
    cardNo: userProperties.getProperty('cardNo'),
    cardPin: userProperties.getProperty('cardPin')
  };
  return settings;
}
