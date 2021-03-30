/************************************************** */
// CONSTANTS
/************************************************** */
SCHEDULE_SHEET_NAME = "Nykyinen viikko";
MATERIAL_SHEET_NAME = "Kuljettajat & kohteet";

// The script needs to be deployed in the sheet's context
const ss = SpreadsheetApp.getActive();
const Utils = new RemeoUtils.Instance();
Utils.setSApp(ss);
WATCH_PW = Utils.Settings.getByKey("Katseluoikeudet")[1];
EDIT_PW = Utils.Settings.getByKey("Muokkausoikeudet")[1];

const JWT_KEY = "REPLACE_JWT_KEY";



/************************************************** */
// ACTUAL WEB APP
/************************************************** */
const sheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
const materialSheet = ss.getSheetByName(MATERIAL_SHEET_NAME);
const range = sheet.getDataRange();
const materialRange = materialSheet.getDataRange();


// TODO: replace logger
//Logger = BetterLog.useSpreadsheet(SS_ID); 


// Nothing to see here
function doGet(e) {
  return true;
}

// Routes for login, watch and edit
function doPost(e) {
  let outputJSON;
  let response;
  const params = e.parameters;

  //Logger.log(JSON.stringify(e));
  
  if (params.hasOwnProperty("route") && params.route == "login") {
    outputJSON = loginUser_(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (params.hasOwnProperty("route") && params.route == "watch") {
    outputJSON = getSchedule_(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (params.hasOwnProperty("route") && params.route == "edit") {
    response = editSchedule_(e);
    return ContentService.createTextOutput(response);
  } else {
    return ContentService.createTextOutput("400 Bad Request: 'route' parameter wasn't used correctly");
  }
}

// Checks if credentials are correct and returns JWT or error.
function loginUser_(e) {
  let data = e.postData.contents;
  data = JSON.parse(data);
  let outputJSON = "";

  // If user wants to get edit rights
  if (data.hasOwnProperty("edit") && data.edit == EDIT_PW) {
    let accessToken = createJwt_({
      JWT_KEY,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "edit"
      },
    });
    outputJSON = { JWT: accessToken, message: "Success!" };
    outputJSON = JSON.stringify(outputJSON);
    //Logger.log("Log in path was used with edit rights.");

  // If user wants read only rights
  } else if (data.hasOwnProperty("watch") && data.watch == WATCH_PW) {
    let accessToken = createJwt_({
      JWT_KEY,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "watch"
      },
    });
    outputJSON = { JWT: accessToken, message: "Success!" };
    outputJSON = JSON.stringify(outputJSON);
    //Logger.log("Log in path was used with watch rights.");

  // If no match
  } else {
    //Logger.log("Log in path was used. Credentials did not match.");
    outputJSON = { JWT: null, message: "Failure!" };
    outputJSON = JSON.stringify(outputJSON);
  }

  return outputJSON;
}

function getSchedule_(e) {
  let pData = e.postData.contents;
  pData = JSON.parse(pData);

  if (pData.hasOwnProperty("jwt") ) {
    let parsedJWT = parseJwt_(pData.jwt, JWT_KEY);
    if (parsedJWT.valid && (parsedJWT.data.rights == "watch" || parsedJWT.data.rights == "edit")) {
      
      let weekLength = 0;
      let materials = [];
      let colorSettings = {};
      let driverColors = {};
      let materialRow = {
        materialName: "",
        data: []
      };
      let driverItem = {
        driver: "",
        color: ""
      };
      let results = {
        schedule: [],
        drivers: [],
        destinations: []
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
            colorSettings[[cell.getValue().substring(0, cell.getValue().indexOf(":"))]] = cell.getValue().split(":").pop();
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
            driverColors[cell.getValue()] = colorSettings[cell.offset(0, 1).getValue()];
            driverItem["driver"] = cell.getValue();
            driverItem["color"] = colorSettings[cell.offset(0, 1).getValue()];
            results["drivers"].push({...driverItem});
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

          results["schedule"].push({...materialRow});
          materialRow["data"] = [];
          cell = cell.offset(0, -weekLength-1);
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

      // Return the results
      let outputJSON = JSON.stringify(results);
      return outputJSON;
    }
  } 

  //Logger.log("Error in using watch route.");
  return false;
}

function editSchedule_(e) {
  let pData = e.postData.contents;
  pData = JSON.parse(pData);

  if (pData.hasOwnProperty("jwt") ) {
    let parsedJWT = parseJwt_(pData.jwt, JWT_KEY);
    if (parsedJWT.valid && parsedJWT.data.rights == "edit") {
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
        cell = range.getCell(row+2, column);
        // Write populated entries
        data = edits[i].data;
        for (let j = 0; j < data.length; j++) {
          cell = addDelivery_(cell, data[j].dayItem, data[j].twoWay, data[j].dayInfo);
          countRemaining--;
        }
        // Write empty entries
        for (countRemaining; countRemaining > 0; countRemaining--) {
          cell = addDelivery_(cell, "", "", "");
        }
      }

      return "Edit successful";
    }
  }

  //Logger.log("Error in using edit route.");
  return false;
}

function getColumnByWeekday_(day) {
  weekdayColumns = {"Maanantai": 2, "Tiistai": 3,"Keskiviikko": 4, "Torstai": 5, "Perjantai": 6, "Lauantai": 7, "Sunnuntai": 8};
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
    cellContent = cell.getDisplayValue().replace(/(^\*+|\*+$)/mg, "");
    materialRow["data"][index].push({dayItem: cellContent.split(" ").slice(0, 3).join(" "), 
                                dayInfo: cellContent.split(" ").slice(3).join(" "), 
                                twoWay: isTwoWay,
                                color: driverColors[cellContent.split(" ")[0]]
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



/************************************************** */
// JWT Service - Source: Amit Agarwal https://www.labnol.org/code/json-web-token-201128
/************************************************** */
const createJwt_ = ({ JWT_KEY, expiresInHours, data = {} }) => {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Date.now();
  const expires = new Date(now);
  expires.setHours(expires.getHours() + expiresInHours);

  // iat = issued time, exp = expiration time
  const payload = {
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000),
  };

  // Add user payload
  Object.keys(data).forEach(function (key) {
    payload[key] = data[key];
  });

  const base64Encode = (text, json = true) => {
    const data = json ? JSON.stringify(text) : text;
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, "");
  };

  const toSign = `${base64Encode(header)}.${base64Encode(payload)}`;
  const signatureBytes = Utilities.computeHmacSha256Signature(
    toSign,
    JWT_KEY
  );
  const signature = base64Encode(signatureBytes, false);
  return `${toSign}.${signature}`;
};

const parseJwt_ = (jsonWebToken, JWT_KEY) => {
  const [header, payload, signature] = jsonWebToken.split(".");
  const signatureBytes = Utilities.computeHmacSha256Signature(
    `${header}.${payload}`,
    JWT_KEY
  );
  const validSignature = Utilities.base64EncodeWebSafe(signatureBytes);
  if (signature === validSignature.replace(/=+$/, "")) {
    const blob = Utilities.newBlob(
    Utilities.base64Decode(payload)
    ).getDataAsString();
    const { exp, ...data } = JSON.parse(blob);
    if (new Date(exp * 1000) < new Date()) {
    return { valid: false, data: null };
    }
    return { valid: true, data: data };

  } else {
    return { valid: false, data: null };
  }
};