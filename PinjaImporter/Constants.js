// Function initializes constants that can be downloaded from the settings
// Constants are lazely donwloaded to speed up start up time, because settings
// operations are expensive.
INITIALIZED = false;
function initialize() {
  if (INITIALIZED) {
    return
  }
  INITIALIZED = true;
  Utils = new RemeoUtils.Instance();
  // Lots of variables related to data import process will be loaded.
  PINJA_FOLDER_ID = Utils.Settings.getByKey("Pinja kansion ID")[0];
  PINJA_TITLE_ROW_IDENTIFIER = Utils.Settings.getByKey("Pinja otsikkorivin avain")[0];
  PINJA_DATE_COLUMN = Utils.Settings.getByKey("Pinja päivämäärä sarake")[0];
  PINJA_PRODUCT_COLUMN_IDENTIFIER = Utils.Settings.getByKey("Pinja tuotteen otsikko")[0];
  PINJA_TYPE_COLUMN_IDENTIFIER = Utils.Settings.getByKey("Pinja suunnan otsikko")[0];
  PINJA_TYPE_IN_REGEX = new RegExp(Utils.Settings.getByKey("Pinja suunta sisään")[0]);
  PINJA_TYPE_OUT_REGEX = new RegExp(Utils.Settings.getByKey("Pinja suunta ulos")[0]);
  PINJA_WEIGHT_COLUMN_IDENTIFIER = Utils.Settings.getByKey("Pinja painon otsikko")[0];
  PINJA_DATE_REGEX = new RegExp(Utils.Settings.getByKey("Pinja päivämäärän tunnistus")[0]);
  PINJA_PRODUCT_CLEANUP_REGEX = new RegExp(Utils.Settings.getByKey("Pinja tuotenimen puhdistus")[0]);
}

var DIRECTIONS = {
  IN: "in",
  OUT: "out"
}