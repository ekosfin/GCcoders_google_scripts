// Try to get tittle row number based on the key on a row
function getTitleRow_(sheet) {
  const textFinder = sheet.createTextFinder(PINJA_TITLE_ROW_IDENTIFIER);
  const candidates = textFinder.findAll();
  if (candidates.length == 0) {
    Utils.Log.error(`Otsake rivin sijaintia ei löytynyt avaimella ${PINJA_TITLE_ROW_IDENTIFIER}`);
    throw ("couldn't find title row with the specified key")
  }
  return candidates[0].getRow();
}

function getProductAproximation_(productList, string) {
  // Try first full match for a product name
  for (const productCandidate of productList) {
    if (productCandidate == string) {
      return productCandidate;
    }
  };

  // If full match does not work, try wider match that succes,
  // if name is even included partly on the list
  for (const productCandidate of productList) {
    if (string.includes(productCandidate)) {
      return productCandidate;
    }
  };
  return undefined;
}

/* imports raw data from Pinja sheet and compresses it into following format:
  {"10.2.2021": [
      {
        product: "Betoni",
        type: "in",
        weight: 5.6
      },
      {
        product: "Patjat",
        type: "out",
        weight: 0.45
      }
    ],
    "11.2.2021": [
      {
        product: "Alite",
        type: "in",
        weight: 2.1
      }
    ],
  }
*/
function scrapeData_(sheet, titleRow, productList) {
  // Minus 1, because in memory table indexing starts from zero
  let productColumn;
  let typeColumn;
  let weightColumn;
  try {
    productColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_PRODUCT_COLUMN_IDENTIFIER, titleRow) - 1;
    typeColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_TYPE_COLUMN_IDENTIFIER, titleRow) - 1;
    weightColumn = Utils.Cell.getColumnByTitle(sheet, PINJA_WEIGHT_COLUMN_IDENTIFIER, titleRow) - 1;
  } catch (error) {
    Utils.Log.error(`Otsikkoa ei löytynyt pinjasta.`);
    Utils.Log.error(error);
    throw error;
  }

  // Read whole table into memory to speed up reading
  const table = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getValues();

  const results = {};
  let currentDate;
  // Go through every row starting from title row
  for (let row = titleRow; row < table.length; row++) {

    // Update current date, if possible
    // This function needs updating in the future, if the date changes
    const newDateCandidate = table[row][PINJA_DATE_COLUMN - 1].match(PINJA_DATE_REGEX);
    if (newDateCandidate != null) {
      const newDateSplit = newDateCandidate[0].split(".");
      // Months start from 0
      currentDate = new Date(newDateSplit[2], newDateSplit[1] - 1, newDateSplit[0], 5)
      currentDate = currentDate.toUTCString();
      if (!results[currentDate]) {
        results[currentDate] = [];
      }
    }
    // Skip if date is still not defined
    if (!currentDate) {
      continue;
    }

    const productRaw = table[row][productColumn].match(PINJA_PRODUCT_CLEANUP_REGEX);
    // No empty products
    if (!productRaw) {
      continue;
    }
    const product = getProductAproximation_(productList, productRaw[0].trim());
    // No products that are not on the product list
    if (!product) {
      continue;
    }

    let type;
    const rawType = table[row][typeColumn];
    // Find direction of the item
    if (rawType.match(PINJA_TYPE_IN_REGEX)) {
      type = DIRECTIONS.IN;
    } else if (rawType.match(PINJA_TYPE_OUT_REGEX)) {
      type = DIRECTIONS.OUT;
    } else {
      // There must be a proper type
      continue;
    }

    const weight = parseFloat(table[row][weightColumn]);

    if (isNaN(weight)) {
      // Skip if weight is not a number
      continue;
    }
    
    const entry = {product: product, type: type, weight: weight};
    // Save under current date as last entry
    results[currentDate].push(entry);
  }
  Utils.Log.info(`Tuotiin ${results.length} päivää Pinjan tiedostosta onnistuneesti.`);
  return results;
}

/* Converts data produced by scrapeData_ function into following form:
  {"Betoni": {
      "in": {
        "10.2.2021": 5.6
      },
      "out": {}
    },
    "Patjat": {
      "in": {},
      "out": {
        "10.2.2021": 0.45
      }
    },
    "Alite": {
      "in": {
        "11.2.2021": 2.1
      },
      "out": {}
    }
  }
*/
function organizeByProductAndDate_(scrapedData, productList) {
  // Convert product list to object keys
  const dataByProduct = productList.reduce((item,index)=> (item[index]={out: {}, in: {}},item),{});
  
  // Go through scraped data and organize entries to correct places
  // https://stackoverflow.com/questions/8312459/iterate-through-object-properties
  for (let date in scrapedData) {
    if (!Object.prototype.hasOwnProperty.call(scrapedData, date)) {
        continue;
    }
    const dateData = scrapedData[date];
    dateData.forEach((entry, _) => {
      // Check is it a proper product that can be imported
      if (!dataByProduct[entry.product]) {
        return;
      }

      // Is this product initialized on this date?
      if (!dataByProduct[entry.product][entry.type][date]) {
        dataByProduct[entry.product][entry.type][date] = 0;
      }
      dataByProduct[entry.product][entry.type][date] += entry.weight;
    });
  }
  Utils.Log.info("Ryhmiteltiin Pinjan data tuotteittain ja päivittäin.");
  return dataByProduct;
}

function importPinjaData_(sheet, productList) {
  const titleRow = getTitleRow_(sheet);
  const scrapedData = scrapeData_(sheet, titleRow, productList);
  const organizedData = organizeByProductAndDate_(scrapedData, productList);
  return organizedData;
}
