function getSettingByKey(settingKey) {
  const settingsSheet = sApp.getSheetByName(SETTINGS_SHEET_NAME);

  const settingKeyColumn = getColumnByTitle(settingsSheet, SETTINGS_TITLE, TITLE_ROW);
  if (settingKeyColumn == undefined) {
    const message = `Asetusavainten saraketta ei pystytty löytämään. Oletettiin, että asetus sarake löytyy otsikolla: "${SETTINGS_TITLE} riviltä ${TITLE_ROW}`;
    error(message);
    throw message
  };
  const settingKeyRow = getRowByTitle(settingsSheet, settingKey, settingKeyColumn);
  if (settingKeyRow == undefined) {
    const message = `Asetusta ei löytynyt, asetuksen oletettiin löytyvän avaimella: "${settingKey}"`;
    error(message);
    throw message
  };

  // Retrieve parameter columns
  const parameterColumns = new Array(MAX_PARAMETERS);
  for (let parameterIndex = 0; parameterIndex < parameterColumns.length; parameterIndex++) {
    parameterColumns[parameterIndex] = getColumnByTitle(settingsSheet, VALUE_PREFIX + (parameterIndex + 1) + VALUE_POSTFIX, TITLE_ROW);
  }

  const parameterValues = new Array(MAX_PARAMETERS);
  // Get parameters from parameter columns for a key
  parameterColumns.forEach((column, parameterIndex) => {
    if (column != undefined) {
      parameterValues[parameterIndex] = settingsSheet.getRange(settingKeyRow, column).getValue();
    }
  })

  return parameterValues;
}

function getCellSettingByKey(settingKey) {
  try {
    const values = getSettingByKey(settingKey);
    const cellA1 = values[0] + values[1];
    const cellRow = parseInt(values[1]);
    const cellColumn = sApp.getRange(values[0] + values[1]).getColumn();
    const cellColumnLetter = convertColumnIndexToLetter(cellColumn);
    const cell = {row: cellRow, column: cellColumn, columnLetter: cellColumnLetter, a1: cellA1};
    return cell;
  }
  catch (err) {
    error(`Asetuksen: "${settingKey}" tietoja ei voitu muuttaa soluksi. Onhan ensimmäinen parametri asetettu kirjaimeksi ja toinen numeroksi?`);
    throw err;
  }
}

function getDateByKey(settingKey) {
  let date = getSettingByKey(settingKey)[0]
  return date;
}