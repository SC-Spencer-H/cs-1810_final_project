import * as FileService from "/src/service/file.service.js";

//////////////////////////////////////////////////////////////////////////////////////////////

await loadRecentFolder();
window.location.replace("/src/view/file-explorer.html");

//////////////////////////////////////////////////////////////////////////////////////////////

async function loadRecentFolder() {
    const recentFolders = FileService.FetchRecentFolders();
    console.log(recentFolders);
    if (recentFolders)
        await FileService.SetWorkingFolder(recentFolders[0]);
}