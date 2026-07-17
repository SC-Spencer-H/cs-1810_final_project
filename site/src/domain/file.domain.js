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

var sortOrder = [
    "alphabetical",
    "prefixes",
];

const sortFuncDictionary = {
    "alphabetical": compareTagsAlphabetical,
    "prefixes": compareTagsByPrefixes,
}

var allFiles = [];

var tagIndex = [];

var focusedFiles = [];

var focusedTags = [];


await UpdateFiles();
await UpdateIndex();
SortTags();

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
    focusedTags = [...tagIndex];
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

export function GetTagIndex() {
    return [...tagIndex];
}

export function GetFocusedTagNames() {
    return focusedTags.map(t => t.name);
}

export function AddTag(path, tag) {
    const file = allFiles.find(f => f.path === path);
    if (file.tags === null)
        file.tags = [];
    file.tags = [...file.tags, tag];

    FileService.SyncFileTags(file);
}

export function GetAliases(tagName) {
    return GetTag(tagName).aliases;
}

export function AddAlias(tagName, aliasName) {
    const tag = GetTag(tagName);

    if (tag.aliases === null)
        tag.aliases = [];

    tag.aliases.push(aliasName);

    FileService.AddAlias(tagName, aliasName);
}

export function RemoveAlias(tagName, aliasName) {
    const tag = GetTag(tagName);

    if (tag.aliases === null)
        return;

    const aliasIndex = tag.aliases.indexOf(aliasName);
    if (aliasIndex >= 0) {
        tag.aliases.splice(aliasIndex, 1);
    }

    FileService.RemoveAlias(tagName, aliasName);
}

export function GetPrefixes() {
    return [...prefixes];
}

export function GetSortOrder() {
    return [...sortOrder];
}

export function ChangeSortOrder(sortOption, newIndex) {
    const currentIndex = sortOrder.indexOf(sortOption)

    if (Number.parseInt(newIndex) === Number.parseInt(currentIndex))
        return;

    if (newIndex > currentIndex) {
        newIndex--;
        if (newIndex < 0)
            newIndex = 0;
    }

    sortOrder = sortOrder.filter(t => t !== sortOption);
    sortOrder.splice(newIndex, 0, sortOption);
}

export function SortTags() {
    focusedTags.sort((tagA, tagB) => {
        return compareTags(tagA.name, tagB.name);
    });

    /// $clementine
    /// $berry
    /// #apple
    /// #banana
}

export function GetTag(name) {
    return tagIndex.find(t => t.name === name);
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
    var filteredFiles = [];

    if (findPrefix(filterValue)) {
        filteredFiles = allFiles.filter(file => {
            return file.tags.some(tag => {
                if (tag === filterValue)
                    return true;

                if (!GetAliases(tag))
                    return false;

                return GetAliases(tag).some(a => a === filterValue)
            });
        });
    }
    else {
        filteredFiles = allFiles.filter(file => {
            if (!file.tags)
                return false;

            return file.tags.some(tag => {
                if (tagMatch(tag, filterValue))
                    return true;

                if (!GetAliases(tag))
                    return false;

                return GetAliases(tag).some(a => tagMatch(a, filterValue));
            });
        });
    }

    focusedFiles = filteredFiles;
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

function compareTags(tagA, tagB) {
    var result;
    for (const method of sortOrder) {
        result = sortFuncDictionary[method](tagA, tagB);
        if (result)
            return result;
    }

    return result;
}

function compareTagsAlphabetical(tagA, tagB) {
    const trimmedA = trimTag(tagA);
    const trimmedB = trimTag(tagB);

    return trimmedA.localeCompare(trimmedB, "en");
}

function compareTagsByPrefixes(tagA, tagB) {
    const prefixA = findPrefix(tagA);
    const prefixB = findPrefix(tagB);

    if (!prefixA || !prefixB) {
        if (!prefixA && !prefixB)
            return 0;
        if (prefixA)
            return -1;
        if (prefixB)
            return 1;
    }

    const prefixAIndex = prefixes.indexOf(prefixA);
    const prefixBIndex = prefixes.indexOf(prefixB);

    if (prefixAIndex === prefixBIndex)
        return 0;
    if (prefixAIndex < prefixBIndex)
        return -1;
    if (prefixAIndex > prefixBIndex)
        return 1;
}