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
  
  CARDNO = settings['cardNo']
  CARDENCRYPT = settings['cardPin']
  
  if(syncCurrentMonth()) {
    //success
  } else {
    throw ("同步失敗！請確認條碼或驗證碼是否有誤。");
  }
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
