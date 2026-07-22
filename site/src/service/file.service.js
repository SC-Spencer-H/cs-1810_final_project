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
    const response = await fetch(url + "setFolder", request);
}

export async function FetchFiles() {
    const response = await fetch(url + "fileData");
    const json = await response.json();
    return json;
}

export async function FetchIndex() {
    const response = await fetch(url + "tagIndex");
    const json = await response.json();
    return json;
}

/////////////////////////////////////////////////////////////////////////////////////////////

export async function AddTag(filePath, tagName) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filePath: filePath,
            tagName: tagName
        })
    };
    return await fetch(url + "addTag", request);
}

export async function RemoveTag(filePath, tagName) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filePath: filePath,
            tagName: tagName
        })
    };
    return await fetch(url + "removeTag", request);
}

export async function MoveTag(filePath, tagName, insertAt) {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filePath: filePath,
            tagName: tagName,
            insertAt: insertAt
        })
    };
    return await fetch(url + "moveTag", request);
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
    return await fetch(url + "addAlias", request);
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
    return await fetch(url + "removeAlias", request);
}

export async function IndexWorkingFolder() {
    return await fetch(url + "indexFolder");
}

/////////////////////////////////////////////////////////////////////////////////////////////

export async function LoadRecentFolder() {
    const recentFolders = FetchRecentFolders();
    if (recentFolders)
        await SetWorkingFolder(recentFolders[0]);
}

export function FetchRecentFolders() {
    return JSON.parse(localStorage.getItem("recentFolderPaths"));
}

export function StoreRecentFolder(folderPath) {
    var recentFolderPaths = FetchRecentFolders();
    
    if (recentFolderPaths) {
        while (recentFolderPaths.length > 3) {
            recentFolderPaths.pop();
        }
        if (recentFolderPaths.find(p => p === folderPath) === undefined) {
            if (recentFolderPaths.length == 3) 
                recentFolderPaths.pop();
            recentFolderPaths.unshift(folderPath);
        }
        else {
            recentFolderPaths = recentFolderPaths.filter(p => p !== folderPath);
            recentFolderPaths.unshift(folderPath);
        }
        const recentFolderPathsJson = JSON.stringify(recentFolderPaths);
        localStorage.setItem("recentFolderPaths", recentFolderPathsJson);
    }
    else {
        const recentFolderPathsJson = JSON.stringify([folderPath])
        localStorage.setItem("recentFolderPaths", recentFolderPathsJson);
    }
}

export function BuildImageUrl(path) {
    return url + "getImage?path=" + path;
}