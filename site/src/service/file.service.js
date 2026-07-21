const url = "http://localhost:5104/";

export async function SetWorkingFolder(folderPath) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            folderPath: folderPath
        }),
    };
    const response = await fetch(url + "folder", request);
}

export async function FetchFiles() {
    const response = await fetch(url + "files");
    const json = await response.json();
    return json;
}

export async function FetchIndex() {
    const response = await fetch(url + "index");
    const json = await response.json();
    return json;
}

export function BuildImageUrl(path) {
    return url + "image?path=" + path;
}

export async function SyncFileTags(file) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(file),
    };
    const response = await fetch(url + "tags", request);
}

export async function AddAlias(tagName, aliasName) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tagName: tagName,
            aliasName: aliasName
        })
    };
    const response = await fetch(url + "addAlias", request);
}

export async function RemoveAlias(tagName, aliasName) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tagName: tagName,
            aliasName: aliasName
        })
    };
    const response = await fetch(url + "removeAlias", request);
}

export function FetchRecentFolders() {
    return JSON.parse(localStorage.getItem("recentFolderPaths"));
}

export function StoreRecentFolder(folderPath) {
    const recentFolderPaths = FetchRecentFolders();

    if (recentFolderPaths) {
        while (recentFolderPaths.length >= 3) {
            recentFolderPaths.pop();
        }
        if (recentFolderPaths.find(p => p === folderPath) === undefined) {
            recentFolderPaths.unshift(folderPath);
            const recentFolderPathsJson = JSON.stringify(recentFolderPaths);
            localStorage.setItem("recentFolderPaths", recentFolderPathsJson);
        }
    }
    else {
        const recentFolderPathsJson = JSON.stringify([folderPath])
        localStorage.setItem("recentFolderPaths", recentFolderPathsJson);
    }
}