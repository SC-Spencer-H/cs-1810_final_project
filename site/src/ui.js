import { AddTag, GetFile, GetFilePaths, MoveTag, RemoveTag } from "./dom.js";
import { BuildImageUrl } from "./svc.js";

setupTagForm();
renderThumbnails();

function setupTagForm() {
    const tagFormElement = document.getElementById("add-tag-form");

    tagFormElement.addEventListener("submit", tagFormSubmitHandler);
}

function renderThumbnails() {
    const mainElement = document.querySelector("main");
    mainElement.replaceChildren();

    const filePaths = GetFilePaths();

    for (const path of filePaths) {
        const thumbnailElement = buildThumbnailElement(path);
        mainElement.appendChild(thumbnailElement);
    }
}

function renderPreview() {
    const previewTabElement = document.querySelector("nav");
    const path = previewTabElement.getAttribute("previewed-file-path");
    const file = GetFile(path);

    const previewPathElement = document.getElementById("preview-file-path");
    const previewImageElement = document.getElementById("preview-image");
    const tagListElement = document.getElementById("tag-list");

    const splitPath = path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    previewPathElement.textContent = shortPath;

    previewImageElement.setAttribute("src", BuildImageUrl(path));

    tagListElement.replaceChildren();
    const tagDropDivsContainer = document.getElementById("tag-drop-divs-container");
    tagDropDivsContainer.replaceChildren();
    if (file.tags !== null) {
        for (var i = 0; i < file.tags.length; i++) {
            const tag = file.tags[i];
            const tagElement = buildTagElement(tag);
            tagListElement.appendChild(tagElement);

            var dropDiv = buildTagDropDiv(i);
            tagDropDivsContainer.appendChild(dropDiv);
            dropDiv = buildTagDropDiv(i + 1);
            tagDropDivsContainer.appendChild(dropDiv);
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
    thumbnailImageElement.setAttribute("src", BuildImageUrl(path));
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
    dropDiv.addEventListener("drop", tagDropHandler);

    return dropDiv;
}

function thumbnailClickHandler(event) {
    const path = event.currentTarget.getAttribute("path");
    const previewTabElement = document.querySelector("nav");
    previewTabElement.setAttribute("previewed-file-path", path);
    renderPreview();
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

    AddTag(previewedFilePath, tagName);

    tagFormElement.reset();
    renderPreview();
}

function removeTagHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const tagName = event.currentTarget.parentElement.getAttribute("tagName");
    const filePath = previewTabElement.getAttribute("previewed-file-path");

    RemoveTag(filePath, tagName);
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

    MoveTag(filePath, tagName, newIndex);
    renderPreview();
}