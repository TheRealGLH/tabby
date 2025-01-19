const container = document.querySelector("#bookmark-list");
const bookmarkTemplate = document.querySelector("#bookmark-list-item-template");
init();

function init() {
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(onBookmarks, onRejected);
    document.getElementById("settings-button").onclick = onSettingsToggle;
    let select = document.getElementById("settings-favourites");
    select.onchange = function () {
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
    bookmarks.forEach((bookmarkTree) => {
        renderBookmarkTreeItem(bookmarkTree, container);
        populateFolderFaves(
            bookmarkTree,
            document.getElementById("settings-favourites")
        );
    });
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

function renderBookmarkTreeItem(bookmarkTreeItem, parentElement) {
    let clone = bookmarkTemplate.content.firstElementChild.cloneNode(true);
    if (bookmarkTreeItem.title === "" && bookmarkTreeItem.url != undefined)
        bookmarkTreeItem.title = bookmarkTreeItem.url;

    if (bookmarkTreeItem.type == "folder") {
        clone.querySelector(".bookmark-list-item-text").textContent =
            bookmarkTreeItem.title;
        clone.classList.add(".bookmark-item-folder");
        bookmarkTreeItem.children.forEach((treeChild) => {
            renderBookmarkTreeItem(treeChild, clone);
        });
    } else {
        let link = document.createElement("a");
        link.href = bookmarkTreeItem.url;
        link.textContent = bookmarkTreeItem.title;
        clone.classList.add(".bookmark-item-link");
        clone.querySelector(".bookmark-list-item-text").appendChild(link);
    }
    parentElement.querySelector(".bookmark-item-container").appendChild(clone);
}

function onRejected(error) {
    console.error(error);
}

function onSettingsToggle() {
    let menu = document.getElementById("settings-menu");
    if (menu.style.display === "none") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function onSettingsFaveSelect(selectElement) {
    let selectedBookmarks = browser.bookmarks.getSubTree(selectElement.value);
    selectedBookmarks.then(onBookmarkFaveSettingChange, onRejected);
}

function onBookmarkFaveSettingChange(bookmarks) {
    container.querySelector(".bookmark-item-container").innerHTML = "";
    bookmarks.forEach((bookmarkTree) => {
        renderBookmarkTreeItem(bookmarkTree, container);
    });
}

function displayDate(timeElement, date, options) {
    console.log(navigator.language);
    console.log(date);
    timeElement.innerText = date.toLocaleString(navigator.language, options);
}
