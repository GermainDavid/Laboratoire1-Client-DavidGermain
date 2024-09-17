const API_URL_BOOKMARKS = "https://lab1-server-davidgermain.glitch.me/api/bookmarks";
function API_GetBookmarks() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL_BOOKMARKS,
            success: bookmarks => { resolve(bookmarks); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetBookmark(bookmarkId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL_BOOKMARKS + "/" + bookmarkId,
            success: bookmark => { resolve(bookmark); },
            error: () => { resolve(null); }
        });
    });
}
function API_SaveBookmark(bookmark, create) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL_BOOKMARKS + (create ? "" : "/" + bookmark.Id),
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(bookmark),
            success: (/*data*/) => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}
function API_DeleteBookmark(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL_BOOKMARKS + "/" + id,
            type: "DELETE",
            success: () => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}