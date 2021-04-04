// Converts all Excel files to Google spreadsheet files in Pinja folder and
// removes old Excel files.
// https://stackoverflow.com/questions/56063156/script-to-convert-xlsx-to-google-sheet-and-move-converted-file
function convertExcelFilesToSheets_() {
  const folder = DriveApp.getFolderById(PINJA_FOLDER_ID);
  const fileIterator = folder.getFiles();

  const fileHandlers = [];
  while (fileIterator.hasNext()) {
    fileHandlers.push(fileIterator.next());
  }

  for (let file of fileHandlers) {
    const mimeType = file.getMimeType();

    // Convert excel files to sheet files
    if (mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const fileName = file.getName();
      const blob = file.getBlob();
      const newFile = {title: fileName, parents: [{id: PINJA_FOLDER_ID}]};
      Drive.Files.insert(newFile, blob, {convert: true});
      // Remove old xlsx file
      Drive.Files.remove(file.getId());
      Utils.Log.info(`Muutettiin tiedosto: "${fileName}" Excel muodosta spreadsheet muotoon onnistuneesti.`);
    }
  }
}

// Load all spreadsheet files in Pinja folder and import data from them
// using importPinjaData_ function. Add results to the list.
function importPinjasFromFolder_(productList) {
  const folder = DriveApp.getFolderById(PINJA_FOLDER_ID);
  const files = folder.getFiles();
  const results = [];
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    const fileId = file.getId();

    // Skip non spreadsheet files
    if (mimeType != "application/vnd.google-apps.spreadsheet") {
      continue
    }

    const sApp = SpreadsheetApp.openById(fileId);
    const sheet = sApp.getSheets()[0];
    results.push(importPinjaData_(sheet, productList));
  }
  return results;
}

function mergeMultipleResults_(fileResults) {
  /* Merge results scraped from multiple files, with following rules.
     1. If value does not exist in another file, add it to merged results.
     2. If value exists allready, pick bigger value. */
  if (fileResults.length == 0) {
    return;
  }

  // Use first file as basis for merge
  const merged = fileResults[0];
  // Go through all files
  for (let fileIndex = 1; fileIndex < fileResults.length; fileIndex++) {
    // Go through all products in those files
    for (const product in fileResults[fileIndex]) {
      const productData = fileResults[fileIndex][product]
      if (!Object.prototype.hasOwnProperty.call(fileResults[fileIndex], product)) {
          continue;
      }
      // Go through all directions (in, out) in those products
      for (const direction in productData) {
        const directionData = productData[direction];
        if (!Object.prototype.hasOwnProperty.call(productData, direction)) {
            continue;
        }
        // Go through all date entries in dataset
        for (const date in directionData) {
          const dateData = directionData[date];
          if (!Object.prototype.hasOwnProperty.call(directionData, date)) {
              continue;
          }
          // Actual merging
          if (!merged[product][direction][date] ||
              merged[product][direction][date] < dateData) {
            merged[product][direction][date] = dateData;
          }
        }
      }
    }
  }
  Utils.Log.info(`Yhdistettiin Pinjan tiedostot onnistuneesti ${fileResults.length} tiedostosta.`);
  return merged;
}

function importPinjaData(productList) {
  initialize();
  convertExcelFilesToSheets_();
  const fileResults = importPinjasFromFolder_(productList);
  const results = mergeMultipleResults_(fileResults);
  return results;
}