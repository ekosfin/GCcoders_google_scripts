class Settings {
  // Retrieve a setting by key
  static getByKey(sApp, settingKey) {
    const settingsSheet = sApp.getSheetByName(SETTINGS_SHEET_NAME);
    // Create new cache, if cache is undefined
    if (!this.tableCache) {
      this.tableCache = settingsSheet.getRange(1, 1, settingsSheet.getMaxRows(), settingsSheet.getMaxColumns()).getValues();
    }

    const settingKeyColumn = Cell.getColumnByTitleInMemory(this.tableCache, SETTINGS_TITLE, TITLE_ROW - 1);
    if (settingKeyColumn == undefined) {
      const message = `Asetusavainten saraketta ei pystytty löytämään. Oletettiin, että asetus sarake löytyy otsikolla: "${SETTINGS_TITLE} riviltä ${TITLE_ROW}`;
      Log.error(sApp, message);
      throw message
    };
    const settingKeyRow = Cell.getRowByTitleInMemory(this.tableCache, settingKey, settingKeyColumn);
    if (settingKeyRow == undefined) {
      const message = `Asetusta ei löytynyt, asetuksen oletettiin löytyvän avaimella: "${settingKey}"`;
      Log.error(sApp, message);
      throw message
    };

    // Retrieve parameter columns
    const parameterColumns = new Array(MAX_PARAMETERS);
    for (let parameterIndex = 0; parameterIndex < parameterColumns.length; parameterIndex++) {
      parameterColumns[parameterIndex] = Cell.getColumnByTitleInMemory(this.tableCache, VALUE_PREFIX + (parameterIndex + 1) + VALUE_POSTFIX, TITLE_ROW - 1);
    }

    const parameterValues = new Array(MAX_PARAMETERS);
    // Get parameters from parameter columns for a key
    parameterColumns.forEach((column, parameterIndex) => {
      if (column != undefined) {
        parameterValues[parameterIndex] = this.tableCache[settingKeyRow][column];
      }
    })

    return parameterValues;
  }

  // Retrieve setting by key and pack it into cell object
  static getCellByKey(sApp, settingKey) {
    try {
      const values = Settings.getByKey(sApp, settingKey);
      const cellA1 = values[0] + values[1];
      const cellRow = parseInt(values[1]);
      const cellColumn = Cell.letterToColumn(values[0]);
      const cellColumnLetter = values[0];
      const cell = {
        row: cellRow,
        column: cellColumn,
        columnLetter: cellColumnLetter,
        a1: cellA1
      };
      return cell;
    }
    catch (err) {
      Log.error(sApp, `Asetuksen: "${settingKey}" tietoja ei voitu muuttaa soluksi. Onhan ensimmäinen parametri asetettu kirjaimeksi ja toinen numeroksi?`);
      throw err;
    }
  }

  static getDateByKey(sApp, settingKey) {
    return Settings.getByKey(sApp, settingKey)[0];
  }
}