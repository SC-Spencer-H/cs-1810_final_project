import * as FileManager from "/src/domain/file.domain.js";

/////////////////////////////////////////////////////////////////////////////////////////////

setupAliasForm();
renderTagTable();

/////////////////////////////////////////////////////////////////////////////////////////////

function setupAliasForm() {
    const aliasFormElement = document.getElementById("add-alias-form");
    aliasFormElement.addEventListener("submit", aliasFormSubmitHandler)
}

function aliasFormSubmitHandler(event) {
    event.preventDefault();

    const previewTabElement = document.querySelector("nav");
    const tagName = previewTabElement.getAttribute("previewed-tag-name");

    const aliasInputElement = document.getElementById("add-alias-input");
    const aliasName = aliasInputElement.value;

    if (!aliasName)
        return;

    FileManager.AddAlias(tagName, aliasName);

    event.currentTarget.reset();

    renderPreview();
}

function renderTagTable() {
    const tagTableElement = document.getElementById("tag-table");

    const tagIndex = FileManager.GetTagIndex();

    for (const tag of tagIndex) {
        const tagRowElement = document.createElement("tr");

        const tagDataElement = document.createElement("td");
        tagDataElement.classList.add("tag-name-data");
        tagDataElement.textContent = tag.name;
        tagDataElement.setAttribute("tag-name", tag.name);

        tagRowElement.addEventListener("click", tagRowClickHandler)

        tagRowElement.appendChild(tagDataElement);
        tagTableElement.appendChild(tagRowElement);
    }
}

function renderPreview() {
    const previewTabElement = document.querySelector("nav");
    const tagName = previewTabElement.getAttribute("previewed-tag-name");
    const tag = FileManager.GetTag(tagName);

    const tagNamePreviewElement = document.getElementById("preview-tag-name");
    tagNamePreviewElement.textContent = tagName;

    const addAliasFormElement = document.getElementById("add-alias-form");
    addAliasFormElement.removeAttribute("hidden");

    const aliasListElement = document.getElementById("alias-list");
    aliasListElement.replaceChildren();
    if (tag.aliases !== null) {
        for (const alias of tag.aliases) {
            const aliasElement = buildAliasElement(alias);
            aliasListElement.appendChild(aliasElement);
        }
    }
}

function tagRowClickHandler(event) {
    const tagDataElement = event.currentTarget.getElementsByClassName("tag-name-data")[0];
    const tagName = tagDataElement.getAttribute("tag-name");

    const previewTabElement = document.querySelector("nav");
    previewTabElement.setAttribute("previewed-tag-name", tagName)

    renderPreview();
}

function buildAliasElement(alias) {
    const aliasElement = document.createElement("li");
    aliasElement.classList.add("alias");
    aliasElement.setAttribute("alias-name", alias);

    const aliasNameElement = document.createElement("p");
    aliasNameElement.classList.add("alias-text");
    aliasNameElement.textContent = alias;

    const removeAliasButtonElement = document.createElement("button");
    removeAliasButtonElement.classList.add("remove-alias-button");
    removeAliasButtonElement.textContent = "X";
    removeAliasButtonElement.addEventListener("click", removeAliasHandler);

    aliasElement.appendChild(aliasNameElement);
    aliasElement.appendChild(removeAliasButtonElement);

    return aliasElement;
}

function removeAliasHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const aliasName = event.currentTarget.parentElement.getAttribute("alias-name");
    const tagName = previewTabElement.getAttribute("previewed-tag-name");

    FileManager.RemoveAlias(tagName, aliasName);
    renderPreview();
}