import file from "./file";

export default class driveApp {
  static folders = {};

  static getFolderById(folderID) {
    return this.folders[folderID];
  }

  static addFolder(folderID, folder) {
    this.folders[folderID] = folder;
  }

  static Files = {
    insert: (fileDetails, blob, options) => {
      const fileInstance = new file(
        "ID_INSERTED_" + fileDetails.title,
        fileDetails.title,
        blob,
        "application/vnd.google-apps.spreadsheet"
      );
      this.folders[fileDetails.parents[0].id].addFile(fileInstance);
    },

    remove: (fileId) => {
      for (let folderId in this.folders) {
        let fo = this.folders[folderId];
        for (let fiIndex = 0; fiIndex < fo.files.length; fiIndex++) {
          if (fo.files[fiIndex].getId() == fileId) {
            fo.files.splice(fiIndex, 1);
            return;
          }
        }
      }
    },
  };

  static resetFolders() {
    this.folders = {};
  }
}
