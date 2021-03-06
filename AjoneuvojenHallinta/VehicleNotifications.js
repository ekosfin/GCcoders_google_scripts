const NOTIFICATION_SETTING_NAME = "Muistutukset";
const NOTIFICATION_BEFORE_SETTING_NAME = "Muistutukset ennen";
const NOTIFICATION_FINAL_SETTING_NAME = "Viimeinen muistutus";
const NOTIFICATION_EMAIL_LIST_SETTING_NAME = "Muistutukset osoitteisiin";

const VEHICLE_SHEET_NAME = "Ajoneuvot";
const VEHICLE_TITTLE_ROW = 0;
const VEHICLE_NAME_TITLE = "Nimi";
const VEHICLE_NUMBER_TITLE = "Ajoneuvonumero";
const VEHICLE_REGISTER_NUMBER_TITLE = "Rekisterinumero";
const PROPERTY_PREFIX = "NOTIFICATION_SENT_";

function loadNotificationConfigurations() {
  const notificationTitles = Utils.Settings.getByKey(NOTIFICATION_SETTING_NAME);
  const notificationBefore = Utils.Settings.getByKey(NOTIFICATION_BEFORE_SETTING_NAME);
  const notificationFinalRemainder = parseInt(Utils.Settings.getByKey(NOTIFICATION_FINAL_SETTING_NAME)[0]);
  const notificationEmailList = Utils.Settings.getByKey(NOTIFICATION_EMAIL_LIST_SETTING_NAME);
  const notificationSettings = [];
  for (let parameter = 0; parameter < notificationTitles.length; parameter++) {
    if (!notificationTitles[parameter]) {
      continue;
    }

    const before = notificationBefore[parameter] ? parseInt(notificationBefore[parameter]) : 0;
    const notificationSetting = {name: notificationTitles[parameter], before: before};
    notificationSettings.push(notificationSetting);
  }

  // Cleanup enpty entries from email list
  const cleanedMotificationEmailList = [];
  for (email of notificationEmailList) {
    if (email) cleanedMotificationEmailList.push(email);
  }
  return [notificationSettings, notificationFinalRemainder, cleanedMotificationEmailList];
}

/* Produces list of different vehicles with list of notifications
    [
      {
        name: "Test vehicle #1",
        notifications: [
          {
            before: 30,
            date: 2021-01-05T03:00:00.000Z,
            name: "Katsastus",
          },
          {
            before: 30,
            date: 2022-01-01T03:00:00.000Z,
            name: "Määräaikaishuolto",
          },
        ],
        number: "101",
        registerNumber: "abc-123",
      },
    ]
*/
function getVehicleDetails(notificationSettings) {
  // Retrieve vehicle sheet data
  const vSheet = sApp.getSheetByName(VEHICLE_SHEET_NAME);
  const table = vSheet.getRange(1, 1, vSheet.getMaxRows(), vSheet.getMaxColumns()).getValues();
  const nameColumn = Utils.Cell.getColumnByTitleInMemory(table, VEHICLE_NAME_TITLE, VEHICLE_TITTLE_ROW);
  const numberColumn = Utils.Cell.getColumnByTitleInMemory(table, VEHICLE_NUMBER_TITLE, VEHICLE_TITTLE_ROW);
  const registerNumberColumn = Utils.Cell.getColumnByTitleInMemory(table, VEHICLE_REGISTER_NUMBER_TITLE, VEHICLE_TITTLE_ROW);
  const lastRow = Utils.Cell.getFirstEmptyRow(vSheet) - 1;

  const notificationColumns = [];
  for (let setting of notificationSettings) {
    notificationColumns.push(Utils.Cell.getColumnByTitleInMemory(table, setting.name, VEHICLE_TITTLE_ROW));
  }

  // Construct vehicle list
  const vehicles = []
  for (let row = VEHICLE_TITTLE_ROW + 1; row < lastRow; row++) {
    const vehicle = {};
    vehicle.name = table[row][nameColumn];
    vehicle.number = table[row][numberColumn];
    vehicle.registerNumber = table[row][registerNumberColumn];

    const notifications = [];
    for (let [columnIndex, column] of notificationColumns.entries()) {
      const newDateCandidate = table[row][column];
      if (newDateCandidate == "") {
        continue;
      } else if (!newDateCandidate.match(/[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}/)) {
        Utils.Log.error("Päivämäärä ei vastannut formatointia dd.mm.yyyy ajoneuvolistassa.");
        continue;
      }
      const newDateSplit = newDateCandidate.split(".");
      // Months start from 0
      const notificationDate = new Date(newDateSplit[2], newDateSplit[1] - 1, newDateSplit[0], 5);

      const notification = {};
      notification.name = notificationSettings[columnIndex].name;
      notification.before = notificationSettings[columnIndex].before;
      notification.date = notificationDate;
      notifications.push(notification);
    }

    vehicle.notifications = notifications;
    vehicles.push(vehicle);
  }

  return vehicles;
}

