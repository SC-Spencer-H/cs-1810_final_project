import { FetchFiles, SyncFileTags } from "./svc.js";

var files = await FetchFiles();

export function GetFilePaths() {
    return files.map(f => f.path);
}

export function GetFile(path) {
    return files.find(f => f.path === path);
}

export function AddTag(path, tag) {
    const file = files.find(f => f.path === path);
    if (file.tags === null)
        file.tags = [];
    file.tags = [...file.tags, tag];
    SyncFileTags(file);
}

export function RemoveTag(path, tag) {
    const file = files.find(f => f.path === path);
    file.tags = file.tags.filter(t => t !== tag);
    SyncFileTags(file);
}