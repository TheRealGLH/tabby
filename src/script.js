const container = document.querySelector("#bookmark-list");
const bookmarkTemplate = document.querySelector("#bookmark-list-item-template");
init();

function init() {
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(onBookmarks, onRejected);
}


function onBookmarks(bookmarks) {
    bookmarks.forEach(bookmarkTree => {
        renderBookmarkTreeItem(bookmarkTree, container);
    });
}

function renderBookmarkTreeItem(bookmarkTreeItem, parentElement) {
    let clone = bookmarkTemplate.content.firstElementChild.cloneNode(true);

    if (bookmarkTreeItem.type == "folder") {
        clone.querySelector(".bookmark-list-item-text").textContent = bookmarkTreeItem.title;
        clone.classList.add(".bookmark-item-folder");
        bookmarkTreeItem.children.forEach(treeChild => {
            renderBookmarkTreeItem(treeChild, clone);
        });
    }
    else {
        let link = document.createElement("a");
        link.href = bookmarkTreeItem.url;
        link.textContent = bookmarkTreeItem.title;
        clone.classList.add(".bookmark-item-link");
        clone.querySelector(".bookmark-list-item-text").appendChild(link);
    }
    parentElement.querySelector(".bookmark-item-container").appendChild(clone);


}


function onRejected(error) {
    console.log(error);
}
