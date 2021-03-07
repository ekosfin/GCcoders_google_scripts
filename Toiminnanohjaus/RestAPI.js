// Replace the spreadsheet id (SS_ID) below after changing spreadsheet
const SS_ID = "REPLACE_SS_ID";
const SCHEDULE_SHEET = "Nykyinen viikko";
const MATERIAL_SHEET = "Kuljettajat & kohteet";
const CONFIG_SHEET = "Asetukset";
const JWT_KEY = "REPLACE_JWT_KEY";

const ss = SpreadsheetApp.openById(SS_ID);
const sheet = ss.getSheetByName(SCHEDULE_SHEET);
const materialSheet = ss.getSheetByName(MATERIAL_SHEET);
const range = sheet.getDataRange();
const materialRange = materialSheet.getDataRange();
const configSheet = ss.getSheetByName(CONFIG_SHEET);
const privateKey = JWT_KEY;

// This could be done in a more sophisticated way
const edit = configSheet.getRange(3, 3).getValue();
const editPW = configSheet.getRange(3, 4).getValue();
const watch = configSheet.getRange(2, 3).getValue();
const watchPW = configSheet.getRange(2, 4).getValue();

// Betterlog setup. Now logger will log to own subsheet called 'log'. Remember to add it to project library.
// Source: https://github.com/peterherrmann/BetterLog
Logger = BetterLog.useSpreadsheet(SS_ID);

// Nothing to see here
function doGet(e) {
  return true;
}

// Routes for login and watch
function doPost(e) {
  let params = e.parameters;
  Logger.log(JSON.stringify(e));

  let outputJSON = "";
  if (params.hasOwnProperty("route") && params.route == "login") {
    outputJSON = loginRoute(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (params.hasOwnProperty("route") && params.route == "watch") {
    outputJSON = getSchedule(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(
      ContentService.MimeType.JSON
    );

    // } else if (params.hasOwnProperty('route') && params.route == 'edit') {
    //   let response = editRoute(e);
    //   return ContentService.createTextOutput(response);
  } else {
    return ContentService.createTextOutput("Failure");
  }
}

// Checks if credentials are correct and returns JWT or error.
function loginRoute(e) {
  let data = e.postData.contents;
  data = JSON.parse(data);
  let outputJSON = "";

  // If user wants to get edit rights
  if (data.hasOwnProperty("edit") && data.edit == editPW) {
    let accessToken = createJwt({
      privateKey,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "edit",
      },
    });
    outputJSON = { JWT: accessToken, message: "Success!" };
    outputJSON = JSON.stringify(outputJSON);
    Logger.log("Log in path was used with edit rights.");

    // If user wants read only rights so right to see the sheet.
  } else if (data.hasOwnProperty("watch") && data.watch == watchPW) {
    let accessToken = createJwt({
      privateKey,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "watch",
      },
    });
    outputJSON = { JWT: accessToken, message: "Success!" };
    outputJSON = JSON.stringify(outputJSON);
    Logger.log("Log in path was used with watch rights.");

    // Invalid request, credentials and so on... -> So this is the error path.
  } else {
    Logger.log("Log in path was used. Credentials did not match.");
    outputJSON = { JWT: null, message: "Failure!" };
    outputJSON = JSON.stringify(outputJSON);
  }
  return outputJSON;
}

function getSchedule(e) {
  // Authenticate user
  let pData = e.postData.contents;
  pData = JSON.parse(pData);
  if (pData.hasOwnProperty("jwt")) {
    let parsedJWT = parseJwt(pData.jwt, privateKey);
    if (parsedJWT.valid && parsedJWT.data.rights == ("watch" || "edit")) {
      let weekdays = [];
      let weekday;
      let materials = [];
      let material;
      let schedule = {};
      let cell;

      // Get weekdays and push them to schedule
      cell = range.getCell(1, 2);
      while ((weekday = cell.getValue()) != "") {
        weekdays.push(weekday);
        schedule[weekday] = [];
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

      // Create matrix
      cell = range.getCell(2, 1);
      while (cell.getValue() != "") {
        if (materials.includes(cell.getValue())) {
          material = cell.getValue();
          for (let i = 0; i < weekdays.length; i++) {
            cell = cell.offset(0, 1);
            if (cell.getDisplayValue().trim() != "")
              schedule[weekdays[i]].push({
                [material]: cell.getDisplayValue(),
              });
          }
          cell = cell.offset(0, -weekdays.length);
        }
        cell = cell.offset(1, 0);
      }

      // Return the results
      let outputJSON = JSON.stringify(schedule);
      return outputJSON;
    }
  }
  Logger.log("Edit path was used. Error.");
  return "Failure";
}

// function editRoute(e) {
//   let pData = e.postData.contents;
//   pData = JSON.parse(pData);
//   if(pData.hasOwnProperty('jwt') ) {
//     let parsedJWT = parseJwt(pData.jwt, privateKey)
//     if(parsedJWT.valid && parsedJWT.data.rights == "edit") {
//       sheet.getRange(4,1).setValue(pData.string);
//       return "success";
//     }
//   }
//   Logger.log('Error in using edit route.');
//   return "Failure";
// }

/************************************************** */
// JWT Source: Amit Agarwal https://www.labnol.org/code/json-web-token-201128
/************************************************** */

const createJwt = ({ privateKey, expiresInHours, data = {} }) => {
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

  // add user payload
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
    privateKey
  );
  const signature = base64Encode(signatureBytes, false);
  return `${toSign}.${signature}`;
};

const parseJwt = (jsonWebToken, privateKey) => {
  const [header, payload, signature] = jsonWebToken.split(".");
  const signatureBytes = Utilities.computeHmacSha256Signature(
    `${header}.${payload}`,
    privateKey
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
