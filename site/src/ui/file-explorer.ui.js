import * as FileManager from "/src/domain/file-explorer.domain.js";
import * as FileService from "/src/service/file.service.js";

//////////////////////////////////////////////////////////////////////////////////////////////

setupFolderForm();
setupFilterForm();
setupTagForm();

if (FileService.FetchRecentFolders()) {
    await FileManager.UpdateFiles();
    renderThumbnails();
}

// SETUP ////////////////////////////////////////////////////////////////////////////////////

function setupFolderForm() {
    const folderFormElement = document.getElementById("set-working-folder-form");
    folderFormElement.addEventListener("submit", folderFormSubmitHandler);

    renderRecentFoldersList();
}

function setupFilterForm() {
    const filterFormElement = document.getElementById("filter-form");
    filterFormElement.addEventListener("submit", filterFormSubmitHandler);
}

function setupTagForm() {
    const tagFormElement = document.getElementById("add-tag-form");
    tagFormElement.addEventListener("submit", tagFormSubmitHandler);

    const tagInputElement = document.getElementById("add-tag-input");
    tagInputElement.addEventListener("input", tagInputSuggestHandler);
}

// EVENTS ///////////////////////////////////////////////////////////////////////////////////

async function folderFormSubmitHandler(event) {
    event.preventDefault();

    const folderPathInputElement = document.getElementById("working-folder-input");
    const folderPath = folderPathInputElement.value;

    await FileManager.UpdateWorkingFolder(folderPath);
    FileService.StoreRecentFolder(folderPath);

    renderThumbnails();
}

function filterFormSubmitHandler(event) {
    event.preventDefault();

    const filterInputElement = document.getElementById("filter-input");
    const filterValue = filterInputElement.value

    // renderThumbnails(FilterByTags(filterValue));
}

function tagFormSubmitHandler(event) {
    event.preventDefault();

    const tagFormElement = document.getElementById("add-tag-form");
    const previewTabElement = document.querySelector("nav");
    const previewedFilePath = previewTabElement.getAttribute("previewed-file-path");
    if (previewedFilePath === null || previewedFilePath === "")
        return;

    const formData = new FormData(tagFormElement);
    const tagName = formData.get("tagName")
    if (tagName === undefined || tagName === "")
        return;

    FileManager.AddTag(previewedFilePath, tagName);

    tagFormElement.reset();
    renderPreview();
}

function thumbnailClickHandler(event) {
    const path = event.currentTarget.getAttribute("path");

    const previewTabElement = document.querySelector("nav");
    previewTabElement.setAttribute("previewed-file-path", path);

    const addTagInputElement = document.getElementById("add-tag-form");;
    addTagInputElement.removeAttribute("hidden");

    renderPreview();
}

function tagInputSuggestHandler(event) {
    const inputValue = event.currentTarget.value;
    const suggestionListElement = document.getElementById("tag-suggestions");
    suggestionListElement.replaceChildren();

    if (inputValue === "" || inputValue === undefined)
        return;

    const tagSuggestions = FileManager.GetTagSuggestions(inputValue);
    for (const suggestion of tagSuggestions) {
        const suggestionElement = document.createElement("option");
        suggestionElement.setAttribute("value", suggestion.name);
        suggestionListElement.appendChild(suggestionElement);
    }
}

function removeTagHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const tagName = event.currentTarget.parentElement.getAttribute("tagName");
    const filePath = previewTabElement.getAttribute("previewed-file-path");

    FileManager.RemoveTag(filePath, tagName);
    renderPreview();
}

function tagDragStartHandler(event) {
    const tagListElement = document.getElementById("tag-list");
    const tagDropDivsContainer = document.getElementById("tag-drop-divs-container");

    tagListElement.style.zIndex = "0";
    tagDropDivsContainer.style.zIndex = "1";

    const tagName = event.currentTarget.getAttribute("tagName");
    event.dataTransfer.setData("tagName", tagName);
}

function tagDragEndHandler(event) {
    const tagListElement = document.getElementById("tag-list");
    const tagDropDivsContainer = document.getElementById("tag-drop-divs-container");

    tagListElement.style.zIndex = "1";
    tagDropDivsContainer.style.zIndex = "0";
}

function tagDropHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const filePath = previewTabElement.getAttribute("previewed-file-path");
    const tagName = event.dataTransfer.getData("tagName");
    const newIndex = event.currentTarget.getAttribute("index");

    FileManager.MoveTag(filePath, tagName, newIndex);
    renderPreview();
}

