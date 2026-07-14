import { FetchFiles, FetchIndex, SyncFileTags } from "./svc.js";

const prefixes = [
    "@",
    "@@",
    "$",
    "$$",
    "%",
    "%%",
    "&",
    "#",
]

var files = await FetchFiles();

var index = await FetchIndex();

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

export function MoveTag(path, tag, index) {
    const file = files.find(f => f.path === path);
    file.tags = file.tags.filter(t => t !== tag);
    index--;
    if (index < 0)
        index = 0;
    file.tags.splice(index, 0, tag);

    SyncFileTags(file);
}

export function GetTagSuggestions(input) {
    const suggestions = index.filter(tag => {
        // console.log(tag.name, tagMatch(tag.name, input));
        if (tagMatch(tag.name, input))
            return true;

        if (tag.aliases === null)
            return false;
        if (tag.aliases.some(a => tagMatch(a, input)))
            return true;
    });

    return suggestions;
}

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