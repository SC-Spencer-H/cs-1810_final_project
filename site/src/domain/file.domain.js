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

var focusedFilePaths = [];

var focusedTagNames = [];

/////////////////////////////////////////////////////////////////////////////////////////////

await FileService.LoadRecentFolder();
await UpdateFileList();
await UpdateTagIndex();
SortTags();

/////////////////////////////////////////////////////////////////////////////////////////////

export async function UpdateWorkingFolder(folderPath) {
    workingFolderPath = folderPath;
    await FileService.SetWorkingFolder(folderPath);
    await UpdateFileList();
    focusedFilePaths = allFiles.map(f => f.path);
    await UpdateTagIndex();
}

export async function UpdateFileList() {
    allFiles = await FileService.FetchFiles();
    focusedFilePaths = allFiles.map(f => f.path);
}

export async function UpdateTagIndex() {
    tagIndex = await FileService.FetchIndex();
    focusedTagNames = tagIndex.map(t => t.name);
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function GetFile(path) {
    return allFiles.find(f => f.path === path);
}

export function GetTag(name) {
    return tagIndex.find(t => t.name === name);
}

export function GetAliases(tagName) {
    return GetTag(tagName).aliases;
}

export function GetAllFilePaths() {
    return allFiles.map(f => f.path);
}

export function GetAllTagNames() {
    return tagIndex.map(t => t.name);
}

export function GetFocusedFilePaths() {
    return [...focusedFilePaths];
}

export function GetFocusedTagNames() {
    return [...focusedTagNames];
}

export function GetPrefixes() {
    return [...prefixes];
}

export function GetSortOrder() {
    return [...sortOrder];
}

/////////////////////////////////////////////////////////////////////////////////////////////

export async function AddTag(filePath, tagName) {
    await FileService.AddTag(filePath, tagName);

    const file = allFiles.find(f => f.path === filePath);
    if (file.tags === null)
        file.tags = [];
    file.tags = [...file.tags, tagName];

    if (!GetTag(tagName)) {
        const tag = {
            name: tagName,
            aliases: []
        };
        tagIndex.push(tag);
    }
}

export async function RemoveTag(filePath, tagName) {
    await FileService.RemoveTag(filePath, tagName);

    const file = allFiles.find(f => f.path === filePath);
    file.tags = file.tags.filter(t => t !== tagName);
}

export async function MoveTag(filePath, tagName, targetIndex) {
    const file = allFiles.find(f => f.path === filePath);
    const currentIndex = file.tags.indexOf(tagName);
    if (Number.parseInt(targetIndex) === Number.parseInt(currentIndex))
        return;

    if (targetIndex > currentIndex) {
        targetIndex--;
        if (targetIndex < 0)
            targetIndex = 0;
    }

    await FileService.MoveTag(filePath, tagName, targetIndex);

    file.tags = file.tags.filter(t => t !== tagName);
    file.tags.splice(targetIndex, 0, tagName);
}

export async function AddAlias(tagName, aliasName) {
    await FileService.AddAlias(tagName, aliasName);

    const tag = GetTag(tagName);

    if (tag.aliases === null)
        tag.aliases = [];

    tag.aliases.push(aliasName);
}

export async function RemoveAlias(tagName, aliasName) {
    await FileService.RemoveAlias(tagName, aliasName);

    const tag = GetTag(tagName);

    if (tag.aliases === null)
        return;

    const aliasIndex = tag.aliases.indexOf(aliasName);
    if (aliasIndex >= 0) {
        tag.aliases.splice(aliasIndex, 1);
    }
}

export async function IndexWorkingFolder() {
    await FileService.IndexWorkingFolder();
    await UpdateTagIndex();
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function SortTags() {
    focusedTagNames.sort((tagA, tagB) => {
        return compareTags(tagA, tagB);
    });
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

    focusedFilePaths = filteredFiles.map(f => f.path);
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
    for (const sortMethod of sortOrder) {
        result = sortFuncDictionary[sortMethod](tagA, tagB);
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