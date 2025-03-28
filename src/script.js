import * as config from "./config.js";

const faviconApiDomain = "https://twenty-icons.com";
const container = document.querySelector("#bookmark-list");
const bookmarkTemplate = document.querySelector("#bookmark-list-item-template");
const pageCont = document.getElementById("page-cont");
const bgColorSettingsInput = document.getElementById(
    "settings-background-color"
);
const bgFileSettingsInput = document.getElementById("settings-background-file");
const bgUrlSettingsInput = document.getElementById("settings-background-url");
const fadeOutTime = 300; //This is the fadeout time used in style,css for the main bookmark list. We can't directly import it.
var faveTree = null;
var faveRootId = null;
var currentFolderId = null;

init();

async function init() {
    let backgroundSelect = document.getElementById("settings-background");
    backgroundSelect.onchange = function() {
        onBackgroundTypeSelect(backgroundSelect.value);
    };
    bgColorSettingsInput.onchange = function() {
        onBackgroundColorSelected(bgColorSettingsInput);
    };
    bgFileSettingsInput.onchange = function() {
        onBackgroundFileSelected(bgFileSettingsInput);
    };
    bgUrlSettingsInput.onchange = function() {
        onBackgroundUrlSelected(bgUrlSettingsInput);
    };
    let fontSizeInput = document.getElementById("settings-font-size");
    fontSizeInput.onchange = function() {
        onFontSizeChange(fontSizeInput);
    };
    let fontNameInput = document.getElementById("settings-font");
    fontNameInput.oninput = function() {
        onFontNameChange(fontNameInput);
    };

    await config.initializeConfig();
    var backgroundColor = config.getBackgroundColor();
    bgColorSettingsInput.value = backgroundColor;
    updateBackgroundColor(backgroundColor);
    var backgroundUrl = config.getBackgroundUrl();
    bgUrlSettingsInput.value = backgroundUrl;
    updateBackgroundImage(backgroundUrl);
    var backgroundType = config.getBackgroundType();
    document.getElementById("settings-background").value = backgroundType;
    onBackgroundTypeSelect(backgroundType);
    var fontSize = config.getFontSize();
    fontSizeInput.value = fontSize;
    updateFontSize(fontSize);
    var fontName = config.getFontName();
    fontNameInput.value = fontName;
    updateFontName(fontName);
    let faveFolder = config.getFavouriteFolder();
    if (faveFolder === "") onNoFaveSet();
    let bookmarks = browser.bookmarks.getSubTree(faveFolder);
    faveRootId = faveFolder;
    bookmarks.then(displayRootBootmarks, onRejected);

    let fullBookmarks = browser.bookmarks.getTree();
    fullBookmarks.then(onBookmarks, onRejected);
    document.getElementById("settings-button").onclick = onSettingsToggle;
    document.getElementById("settings-dimmer").onclick = onSettingsToggle;
    let faveSelect = document.getElementById("settings-favourites");
    faveSelect.onchange = function() {
        onSettingsFaveSelect(faveSelect);
    };
    setVersionText(document.getElementById("settings-version"));
}

function onNoFaveSet() {
    console.log("No fave set!");
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(displayRootBootmarks, onRejected);
}

function displayRootBootmarks(bookmarks) {
    faveTree = bookmarks[0];
    faveRootId = bookmarks[0].id;
    currentFolderId = bookmarks[0].id;
    renderBookmarkTreeItem(bookmarks[0], container);
}

function onBookmarks(bookmarks) {
    populateFolderFaves(
        bookmarks[0],
        document.getElementById("settings-favourites")
    );
}

function populateFolderFaves(bookmarkTree, selectElement) {
    if (bookmarkTree.type == "folder") {
        bookmarkTree.children.forEach((treeChild) => {
            populateFolderFaves(treeChild, selectElement);
        });
        let option = document.createElement("option");
        option.className = "settings-favourites-option";
        option.value = bookmarkTree.id;
        option.innerText = bookmarkTree.title;
        selectElement.appendChild(option);
    }
    let faves = document.getElementById("settings-favourites");
    faves.value = faveRootId;
}

function onFolderSelect(bookmarkTreeItemFolder) {
    if (bookmarkTreeItemFolder.id == faveRootId) return;
    var listElement = container.querySelector(".bookmark-item-container");
    listElement.classList.add("fade-out");
    setTimeout(() => {
        listElement.innerHTML = "";
        listElement.classList.remove("fade-out");
        listElement.style.opacity = 1;
        if (
            bookmarkTreeItemFolder.id == currentFolderId &&
            bookmarkTreeItemFolder.parentId != undefined
        ) {
            let selectedBookmarks = browser.bookmarks.getSubTree(
                bookmarkTreeItemFolder.parentId
            );
            selectedBookmarks.then(onSelectedParentFolder, onRejected);
        } else {
            currentFolderId = bookmarkTreeItemFolder.id;
            renderBookmarkTreeItem(bookmarkTreeItemFolder, container);
        }
    }, fadeOutTime);
}
function onSelectedParentFolder(bookmarks) {
    container.querySelector(".bookmark-item-container").innerHTML = "";
    currentFolderId = bookmarks[0].id;
    renderBookmarkTreeItem(bookmarks[0], container);
}

