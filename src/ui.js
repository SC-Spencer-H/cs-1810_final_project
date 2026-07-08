import { GetFile, GetFilePaths } from "./dom.js";
import { BuildImageUrl } from "./svc.js";

renderThumbnails();

function renderThumbnails() {
    const mainElement = document.querySelector("main");
    mainElement.replaceChildren();

    const filePaths = GetFilePaths();
    console.log(filePaths);

    for (const path of filePaths) {
        const thumbnailElement = buildThumbnailElement(path);
        mainElement.appendChild(thumbnailElement);
    }
}

function buildThumbnailElement(path) {
    const thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("thumbnail");
    thumbnailElement.setAttribute("path", path);

    const thumbnailImageElement = document.createElement("img");
    thumbnailImageElement.setAttribute("src", BuildImageUrl(path));
    
    const thumbnailPathElement = document.createElement("p");
    thumbnailPathElement.classList.add("thumbnail-file-path");
    const splitPath = path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    thumbnailPathElement.textContent = shortPath;

    thumbnailElement.appendChild(thumbnailImageElement);
    thumbnailElement.appendChild(thumbnailPathElement);

    thumbnailElement.addEventListener("click", thumbnailClickHandler);

    return thumbnailElement;
}

function thumbnailClickHandler(event) {
    const file = GetFile(event.currentTarget.getAttribute("path"));

    const previewPathElement = document.getElementById("preview-file-path");
    const previewImageElement = document.getElementById("preview-image");
    const tagListElement = document.getElementById("tag-list");

    const splitPath = file.path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    previewPathElement.textContent = shortPath;

    previewImageElement.setAttribute("src", BuildImageUrl(file.path));

    tagListElement.replaceChildren();
    for (const tag of file.tags) {
        const tagElement = document.createElement("li");
        tagElement.textContent = tag;

        const removeTagButtonElement = document.createElement("button");
        removeTagButtonElement.classList.add("remove-tag-button");
        removeTagButtonElement.textContent = "X";
        tagElement.appendChild(removeTagButtonElement);

        tagListElement.appendChild(tagElement);
    }
}