/* Filters list of vehicles based on the notification expiry.
   Vehicles with expiring notifications will be included in the produced list.
  [
    {
      expiryDate: new Date("2021-01-05T03:00:00.000Z"),
      expiryName: "Katsastus",
      name: "Test vehicle #1",
      number: "101",
      registerNumber: "abc-123",
      urgent: true,
    },
    {
      expiryDate: new Date("2021-01-10T03:00:00.000Z"),
      expiryName: "Katsastus",
      name: "Test vehicle #2",
      number: "102",
      registerNumber: "def-456",
      urgent: false,
    },
    {
      expiryDate: new Date("2021-01-15T03:00:00.000Z"),
      expiryName: "Määräaikaishuolto",
      name: "Test vehicle #3",
      number: "103",
      registerNumber: "ghi-789",
      urgent: false,
    },
  ];
*/
function filterOnlyExpiring(vehicles, notificationFinalRemainder) {
  const dts = 1000 * 60 * 60 * 24;
  const currentDate = new Date();
  const expiringVehicles = [];
  for (let vehicle of vehicles) {
    for (let notification of vehicle.notifications) {
      const lastNotificationSend = new Date(documentProperties.getProperty(`${PROPERTY_PREFIX}${vehicle.name}_${vehicle.number}_${notification.name}`));
      // const lastNotificationSend = new Date(2021, 1, 18);

      // Notification should not be send or notification has been allready send
      // Last time notification should not be send or last time notification has been allready send
      const normalShouldBeSend = notification.date.getTime() - currentDate.getTime() < notification.before * dts;
      const normalAllreaySend = notification.date.getTime() - lastNotificationSend.getTime() < notification.before * dts;
      const lastShouldBeSend = notification.date.getTime() - currentDate.getTime() < notificationFinalRemainder * dts;
      const lastAllreadySend = notification.date.getTime() - lastNotificationSend.getTime() < notificationFinalRemainder * dts;

      if ((normalShouldBeSend && !normalAllreaySend) || (lastShouldBeSend && !lastAllreadySend)) {
        const expiringVehicle = {};
        expiringVehicle.name = vehicle.name;
        expiringVehicle.number = vehicle.number;
        expiringVehicle.registerNumber = vehicle.registerNumber;

        expiringVehicle.expiryName = notification.name;
        expiringVehicle.expiryDate = notification.date;
        expiringVehicle.urgent = lastShouldBeSend;
        expiringVehicles.push(expiringVehicle);

        // Update last notification send date
        documentProperties.setProperty(`${PROPERTY_PREFIX}${vehicle.name}_${vehicle.number}_${notification.name}`, currentDate.toISOString());
        Utils.Log.info(`${notification.name} on vanhenemassa ajoneuvossa ${vehicle.number}/${vehicle.registerNumber} ja ilmoitus tulisi lähettää. Ilmoituksen taso on ${lastShouldBeSend ? "kiireinen" : "kiireetön"}`)
      } 
    }
  }
  return expiringVehicles;
}

function sendMessages(expiringVehicles, emailList) {
  for (let expiringVehicle of expiringVehicles) {
    // Form message
    const urgencyTitle = expiringVehicle.urgent ? "Tärkeä: " : "";
    const urgencyText = expiringVehicle.urgent ? "kiireellinen" : "hoidettava lähiaikoina";
    const emailTitle = `${urgencyTitle}${expiringVehicle.expiryName} on vanhetumassa ${expiringVehicle.number}/${expiringVehicle.registerNumber}`;
    const emailMessage = `Ajoneuvo kaipaa lähiaikoina huoltotoimenpiteitä. Alla ajoneuvon tiedot:\n\n` +
                         `Ajoneuvon nimi: ${expiringVehicle.name} \n` +
                         `Ajoneuvon numero: ${expiringVehicle.number} \n` +
                         `Ajoneuvon rekisterinumero: ${expiringVehicle.registerNumber} \n` +
                         `Ajoneuvon huoltotarve: ${expiringVehicle.expiryName} \n` +
                         `Huoltotarpeen kiireellisyys: ${urgencyText} \n` +
                         `Viimeinen huolto päivä: ${expiringVehicle.expiryDate.getDate()}.${expiringVehicle.expiryDate.getMonth()}.${expiringVehicle.expiryDate.getFullYear()}`;
    
    // Send message to all provided addresses
    for (const emailAddress of emailList) {
      GmailApp.sendEmail(emailAddress, emailTitle, emailMessage);
    }
  }
}

function checkServiceOverdue() {
  [notificationSettings, notificationFinalRemainder, notificationEmailList] = loadNotificationConfigurations();
  vehicles = getVehicleDetails(notificationSettings);
  expiringVehicles = filterOnlyExpiring(vehicles, notificationFinalRemainder);
  sendMessages(expiringVehicles, notificationEmailList);
}
