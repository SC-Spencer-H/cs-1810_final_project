import * as FileService from "/src/service/file.service.js";

//////////////////////////////////////////////////////////////////////////////////////////////

await FileService.LoadRecentFolder();
window.location.replace("/src/view/file-explorer.html");