import { AddTag, GetFile, GetFilePaths, RemoveTag } from "./dom.js";
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
    if (file.tags !== null) {
        for (const tag of file.tags) {
            const tagElement = document.createElement("li");
            tagElement.textContent = tag;
            tagElement.setAttribute("tagName", tag);
            
            const removeTagButtonElement = document.createElement("button");
            removeTagButtonElement.classList.add("remove-tag-button");
            removeTagButtonElement.textContent = "X";
            removeTagButtonElement.addEventListener("click", removeTagButtonClickHandler);
            tagElement.appendChild(removeTagButtonElement);
            
            tagListElement.appendChild(tagElement);
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

function removeTagButtonClickHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const tagName = event.currentTarget.parentElement.getAttribute("tagName");
    const filePath = previewTabElement.getAttribute("previewed-file-path");

    RemoveTag(filePath, tagName);
    renderPreview();
}