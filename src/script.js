const container = document.querySelector("#bookmark-list");
const bookmarkTemplate = document.querySelector("#bookmark-list-item-template");
const fadeOutTime = 300; //This is the fadeout time used in style,css for the main bookmark list. We can't directly import it.
var faveTree = null;
var faveRootId = null;
var currentFolderId = null;
init();

function init() {
    let faveFolder = browser.storage.sync.get("faveFolder");
    faveFolder.then(onFaveLoaded, onNoFaveSet);
    let fullBookmarks = browser.bookmarks.getTree();
    fullBookmarks.then(onBookmarks, onRejected);
    document.getElementById("settings-button").onclick = onSettingsToggle;
    let select = document.getElementById("settings-favourites");
    select.onchange = function() {
        onSettingsFaveSelect(select);
    };
}

function onFaveLoaded(faveBookmarkSetting) {
    console.log(faveBookmarkSetting);
    if (
        Object.keys(faveBookmarkSetting).length === 0 &&
        faveBookmarkSetting.constructor === Object
    ) {
        onNoFaveSet();
        return;
    }
    let bookmarks = browser.bookmarks.getSubTree(
        faveBookmarkSetting.faveFolder
    );
    bookmarks.then(displayRootBootmarks, onRejected);
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
        console.log("blah");
        let lineBreak = document.createElement("hr");
        lineBreak.setAttribute("noshade", "");
        parentElement.querySelector(".bookmark-item-container").appendChild(lineBreak);
        return;
    } else {
        clone.querySelector(".bookmark-list-item-content").href =
            bookmarkTreeItem.url;
        var domainName = getDomainName(bookmarkTreeItem.url);
        if (domainName != null) {
            clone.querySelector(".bookmark-item-pic").style.backgroundImage =
                "url('https://quintessential-jade-termite.faviconkit.com/" +
                domainName +
                "/144')";
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
    if (menu.style.display != "block") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function onSettingsFaveSelect(selectElement) {
    browser.storage.sync.set({
        faveFolder: selectElement.value,
    });
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
