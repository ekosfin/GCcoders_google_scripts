// Nothing to see here
function doGet(e) {
  return ContentService.createTextOutput(
    "GET requests are not accepted at the moment. Please use POST requests instead."
  );
}

// Handle all requests
function doPost(e) {
  initialize();
  let outputJSON;
  let response;
  let params;
  let UserData;

  try {
    params = e.parameters;
    UserData = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("400 Bad Request");
  }

  // Check for Bad request
  if (!params.hasOwnProperty("route")) {
    return ContentService.createTextOutput("400 Bad Request");
  }

  // Check API key
  if (!(UserData.API === API_KEY)) {
    outputJSON = { message: "Key Invalid" };
    outputJSON = JSON.stringify(outputJSON);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  // Check email
  let permissions = verifyEmail_(UserData);
  if (permissions == "Not found") {
    outputJSON = { message: "Email not in system" };
    outputJSON = JSON.stringify(outputJSON);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (permissions == "Error") {
    outputJSON = { message: "Error in sheets" };
    outputJSON = JSON.stringify(outputJSON);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  // Route tree
  if (params.route == "data") {
    outputJSON = getSchedule_(permissions);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (params.route == "edit" && permissions == "edit") {
    response = editSchedule_(UserData);
    return ContentService.createTextOutput(response);
  } else if (params.route == "edit" && permissions != "edit") {
    return ContentService.createTextOutput(
      "Access denied. Email with edit rights required"
    );
  } else {
    return ContentService.createTextOutput("400 Bad Request");
  }
}

function getSchedule_(permissions) {
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
    permissions: permissions,
    schedule: [],
    drivers: [],
    destinations: [],
  };
  let cell;

  const scheduleSheet = sApp.getSheetByName(SCHEDULE_SHEET_NAME);
  const configSheet = sApp.getSheetByName(CONFIG_SHEET_NAME);

  // Get week length
  cell = scheduleSheet.getRange(1, 2);
  while (cell.getValue() != "") {
    weekLength++;
    cell = cell.offset(0, 1);
  }

  // Get materials
  cell = configSheet.getRange(1, 1);
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
  cell = configSheet.getRange(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "V??rit:") {
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
  cell = configSheet.getRange(1, 1);
  while (cell.getValue() != "") {
    if (cell.getValue() == "Kuljettajat:") {
      cell = cell.offset(1, 0);
      let nextCell;
      while (cell.getValue() != "") {
        nextCell = cell.offset(0, 1);
        driverColors[cell.getValue()] =
          colorSettings[nextCell.getValue()];
        driverItem["driver"] = cell.getValue();
        driverItem["color"] = colorSettings[nextCell.getValue()];
        results["drivers"].push({ ...driverItem });
        cell = cell.offset(1, 0);
      }
      break;
    }
    cell = cell.offset(0, 1);
  }

  // Fetch deliveries for each material
  cell = scheduleSheet.getRange(2, 1);
  while (cell.getValue() != "") {
    if (materials.includes(cell.getValue())) {
      materialRow["materialName"] = cell.getValue();
      cell = cell.offset(0, 1);

      for (let i = 0; i < weekLength; i++) {
        materialRow["data"].push([]);
        // Fetch data if there is any
        if (cell.getValue().replace(/[\s\n-]+/gi, "") != "") {
          for (let j = 0; j < MAX_DELIVERIES; j++) {
            cell = cell.offset(1, 0);
            cell = fetchDelivery_(cell, i, materialRow, driverColors);
          }
          cell = cell.offset(-6 * MAX_DELIVERIES, 0);
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
  cell = configSheet.getRange(1, 1);
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

function editSchedule_(pData) {
  let edits;
  let row;
  let column;
  let deliveryData = [];
  // Indicates the number of remaining driver entries to iterate
  let countRemaining;
  const dummyDelivery = {driver: "", destination: "", time: "", twoWay: "", info: ""};

  if (pData === undefined || !pData.hasOwnProperty("edits")) {
    Utils.Log.error("Taulukon muokkaus ep??onnistui: muokkaukset puuttuivat datasta");
    return "Edit failed: post data didn't have property 'edits'"
  }

  edits = pData.edits;
  sheet = sApp.getSheetByName(SCHEDULE_SHEET_NAME);

  for (let i = 0; i < edits.length; i++) {
    row = Utils.Cell.getRowByTitle(sheet, edits[i].materialName, 1);
    column = getColumnByWeekday_(edits[i].day);
    countRemaining = MAX_DELIVERIES;
    cell = sheet.getRange(row + 2, column);
    // Write populated entries
    deliveryData = edits[i].data;
    for (let j = 0; j < deliveryData.length; j++) {
      cell = addDelivery_(cell, deliveryData[j] );
      countRemaining--;
    }
    // Write empty entries
    for (countRemaining; countRemaining > 0; countRemaining--) {
      cell = addDelivery_(cell, dummyDelivery);
    }
  }

  Utils.Log.info("Taulukkoa muokattu onnistuneesti");
  return "Edit successful";
}

function verifyEmail_(pData) {
  if (pData === undefined || !pData.hasOwnProperty("email")) {
    return "No 'email' property"
  }
  const email = pData.email;
  const accessRights = getAccessRights_();
  const found = accessRights.find((element) => element.email == email);
  if (found === undefined) {
    return "Not found";
  }
  if (found.accessLevel === "edit") {
    return "edit";
  } else if (found.accessLevel === "watch") {
    return "watch";
  } else {
    return "Error";
  }
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
      settings = Utils.Settings.getByKey("Ty??ntekij??n " + index + " oikeudet");
      user["email"] = settings[0];
      user["accessLevel"] = settings[1];
      accessRights.push({ ...user });
      index++;
    } catch (e) {
      break;
    }
  }

  // Overwrite unwanted error message
  const sheet = sApp.getSheetByName(LOG_SHEET_NAME);
  const lastRow = sheet.getLastRow();
  const cell = sheet.getRange(lastRow, 1);
  cell.offset(0, 1).setValue("Info");
  cell.offset(0, 2).setValue("K??ytt??oikeudet haettu onnistuneesti");

  return accessRights;
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
  let driver, destination, time, info, twoWay;

  if (cell.getValue().trim() != "") {
    if (cell.getValue()[0] == "*") {
      twoWay = true;
    } else {
      twoWay = false;
    }
    driver = cell.offset(1, 0).getValue();
    destination = cell.offset(2, 0).getValue();
    time = cell.offset(3, 0).getValue();
    info = cell.offset(5, 0).getValue();
    materialRow["data"][index].push({
      driver: driver,
      destination: destination,
      time: time,
      info: info,
      twoWay: twoWay,
      color: driverColors[driver],
    });
  }

  cell = cell.offset(5, 0);
  return cell;
}

function addDelivery_(cell, data) {
  cell.setValue(data["driver"]);
  cell = cell.offset(1, 0);
  cell.setValue(data["destination"]);
  cell = cell.offset(1, 0);
  cell.setValue(data["time"]);
  cell = cell.offset(1, 0);

  if (data["twoWay"]) {
    cell.setValue("Meno-paluu");
  } else if (data["twoWay"] === false) {
    cell.setValue("Meno");
  } else if (data["twoWay"] == "") {
    cell.setValue("");
  }

  cell = cell.offset(1, 0);
  cell.setValue(data["info"]);
  cell = cell.offset(2, 0);

  return cell;
}
