import GlobalUtils from "../TestUtils/GlobalUtils";

beforeAll(() => {
  GlobalUtils.maskGoogleServices();
  GlobalUtils.importRemeoUtils();
  GlobalUtils.importFile("./SheetManagementUtils/Constants.js");
});

test("Test getWeek prototype function", () => {
  expect(new Date("2020-12-28T00:00:00.000+02:00").getWeek()).toBe(53);
  expect(new Date("2021-01-03T00:00:00.000+02:00").getWeek()).toBe(53);
  expect(new Date("2021-01-04T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2021-01-10T23:59:59.000+02:00").getWeek()).toBe(1);
  expect(new Date("2021-01-11T00:00:00.000+02:00").getWeek()).toBe(2);
  expect(new Date("2022-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2023-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2024-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2025-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2026-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2027-01-03T00:00:00.000+02:00").getWeek()).toBe(53);
  expect(new Date("2028-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2029-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
  expect(new Date("2030-01-03T00:00:00.000+02:00").getWeek()).toBe(1);
});
