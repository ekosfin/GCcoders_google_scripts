// https://stackoverflow.com/questions/56063156/script-to-convert-xlsx-to-google-sheet-and-move-converted-file
function convertExcelFilesToSheets_() {
  const folder = DriveApp.getFolderById(PINJA_FOLDER_ID);
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();

    // Convert excel files to sheet files
    if (mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const fileName = file.getName();
      const blob = file.getBlob();
      const newFile = {title: fileName, parents: [{id: PINJA_FOLDER_ID}]};
      Drive.Files.insert(newFile, blob, {convert: true});
      // Remove old xlsx file
      Drive.Files.remove(file.getId());
    }
  }
}

function importPinjasFromFolder_(productList) {
  const folder = DriveApp.getFolderById(PINJA_FOLDER_ID);
  const files = folder.getFiles();
  const results = [];
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    const fileId = file.getId();

    // Convert excel files to sheet files
    if (mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
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
  for (let fileIndex = 0; fileIndex < fileResults.length; fileIndex++) {
    for (const product in fileResults[fileIndex]) {
      const productData = fileResults[fileIndex][product]
      if (!Object.prototype.hasOwnProperty.call(fileResults[fileIndex], product)) {
          continue;
      }
      for (const direction in productData) {
        const directionData = productData[direction];
        if (!Object.prototype.hasOwnProperty.call(productData, direction)) {
            continue;
        }
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
  return merged;
}

function importPinjaData(productList) {
  initialize();
  convertExcelFilesToSheets_();
  const fileResults = importPinjasFromFolder_(productList);
  const results = mergeMultipleResults_(fileResults);
  return results;
}

function testImportPinjasFromFolder() {
  const productList = `Alite
Arvometallit
Asbesti
Asfaltti
Betoni
Betoni 100-500 mm
Betoni alle 100 mm
Betoni yli 500 mm
Betoni, tiili ja muu kiviaines
Biojäte pakattu
Bitumi
bitumihuopa
Bojäte pakkaamaton
Energiajäte
Eristevilla
HDPE Muovi
Huonekalut
Irtotavara ST1-P
Kaapelit
Kartonki 5.02
Kartonkipaali 5.02
Kaukolämpöputki
Keräyslasi
Kierrätysmetalli
Kierrätyspuu A
Kierrätyspuu B
Kierrätyspuu C
Kierrätyspuu D
Kierrätyspuuhake
Kipsi
kotikeräyspaperi 1.09
Kovat Muovit
Kumi
Kuormalavat
kylmälaitteet
Laboratoriolasi
Lasikuitu
LDPE kirkas irto
LDPE kirkas paali
LDPE värillinen irto
LDPE värillinen paali
Leipäjäte Lidl Janakkala ST1-L
Lyijyakut
Maa-ainekset
Metsäpuu, kannot ja risut
Metsäpuuhake
Muovipakkaukset
Pahvi 1.05
Pahvipaali 1.05
Pakattu leipä ST1
Palosammuttimet
Paperi
Patjat
Pilaantuneet maa-ainekset
Posliini
PP Muovit
Punnituspalvelu
Purkuikkunat
Purkujäte
Purkupuu
Puupuru
PVC Muovi
Rakennusjäte
Rakennusjäte - sis. betoni
Rakennusjäte 1 laatu, yli 50%
Rakennusjäte 2 laatu, alle 50%
Rengasmurske
Renkaat
Reunanauha 2.03
Romuajoneuvot
Ruostumattomat teräkset
Sairaalalasi
Sekajäte/polttokelpoinen jäte
Sekapelti
SER-jäte
SRF kierrätyspolttoaine
Suursäkit
Taikina ST1-E
Talkoojäte
Tasolasi
Tekstiilit
Tietosuojapaperi
Toimistopaperi 3.10
Tuulilasit
Vaaralliset jätteet
Viira`.split("\n");
  const results = importPinjaData(productList)
  console.log(JSON.stringify(results));
}