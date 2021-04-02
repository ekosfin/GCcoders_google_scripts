/************************************************** */
// CONSTANTS
/************************************************** */
SCHEDULE_SHEET_NAME = "Nykyinen viikko";
MATERIAL_SHEET_NAME = "Kuljettajat & kohteet";
LOG_SHEET_NAME = "REST Logi";

// The script needs to be deployed in the sheet's context
const ss = SpreadsheetApp.getActive();
const Utils = new RemeoUtils.Instance();
Utils.setSApp(ss);
Utils.setLogSheetName(LOG_SHEET_NAME);
WATCH_PW = Utils.Settings.getByKey("Katseluoikeudet")[1];
EDIT_PW = Utils.Settings.getByKey("Muokkausoikeudet")[1];

const API_KEY = "REPLACE_API_KEY";

/************************************************** */
// ACTUAL WEB APP
/************************************************** */
const sheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
const materialSheet = ss.getSheetByName(MATERIAL_SHEET_NAME);
const range = sheet.getDataRange();
const materialRange = materialSheet.getDataRange();

// Nothing to see here
function doGet(e) {
  return true;
}

// Routes for login, watch and edit
function doPost(e) {
  let outputJSON;
  let response;
  const params = e.parameters;
  const UserData = JSON.parse(e.postData.contents);

  //Check for Bad request
  if (!params.hasOwnProperty("route")) {
    return ContentService.createTextOutput("400 Bad Request");
  }

  //Check API key
  if (!UserData.API === API_KEY) {
    outputJSON = { message: "Key Invalid" };
    outputJSON = JSON.stringify(outputJSON);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  //Route tree
  if (params.route === "data") {
    outputJSON = getSchedule_();
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (params.route === "edit" && UserData.ACCESS === "edit") {
    response = editSchedule_(UserData);
    return ContentService.createTextOutput(response);
  } else if (params.route === "accessRights") {
    outputJSON = getAccessRights_();
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else {
    return ContentService.createTextOutput("400 Bad Request");
  }
}

function getSchedule_() {
  let weekLength = 0;
  let materials = [];
  let colorSettings = {};
  let driverColors = {};
  let materialRow = {
    materialName: "",
    data: [],
  };
  let driverItem = {
    driver: "",
    color: "",
  };
  let results = {
    schedule: [],
    drivers: [],
    destinations: [],
  };
  let cell;

  // Get week length
  cell = range.getCell(1, 2);
  while (cell.getValue() != "") {
    weekLength++;
    cell = cell.offset(0, 1);
  }

  // Get materials
  cell = materialRange.getCell(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "Kuljetettavat:") {
      cell = cell.offset(1, 0);
      while (cell.getValue() != "") {
        materials.push(cell.getValue());
        cell = cell.offset(1, 0);
      }
      break;
    }
    cell = cell.offset(0, 1);
  }

  // Get color settings
  cell = materialRange.getCell(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "Värit:") {
      cell = cell.offset(1, 0);
      while (cell.getValue() != "") {
        colorSettings[
          [cell.getValue().substring(0, cell.getValue().indexOf(":"))]
        ] = cell.getValue().split(":").pop();
        cell = cell.offset(1, 0);
      }
      break;
    }
    cell = cell.offset(0, 1);
  }

  // Get drivers and assign colors for them based on driver types
  cell = materialRange.getCell(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "Kuljettajat:") {
      cell = cell.offset(1, 0);
      while (cell.getValue() != "") {
        driverColors[cell.getValue()] =
          colorSettings[cell.offset(0, 1).getValue()];
        driverItem["driver"] = cell.getValue();
        driverItem["color"] = colorSettings[cell.offset(0, 1).getValue()];
        results["drivers"].push({ ...driverItem });
        cell = cell.offset(1, 0);
      }
      break;
    }
    cell = cell.offset(0, 1);
  }

  // Fetch deliveries for each material
  cell = range.getCell(2, 1);
  while (cell.getValue() != "") {
    if (materials.includes(cell.getValue())) {
      materialRow["materialName"] = cell.getValue();
      cell = cell.offset(0, 1);

      for (let i = 0; i < weekLength; i++) {
        materialRow["data"].push([]);
        // Fetch data if there is any
        if (cell.getDisplayValue().replace(/[\s\n-]+/gi, "") != "") {
          cell = cell.offset(1, 0);
          cell = fetchDelivery_(cell, i, materialRow, driverColors);
          cell = cell.offset(6, 0);
          cell = fetchDelivery_(cell, i, materialRow, driverColors);
          cell = cell.offset(-7, 0);
        }
        cell = cell.offset(0, 1);
      }

      results["schedule"].push({ ...materialRow });
      materialRow["data"] = [];
      cell = cell.offset(0, -weekLength - 1);
    }
    cell = cell.offset(1, 0);
  }

  // Fetch destinations
  cell = materialRange.getCell(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "Kohteet:") {
      cell = cell.offset(1, 0);
      while (cell.getValue() != "") {
        results["destinations"].push(cell.getValue());
        cell = cell.offset(1, 0);
      }
      break;
    }
    cell = cell.offset(0, 1);
  }

  Utils.Log.info("Nykyinen viikko haettu onnistuneesti");

  // Return the results
  let outputJSON = JSON.stringify(results);
  return outputJSON;
}

