let INITIALIZED = false;
function initialize() {
  if (INITIALIZED) {
    return
  }
  INITIALIZED = true;
  PINJA_FOLDER_ID = RemeoUtils.getSettingByKey("Pinja kansion ID")[0];
  PINJA_TITLE_ROW_IDENTIFIER = RemeoUtils.getSettingByKey("Pinja otsikkorivin avain")[0];
  PINJA_DATE_COLUMN = RemeoUtils.getSettingByKey("Pinja päivämäärä sarake")[0];
  PINJA_PRODUCT_COLUMN_IDENTIFIER = RemeoUtils.getSettingByKey("Pinja tuotteen otsikko")[0];
  PINJA_TYPE_COLUMN_IDENTIFIER = RemeoUtils.getSettingByKey("Pinja suunnan otsikko")[0];
  PINJA_TYPE_IN_REGEX = new RegExp(RemeoUtils.getSettingByKey("Pinja suunta sisään")[0]);
  PINJA_TYPE_OUT_REGEX = new RegExp(RemeoUtils.getSettingByKey("Pinja suunta ulos")[0]);
  PINJA_WEIGHT_COLUMN_IDENTIFIER = RemeoUtils.getSettingByKey("Pinja painon otsikko")[0];
  PINJA_DATE_REGEX = new RegExp(RemeoUtils.getSettingByKey("Pinja päivämäärän tunnistus")[0]);
  PINJA_PRODUCT_CLEANUP_REGEX = new RegExp(RemeoUtils.getSettingByKey("Pinja tuotenimen puhdistus")[0]);
}

var DIRECTIONS = {
  IN: "in",
  OUT: "out"
}


/*const PINJA_FOLDER_ID = "1IYms1WkD-ZlMlTxxEekgqywu7uXh2qBt";
const PINJA_TITLE_ROW_IDENTIFIER = "Käyttöpaikka";
const PINJA_DATE_COLUMN = 1;
const PINJA_PRODUCT_COLUMN_IDENTIFIER = "Tuote";
const PINJA_TYPE_COLUMN_IDENTIFIER = "Tyyppi";
const PINJA_TYPE_IN_REGEX = new RegExp("Toimitus, sisään");
const PINJA_TYPE_OUT_REGEX = new RegExp("Toimitus, ulos");
const PINJA_WEIGHT_COLUMN_IDENTIFIER = "Netto (t)";
const PINJA_DATE_REGEX = new RegExp("[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}");
const PINJA_PRODUCT_CLEANUP_REGEX = new RegExp("[^(]+");
*/