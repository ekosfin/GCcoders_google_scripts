/************************************************** */
// CONSTANTS
/************************************************** */
const SS_ID = "REPLACE_SS_ID";
const SCHEDULE_SHEET_NAME = 'Nykyinen viikko';
const MATERIAL_SHEET_NAME = 'Kuljettajat & kohteet';

const ss = SpreadsheetApp.openById(SS_ID);
RemeoUtils.setSApp(ss);
WATCH_PW = RemeoUtils.getSettingByKey("Katseluoikeudet")[1];
EDIT_PW = RemeoUtils.getSettingByKey("Muokkausoikeudet")[1];

const JWT_KEY = "REPLACE_JWT_KEY";



/************************************************** */
// ACTUAL WEB APP
/************************************************** */
const sheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
const materialSheet = ss.getSheetByName(MATERIAL_SHEET_NAME);
const range = sheet.getDataRange();
const materialRange = materialSheet.getDataRange();


// TODO: replace with RemeoUtils logger???
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
  if (params.hasOwnProperty('route') && params.route == 'login') {
    outputJSON = loginRoute(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(ContentService.MimeType.JSON);

  } else if(params.hasOwnProperty('route') && params.route == 'watch') {
    outputJSON = getSchedule(e);
    return ContentService.createTextOutput(outputJSON).setMimeType(ContentService.MimeType.JSON);

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
  let outputJSON = ""

  // If user wants to get edit rights
  if(data.hasOwnProperty('edit') && data.edit == EDIT_PW) {
    let accessToken = createJwt({
      JWT_KEY,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "edit"
      },
    });
    outputJSON = {JWT: accessToken, message: "Success!"};
    outputJSON = JSON.stringify(outputJSON);
    Logger.log('Log in path was used with edit rights.');

  // If user wants read only rights so right to see the sheet.
  } else if (data.hasOwnProperty('watch') && data.watch == WATCH_PW) {
    let accessToken = createJwt({
      JWT_KEY,
      expiresInHours: 6, // expires in 6 hours
      data: {
        rights: "watch"
      },
    });
    outputJSON = {JWT: accessToken, message: "Success!"};
    outputJSON = JSON.stringify(outputJSON);
    Logger.log('Log in path was used with watch rights.');

  // Invalid request, credentials and so on... -> So this is the error path.
  } else {
    Logger.log('Log in path was used. Credentials did not match.');
    outputJSON = {JWT: null, message: "Failure!"};
    outputJSON = JSON.stringify(outputJSON);
  }
  return outputJSON;
}

function getSchedule(e) {
  // Authenticate user
  let pData = e.postData.contents;
  pData = JSON.parse(pData);
  if(pData.hasOwnProperty('jwt') ) {
    let parsedJWT = parseJwt(pData.jwt, JWT_KEY);
    if(parsedJWT.valid && parsedJWT.data.rights == ('watch' || 'edit')) {
      
      let weekLength = 0;
      let materials = [];
      let colorSettings = {};
      let driverColors = {};
      let materialRow = {
        materialName: "",
        data: []
      };
      let schedule = [];
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
          break
        }
        cell = cell.offset(0, 1);
      }

      // Get color settings
      cell = materialRange.getCell(1, 1);
      while (cell.getValue() != "") {
        if (cell.getValue() == "Värit:") {
          cell = cell.offset(1, 0);
          while (cell.getValue() != "") {
            colorSettings[[cell.getValue().substring(0, cell.getValue().indexOf(":"))]] = cell.getValue().split(':').pop();
            cell = cell.offset(1, 0);
          }
          break
        }
        cell = cell.offset(0, 1);
      }

      // Assign colors based on driver types
      cell = materialRange.getCell(1, 1);
      while (cell.getValue() != "") {
        if (cell.getValue() == "Kuljettajat:") {
          cell = cell.offset(1, 0);
          while (cell.getValue() != "") {
            driverColors[cell.getValue()] = colorSettings[cell.offset(0, 1).getValue()];
            cell = cell.offset(1, 0);
          }
          break
        }
        cell = cell.offset(0, 1);
      }

      // Fetch data for each material
      cell = range.getCell(2, 1);
      while (cell.getValue() != "") {
        if (materials.includes(cell.getValue())) {
          materialRow["materialName"] = cell.getValue();
          cell = cell.offset(0, 1);
          for (let i = 0; i < weekLength; i++) {
            materialRow["data"].push([]);
            // Fetch data if there is any
            if (cell.getDisplayValue().replace(/[\s\n-]+/gi, '') != "") {
              cell = cell.offset(1, 0);
              if (cell.getDisplayValue().trim() != "") {
                materialRow["data"][i].push({dayItem: cell.getDisplayValue().split(' ').slice(0, 3).join(' '), 
                                            dayInfo: cell.getDisplayValue().split(' ').slice(3).join(' '), 
                                            color: driverColors[cell.getDisplayValue().split(' ')[0]]
                                            });
              }
              cell = cell.offset(5, 0);
              if (cell.getDisplayValue().trim() != "") {
                materialRow["data"][i].push({dayItem: cell.getDisplayValue().split(' ').slice(0, 3).join(' '), 
                                            dayInfo: cell.getDisplayValue().split(' ').slice(3).join(' '), 
                                            color: driverColors[cell.getDisplayValue().split(' ')[0]]
                                            });
              }
              cell = cell.offset(-6, 0);
            }
            cell = cell.offset(0, 1);
          }

          schedule.push({...materialRow});
          
          materialRow["data"] = [];
          cell = cell.offset(0, -weekLength-1);
        }
        cell = cell.offset(1, 0);
      }

      // Return the results
      let outputJSON = JSON.stringify(schedule);
      return outputJSON;
    }
  } 
  Logger.log('Edit path was used. Error.');
  return "Failure";
}

// function editRoute(e) {
//   let pData = e.postData.contents;
//   pData = JSON.parse(pData);
//   if(pData.hasOwnProperty('jwt') ) {
//     let parsedJWT = parseJwt(pData.jwt, JWT_KEY)
//     if(parsedJWT.valid && parsedJWT.data.rights == "edit") {
//       sheet.getRange(4,1).setValue(pData.string);
//       return "success";
//     }
//   } 
//   Logger.log('Error in using edit route.');
//   return "Failure";
// }



/************************************************** */
// JWT - Source: Amit Agarwal https://www.labnol.org/code/json-web-token-201128
/************************************************** */

const createJwt = ({ JWT_KEY, expiresInHours, data = {} }) => {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: 'HS256',
    typ: 'JWT',
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
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, '');
  };

  const toSign = `${base64Encode(header)}.${base64Encode(payload)}`;
  const signatureBytes = Utilities.computeHmacSha256Signature(
    toSign,
    JWT_KEY
  );
  const signature = base64Encode(signatureBytes, false);
  return `${toSign}.${signature}`;
};

const parseJwt = (jsonWebToken, JWT_KEY) => {
  const [header, payload, signature] = jsonWebToken.split('.');
  const signatureBytes = Utilities.computeHmacSha256Signature(
    `${header}.${payload}`,
    JWT_KEY
  );
  const validSignature = Utilities.base64EncodeWebSafe(signatureBytes);
  if (signature === validSignature.replace(/=+$/, '')) {
    const blob = Utilities.newBlob(
    Utilities.base64Decode(payload)
    ).getDataAsString();
    const { exp, ...data } = JSON.parse(blob);
    if (new Date(exp * 1000) < new Date()) {
    return {valid: false, data: null};
    }
    return {valid: true, data: data};

  } else {
    return {valid: false, data:null};
  }
};
