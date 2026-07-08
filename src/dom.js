import { FetchFiles } from "./svc.js";

var files = await FetchFiles();
console.log(files);

export function GetFilePaths() {
    return files.map(f => f.path);
}

export function GetFile(path) {
    return files.find(f => f.path === path);
}