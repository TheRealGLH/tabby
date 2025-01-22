const container = document.querySelector("#bookmark-list");
const bookmarkTemplate = document.querySelector("#bookmark-list-item-template");
var faveTree = null;
var faveRootId = null;
var currentFolderId = null;
init();

function init() {
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(onBookmarks, onRejected);
    document.getElementById("settings-button").onclick = onSettingsToggle;
    let select = document.getElementById("settings-favourites");
    select.onchange = function() {
        onSettingsFaveSelect(select);
    };
    var date = new Date();
    displayDate(document.getElementById("clock-date"), date, {
        weekday: "long",
        year: "numeric",
        day: "numeric",
        month: "short",
    });
    displayDate(document.getElementById("clock-time"), date, {
        timeStyle: "short",
    });
}

function onBookmarks(bookmarks) {
    faveTree = bookmarks[0];
    faveRootId = bookmarks[0].id;
    currentFolderId = bookmarks[0].id;
    renderBookmarkTreeItem(bookmarks[0], container);
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
}

function onFolderSelect(bookmarkTreeItemFolder) {
    if (bookmarkTreeItemFolder.id == faveRootId) return;
    container.querySelector(".bookmark-item-container").innerHTML = "";
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
        clone.querySelector(".bookmark-list-item-text").onclick = function() {
            onFolderSelect(bookmarkTreeItem);
        };
    }
    clone.querySelector(".bookmark-list-item-text").textContent =
            bookmarkTreeItem.title; 
    parentElement.querySelector(".bookmark-item-container").appendChild(clone);
}

function onRejected(error) {
    console.error(error);
}

function onSettingsToggle() {
    let menu = document.getElementById("settings-menu");
    if (menu.style.display != "block") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function onSettingsFaveSelect(selectElement) {
    let selectedBookmarks = browser.bookmarks.getSubTree(selectElement.value);
    selectedBookmarks.then(onBookmarkFaveSettingChange, onRejected);
    //TODO save setting
}

function onBookmarkFaveSettingChange(bookmarks) {
    container.querySelector(".bookmark-item-container").innerHTML = "";
    currentFolderId = bookmarks[0].id;
    faveRootId = bookmarks[0].id;
    bookmarks.forEach((bookmarkTree) => {
        faveTree = bookmarkTree;
        renderBookmarkTreeItem(bookmarkTree, container);
    });
}

function displayDate(timeElement, date, options) {
    console.log(navigator.language);
    console.log(date);
    timeElement.innerText = date.toLocaleString(navigator.language, options);
}
