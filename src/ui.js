import { GetFilePaths } from "./dom.js";
import { BuildImageUrl } from "./svc.js";

renderThumbnails();

function renderThumbnails() {
    const mainElement = document.querySelector("main");
    mainElement.replaceChildren();

    const filePaths = GetFilePaths();

    for (const path of filePaths) {
        const thumbnailElement = buildThumbnailElement(path);
        mainElement.appendChild(thumbnailElement);
    }
}

function buildThumbnailElement(path) {
    const thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("thumbnail");

    const thumbnailImageElement = document.createElement("img");
    thumbnailImageElement.setAttribute("src", BuildImageUrl(path));
    
    const thumbnailPathElement = document.createElement("p");
    thumbnailPathElement.classList.add("thumbnail-file-path");
    const splitPath = path.split("\\");
    const shortPath = splitPath[splitPath.length - 1];
    thumbnailPathElement.textContent = shortPath;

    thumbnailElement.appendChild(thumbnailImageElement);
    thumbnailElement.appendChild(thumbnailPathElement);

    return thumbnailElement;
}