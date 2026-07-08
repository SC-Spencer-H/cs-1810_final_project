import { FetchFileTags } from "./svc.js";

var fileTagsDictionary = await FetchFileTags();

var filePathsList = populateFilePaths();

export function GetFilePaths() {
    return [...filePathsList];
}

function populateFilePaths() {
    const paths = [];
    for (const key in fileTagsDictionary) {
        paths.push(key);
    }
    return paths;
}