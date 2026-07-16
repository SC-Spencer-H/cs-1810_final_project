import { FetchFiles, FetchIndex, SyncFileTags, SetWorkingFolder } from "./svc.js";

/////////////////////////////////////////////////////////////////////////////////////////////

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

var files = [];

var index = [];

/////////////////////////////////////////////////////////////////////////////////////////////

export async function UpdateWorkingFolder(folderPath) {
    await SetWorkingFolder(folderPath);
    await UpdateFiles();
    await UpdateIndex();
}

export async function UpdateFiles() {
    files = await FetchFiles();
}

export async function UpdateIndex() {
    index = await FetchIndex();
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function GetFile(path) {
    return files.find(f => f.path === path);
}

export function GetAllFilePaths() {
    return files.map(f => f.path);
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

export function MoveTag(path, tag, index) {
    console.log(index);
    const file = files.find(f => f.path === path);
    const tagIndex = file.tags.indexOf(tag);
    console.log(tagIndex);
    if (Number.parseInt(index) === Number.parseInt(tagIndex))
        return;

    if (index > tagIndex) {
        index--;
        if (index < 0)
            index = 0;
    }
    file.tags = file.tags.filter(t => t !== tag);
    file.tags.splice(index, 0, tag);

    SyncFileTags(file);
}

export function GetTagSuggestions(input) {
    const suggestions = index.filter(tag => {
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
        filteredFilePaths = files.filter(f => f.tags.some(t => t === filterValue)).map(f => f.path);
    }
    else {
        filteredFilePaths = files.filter(f => f.tags.some(t => tagMatch(t, filterValue))).map(f => f.path);
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