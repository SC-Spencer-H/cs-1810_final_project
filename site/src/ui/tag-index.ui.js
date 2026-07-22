import * as FileManager from "/src/domain/file.domain.js";

/////////////////////////////////////////////////////////////////////////////////////////////

setupAliasForm();
setupSortDropdown();
renderTagTable();
setupIndexFolderButton();

/////////////////////////////////////////////////////////////////////////////////////////////

function setupAliasForm() {
    const aliasFormElement = document.getElementById("add-alias-form");
    aliasFormElement.addEventListener("submit", aliasFormSubmitHandler)
}

function setupSortDropdown() {
    const sortButtonElement = document.getElementById("sort-dropdown-button");
    sortButtonElement.addEventListener("click", sortButtonClickHandler)

    const sortDropdownMenuElement = document.getElementById("sort-dropdown-menu");
    sortDropdownMenuElement.addEventListener("dragover", e => e.preventDefault());
    sortDropdownMenuElement.addEventListener("drop", sortMenuDropHandler);

    renderSortDropdown();
}

function setupIndexFolderButton() {
    const indexFolderButtonElement = document.getElementById("index-folder-button");
    indexFolderButtonElement.addEventListener("click", indexFolderButtonClickHandler)
}

/////////////////////////////////////////////////////////////////////////////////////////////

async function aliasFormSubmitHandler(event) {
    event.preventDefault();

    const previewTabElement = document.querySelector("nav");
    const tagName = previewTabElement.getAttribute("previewed-tag-name");

    const aliasInputElement = document.getElementById("add-alias-input");
    const aliasName = aliasInputElement.value;

    if (!aliasName)
        return;

    await FileManager.AddAlias(tagName, aliasName);

    const aliasFormElement = document.getElementById("add-alias-form");
    aliasFormElement.reset();

    renderPreview();
}

async function removeAliasHandler(event) {
    const previewTabElement = document.querySelector("nav");

    const aliasName = event.currentTarget.parentElement.getAttribute("alias-name");
    const tagName = previewTabElement.getAttribute("previewed-tag-name");

    await FileManager.RemoveAlias(tagName, aliasName);
    renderPreview();
}

function tagRowClickHandler(event) {
    const tagDataElement = event.currentTarget.getElementsByClassName("tag-name-data")[0];
    const tagName = tagDataElement.getAttribute("tag-name");

    const previewTabElement = document.querySelector("nav");
    previewTabElement.setAttribute("previewed-tag-name", tagName)

    renderPreview();
}

function sortButtonClickHandler(event) {
    const dropdownMenuContainer = document.getElementById("sort-dropdown-menu-container");
    dropdownMenuContainer.classList.toggle("dropdown-visible");
}

function sortOptionDragStartHandler(event) {
    const sortDropDivsContainer = document.getElementById("sort-drop-divs-container");
    const sortDropdownMenuElement = document.getElementById("sort-dropdown-menu");

    sortDropDivsContainer.style.zIndex = 2;
    sortDropdownMenuElement.style.zIndex = 1;

    const sortOption = event.currentTarget.getAttribute("sort-option");
    event.dataTransfer.setData("sort-option", sortOption);
}

function sortOptionDragEndHandler(event) {
    const sortDropDivsContainer = document.getElementById("sort-drop-divs-container");
    const sortDropdownMenuElement = document.getElementById("sort-dropdown-menu");

    sortDropDivsContainer.style.zIndex = 1;
    sortDropdownMenuElement.style.zIndex = 2;
}

function sortMenuDropHandler(event) {
    event.currentTarget.classList.remove("sort-order-preview")

    const sortOption = event.dataTransfer.getData("sort-option");
    const newIndex = event.currentTarget.getAttribute("index");

    FileManager.ChangeSortOrder(sortOption, newIndex);
    FileManager.SortTags();
    renderSortDropdown();
    renderTagTable();
}

async function indexFolderButtonClickHandler(event) {
    await FileManager.IndexWorkingFolder();
    renderTagTable();
}

/////////////////////////////////////////////////////////////////////////////////////////////

function renderTagTable() {
    const tagTableElement = document.getElementById("tag-table");
    tagTableElement.replaceChildren();

    const focusedTagNames = FileManager.GetFocusedTagNames();

    for (const tagName of focusedTagNames) {
        const tagRowElement = document.createElement("tr");

        const tagDataElement = document.createElement("td");
        tagDataElement.classList.add("tag-name-data");
        tagDataElement.textContent = tagName;
        tagDataElement.setAttribute("tag-name", tagName);

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

function renderSortDropdown() {
    const sortDropdownMenuElement = document.getElementById("sort-dropdown-menu");
    sortDropdownMenuElement.replaceChildren();
    const sortDropDivsContainer = document.getElementById("sort-drop-divs-container");
    sortDropDivsContainer.replaceChildren();
    const sortOrder = FileManager.GetSortOrder();

    for (var i = 0; i < sortOrder.length; i++) {
        const option = sortOrder[i];
        const sortOptionElement = document.createElement("li");
        sortOptionElement.classList.add("dropdown-option");
        sortOptionElement.textContent = option[0].toUpperCase() + option.slice(1);
        sortOptionElement.setAttribute("sort-option", option);

        var dropDiv = buildSortDropDiv(i);
        dropDiv.setAttribute("order", "top")
        sortDropDivsContainer.appendChild(dropDiv);
        dropDiv = buildSortDropDiv(i + 1);
        dropDiv.setAttribute("order", "bottom")
        sortDropDivsContainer.appendChild(dropDiv);

        sortOptionElement.setAttribute("draggable", true);
        sortOptionElement.addEventListener("dragstart", sortOptionDragStartHandler);
        sortOptionElement.addEventListener("dragend", sortOptionDragEndHandler);

        sortDropdownMenuElement.appendChild(sortOptionElement);
    }
}

function buildSortDropDiv(index) {
    const dropDiv = document.createElement("div");
    dropDiv.classList.add("sort-drop-div");
    dropDiv.setAttribute("index", index);
    dropDiv.addEventListener("dragover", e => e.preventDefault());
    dropDiv.addEventListener("dragenter", e => e.currentTarget.classList.add("sort-order-preview"));
    dropDiv.addEventListener("dragleave", e => e.currentTarget.classList.remove("sort-order-preview"));
    dropDiv.addEventListener("drop", sortMenuDropHandler);

    return dropDiv;
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