function getAccessRights_() {
  let accessRights = [];
  let user = {
    email: "",
    accessLevel: "",
  };
  let settings;

  // Get access rights settings for employees
  let index = 1;
  while (true) {
    try {
      settings = Utils.Settings.getByKey("Työntekijän " + index + " oikeudet");
      user["email"] = settings[0];
      user["accessLevel"] = settings[1];
      accessRights.push({ ...user });
      index++;
    } catch (e) {
      break;
    }
  }

  // Overwrite unwanted error message
  const logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  const logRange = logSheet.getDataRange();
  const lastRow = logSheet.getLastRow();
  const cell = logRange.getCell(lastRow, 1);
  cell.offset(0, 1).setValue("Info");
  cell.offset(0, 2).setValue("Käyttöoikeudet haettu onnistuneesti");

  // Return the results
  let outputJSON = JSON.stringify(accessRights);
  return outputJSON;
}

function editSchedule_(pData) {
  const edits = pData.edits;
  let row;
  let column;
  let data = [];
  // Indicates the number of remaining driver entries to iterate
  let countRemaining;

  for (let i = 0; i < edits.length; i++) {
    row = Utils.Cell.getRowByTitle(sheet, edits[i].materialName, 1);
    column = getColumnByWeekday_(edits[i].day);
    countRemaining = 2;
    cell = range.getCell(row + 2, column);
    // Write populated entries
    data = edits[i].data;
    for (let j = 0; j < data.length; j++) {
      cell = addDelivery_(
        cell,
        data[j].dayItem,
        data[j].twoWay,
        data[j].dayInfo
      );
      countRemaining--;
    }
    // Write empty entries
    for (countRemaining; countRemaining > 0; countRemaining--) {
      cell = addDelivery_(cell, "", "", "");
    }
  }

  Utils.Log.info("Taulukkoa muokattu onnistuneesti");
  return "Edit successful";
}

function getColumnByWeekday_(day) {
  weekdayColumns = {
    Maanantai: 2,
    Tiistai: 3,
    Keskiviikko: 4,
    Torstai: 5,
    Perjantai: 6,
    Lauantai: 7,
    Sunnuntai: 8,
  };
  return weekdayColumns[day];
}

function fetchDelivery_(cell, index, materialRow, driverColors) {
  let isTwoWay;
  let cellContent;

  if (cell.getDisplayValue().trim() != "") {
    if (cell.getDisplayValue()[0] == "*") {
      isTwoWay = true;
    } else {
      isTwoWay = false;
    }
    cellContent = cell.getDisplayValue().replace(/(^\*+|\*+$)/gm, "");
    materialRow["data"][index].push({
      dayItem: cellContent.split(" ").slice(0, 3).join(" "),
      dayInfo: cellContent.split(" ").slice(3).join(" "),
      twoWay: isTwoWay,
      color: driverColors[cellContent.split(" ")[0]],
    });
  }

  return cell;
}

function addDelivery_(cell, dayItem, twoWay, dayInfo) {
  for (let i = 0; i < 3; i++) {
    cell.setValue(dayItem.split(" ")[i]);
    cell = cell.offset(1, 0);
  }

  if (twoWay) {
    cell.setValue("Meno-paluu");
  } else if (twoWay === false) {
    cell.setValue("Meno");
  } else if (twoWay == "") {
    cell.setValue("");
  }

  cell = cell.offset(1, 0);
  cell.setValue(dayInfo);
  cell = cell.offset(2, 0);

  return cell;
}