// RENDER ///////////////////////////////////////////////////////////////////////////////////

function renderThumbnails() {
    const mainElement = document.querySelector("main");
    mainElement.replaceChildren();

    const filePaths = FileManager.GetFocusedFilePaths();

    for (const path of filePaths) {
        const thumbnailElement = buildThumbnailElement(path);
        mainElement.appendChild(thumbnailElement);
    }
}

function renderPreview() {
    const previewTabElement = document.querySelector("nav");
    const path = previewTabElement.getAttribute("previewed-file-path");
    const file = FileManager.GetFile(path);

    const previewPathElement = document.getElementById("preview-file-path");
    const previewImageElement = document.getElementById("preview-image");
    const tagListElement = document.getElementById("tag-list");

    const splitPath = path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    previewPathElement.textContent = shortPath;

    previewImageElement.setAttribute("src", FileService.BuildImageUrl(path));

    tagListElement.replaceChildren();
    const tagDropDivsContainer = document.getElementById("tag-drop-divs-container");
    tagDropDivsContainer.replaceChildren();
    if (file.tags !== null) {
        for (var i = 0; i < file.tags.length; i++) {
            const tag = file.tags[i];
            const tagElement = buildTagElement(tag);
            tagListElement.appendChild(tagElement);

            var dropDiv = buildTagDropDiv(i);
            dropDiv.setAttribute("order", "top")
            tagDropDivsContainer.appendChild(dropDiv);
            dropDiv = buildTagDropDiv(i + 1);
            dropDiv.setAttribute("order", "bottom")
            tagDropDivsContainer.appendChild(dropDiv);
        }
    }
}

function renderRecentFoldersList() {
    const recentFolderPaths = FileService.FetchRecentFolders();

    if (recentFolderPaths) {
        const recentFoldersElement = document.getElementById("recent-folders");
        recentFoldersElement.replaceChildren();

        for (const path of recentFolderPaths) {
            const folderPathElement = document.createElement("option");
            folderPathElement.setAttribute("value", path);
            recentFoldersElement.appendChild(folderPathElement);
        }
    }

}

function buildThumbnailElement(path) {
    const thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("thumbnail");
    thumbnailElement.setAttribute("path", path);

    const thumbnailImageContainer = document.createElement("div");
    thumbnailImageContainer.classList.add("thumbnail-image-container");
    const thumbnailImageElement = document.createElement("img");
    thumbnailImageElement.setAttribute("src", FileService.BuildImageUrl(path));
    thumbnailImageContainer.appendChild(thumbnailImageElement);

    const thumbnailPathElement = document.createElement("p");
    thumbnailPathElement.classList.add("thumbnail-file-path");
    const splitPath = path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    thumbnailPathElement.textContent = shortPath;

    thumbnailElement.appendChild(thumbnailImageContainer);
    thumbnailElement.appendChild(thumbnailPathElement);

    thumbnailElement.addEventListener("click", thumbnailClickHandler);

    return thumbnailElement;
}

function buildTagElement(tag) {
    const tagElement = document.createElement("li");
    tagElement.classList.add("tag");
    tagElement.setAttribute("tagName", tag);

    const tagNameElement = document.createElement("p");
    tagNameElement.classList.add("tag-name");
    tagNameElement.textContent = tag;

    const removeTagButtonElement = document.createElement("button");
    removeTagButtonElement.classList.add("remove-tag-button");
    removeTagButtonElement.textContent = "X";
    removeTagButtonElement.addEventListener("click", removeTagHandler);

    tagElement.appendChild(tagNameElement);
    tagElement.appendChild(removeTagButtonElement);

    tagElement.setAttribute("draggable", true);
    tagElement.addEventListener("dragstart", tagDragStartHandler)
    tagElement.addEventListener("dragend", tagDragEndHandler)

    return tagElement;
}

function buildTagDropDiv(index) {
    const dropDiv = document.createElement("div");
    dropDiv.classList.add("tag-drop-div");
    dropDiv.setAttribute("index", index);
    dropDiv.addEventListener("dragover", e => e.preventDefault());
    dropDiv.addEventListener("dragenter", e => e.currentTarget.classList.add("tag-order-preview"));
    dropDiv.addEventListener("dragleave", e => e.currentTarget.classList.remove("tag-order-preview"));
    dropDiv.addEventListener("drop", tagDropHandler);

    return dropDiv;
}