function renderBookmarkTreeItem(bookmarkTreeItem, parentElement) {
    if (bookmarkTreeItem.parentId == undefined)
        bookmarkTreeItem.title = "Favourites";
    let clone = bookmarkTemplate.content.firstElementChild.cloneNode(true);
    if (bookmarkTreeItem.title === "" && bookmarkTreeItem.url != undefined)
        bookmarkTreeItem.title = bookmarkTreeItem.url;

    if (bookmarkTreeItem.type == "folder") {
        clone.classList.add("bookmark-item-folder");

        bookmarkTreeItem.children.forEach((treeChild) => {
            renderBookmarkTreeItem(treeChild, clone);
        });
        clone.querySelector(".bookmark-list-item-content").onclick =
            function() {
                onFolderSelect(bookmarkTreeItem);
            };
    } else if (bookmarkTreeItem.type == "separator") {
        let lineBreak = document.createElement("hr");
        lineBreak.setAttribute("noshade", "");
        parentElement
            .querySelector(".bookmark-item-container")
            .appendChild(lineBreak);
        return;
    } else {
        clone.querySelector(".bookmark-list-item-content").href =
            bookmarkTreeItem.url;
        var domainName = getDomainName(bookmarkTreeItem.url);
        if (domainName != null) {
            clone.querySelector(".bookmark-item-pic").style.backgroundImage =
                "url('" +
                faviconApiDomain + "/" +
                domainName +
                "/180')";
        }
    }
    clone.querySelector(".bookmark-list-item-text").textContent =
        bookmarkTreeItem.title;
    parentElement.querySelector(".bookmark-item-container").appendChild(clone);
}

function onRejected(error) {
    console.error(error);
}

function getDomainName(url) {
    try {
        const urlObject = new URL(url);

        return urlObject.hostname;
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}

function onSettingsToggle() {
    let menu = document.getElementById("settings-menu");
    let dimmer = document.getElementById("settings-dimmer");
    if (menu.style.display != "block") {
        dimmer.style.display = "block";
        menu.style.display = "block";
    } else {
        dimmer.style.display = "none";
        menu.style.display = "none";
    }
}

function onSettingsFaveSelect(selectElement) {
    config.setFavouriteFolder(selectElement.value);
    let selectedBookmarks = browser.bookmarks.getSubTree(selectElement.value);
    selectedBookmarks.then(onBookmarkFaveSettingChange, onRejected);
    //TODO save setting
}

function onBookmarkFaveSettingChange(bookmarks) {
    var listElement = container.querySelector(".bookmark-item-container");
    listElement.classList.add("fade-out");
    setTimeout(() => {
        listElement.innerHTML = "";
        listElement.classList.remove("fade-out");
        listElement.style.opacity = 1;
        currentFolderId = bookmarks[0].id;
        faveRootId = bookmarks[0].id;
        bookmarks.forEach((bookmarkTree) => {
            faveTree = bookmarkTree;
            renderBookmarkTreeItem(bookmarkTree, container);
        });
    }, fadeOutTime);
}

function onBackgroundTypeSelect(value) {
    var colorElement = document.getElementById(
        "settings-menu-item-background-color"
    );
    var fileElement = document.getElementById(
        "settings-menu-item-background-file"
    );
    var urlElement = document.getElementById(
        "settings-menu-item-background-url"
    );
    switch (value) {
        case "solid":
            colorElement.style.display = "flex";
            fileElement.style.display = "none";
            urlElement.style.display = "none";
            updateBackgroundColor(bgColorSettingsInput.value);
            break;
        case "file":
            colorElement.style.display = "none";
            fileElement.style.display = "flex";
            urlElement.style.display = "none";
            updateBackgroundImage(bgFileSettingsInput.value);
            break;
        case "url":
            colorElement.style.display = "none";
            fileElement.style.display = "none";
            urlElement.style.display = "flex";
            updateBackgroundImage(bgUrlSettingsInput.value);
            break;
        default:
            break;
    }
    config.setBackgroundType(value);
}

function onBackgroundColorSelected(colorInputElement) {
    updateBackgroundColor(colorInputElement.value);
    config.setBackgroundColor(colorInputElement.value);
}

function onBackgroundFileSelected(fileInputElement) {
    let url = URL.createObjectURL(fileInputElement.files[0]);
    updateBackgroundImage(url);
    console.log(url);
}

function onBackgroundUrlSelected(urlInputElement) {
    let url = urlInputElement.value;
    updateBackgroundImage(url);
    config.setBackgroundUrl(url);
    console.log(url);
}

function onFontSizeChange(fontSizeInputElement) {
    let size = fontSizeInputElement.value;
    updateFontSize(size);
    config.setFontSize(size);
}

function onFontNameChange(fontNameInputElement) {
    let name = fontNameInputElement.value;
    updateFontName(name);
    config.setFontName(name);
}

function updateFontSize(sizeInPixels) {
    pageCont.style.fontSize = sizeInPixels + "px";
}

function updateFontName(fontName) {
    pageCont.style.fontFamily = fontName + ", Roboto, arial, sans-serif";
}

function updateBackgroundColor(colorHex) {
    pageCont.style.backgroundImage = "none";
    pageCont.style.backgroundColor = colorHex;
}

function updateBackgroundImage(imageUrl) {
    pageCont.style.backgroundImage = "url('" + imageUrl + "')";
}

function setVersionText(versionAnchorElement) {
    var version = chrome.runtime.getManifest().version;
    versionAnchorElement.innerText = "v" + version;
    versionAnchorElement.href =
        "https://github.com/TheRealGLH/tabby/releases/tag/" + version;
}
