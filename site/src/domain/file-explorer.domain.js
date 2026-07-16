import * as FileService from "/src/service/file.service.js";

/////////////////////////////////////////////////////////////////////////////////////////////

var workingFolderPath = undefined;

const prefixes = [
    "@",
    "@@",
    "$",
    "$$",
    "%",
    "%%",
    "&",
    "#",
];

var allFiles = [];

var tagIndex = [];

var focusedFiles = [];

/////////////////////////////////////////////////////////////////////////////////////////////

export async function UpdateWorkingFolder(folderPath) {
    workingFolderPath = folderPath;
    await FileService.SetWorkingFolder(folderPath);
    await UpdateFiles();
    focusedFiles = [...allFiles];
    await UpdateIndex();
}

export async function UpdateFiles() {
    allFiles = await FileService.FetchFiles();
    focusedFiles = [...allFiles];
}

export async function UpdateIndex() {
    tagIndex = await FileService.FetchIndex();
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function GetFile(path) {
    return allFiles.find(f => f.path === path);
}

export function GetAllFilePaths() {
    return allFiles.map(f => f.path);
}

export function GetFocusedFilePaths() {
    return focusedFiles.map(f => f.path);
}

export function AddTag(path, tag) {
    const file = allFiles.find(f => f.path === path);
    if (file.tags === null)
        file.tags = [];
    file.tags = [...file.tags, tag];

    FileService.SyncFileTags(file);
}

export function RemoveTag(path, tag) {
    const file = allFiles.find(f => f.path === path);
    file.tags = file.tags.filter(t => t !== tag);

    FileService.SyncFileTags(file);
}

export function MoveTag(path, tag, index) {
    const file = allFiles.find(f => f.path === path);
    const tagIndex = file.tags.indexOf(tag);
    if (Number.parseInt(index) === Number.parseInt(tagIndex))
        return;

    if (index > tagIndex) {
        index--;
        if (index < 0)
            index = 0;
    }
    file.tags = file.tags.filter(t => t !== tag);
    file.tags.splice(index, 0, tag);

    FileService.SyncFileTags(file);
}

export function GetTagSuggestions(input) {
    const suggestions = tagIndex.filter(tag => {
        if (tagMatch(tag.name, input))
            return true;

        if (tag.aliases === null)
            return false;
        if (tag.aliases.some(a => tagMatch(a, input)))
            return true;
    });

    return suggestions;
}

export function FilterByTags(filterValue) {
    var filteredFilePaths = [];

    if (findPrefix(filterValue)) {
        filteredFilePaths = allFiles.filter(f => f.tags.some(t => t === filterValue)).map(f => f.path);
    }
    else {
        filteredFilePaths = allFiles.filter(f => f.tags.some(t => tagMatch(t, filterValue))).map(f => f.path);
    }

    return filteredFilePaths;
}

/////////////////////////////////////////////////////////////////////////////////////////////

function tagMatch(tagName, value) {
    const valuePrefix = findPrefix(value);

    if (valuePrefix) {
        return tagName.startsWith(value);
    }
    else {
        const trimmedTagName = trimTag(tagName);
        return trimmedTagName.startsWith(value);
    }
}

function trimTag(tagName) {
    const tagPrefix = findPrefix(tagName);
    const trimmedTagName = tagName.slice(tagPrefix.length)
    return trimmedTagName;
}

function findPrefix(value) {
    if (prefixes.length === 0)
        return "";

    const potentialPrefixes = [...prefixes];

    for (var i = 0; potentialPrefixes.length > 1; i++) {
        const invalidPrefixes = [];

        for (const prefix of potentialPrefixes) {
            if (prefix.length - i <= 0)
                invalidPrefixes.push(prefix);
            else if (!value.startsWith(prefix))
                invalidPrefixes.push(prefix);
        }

        for (const prefix of invalidPrefixes) {
            potentialPrefixes.splice(potentialPrefixes.indexOf(prefix), 1)
        }
    }

    return potentialPrefixes[0];
}