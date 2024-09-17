let contentScrollPosition = 0;
let selectedCategory = ""; 
Init_UI_Bookmarks();

function Init_UI_Bookmarks(){
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot, Modifié par David Germain
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}
function getCategrories(bookmarks){
    let categories = [];
    bookmarks.forEach(bookmark => {
        let found = false;
        for(let i = 0; i < categories.length; i++) {
            if(bookmark.Category === categories[i]){
                found = true;
                break;
            }
        }
        if(!found){
            categories.push(bookmark.Category);
        }      
    });
    return categories;
}

async function renderBookmarks() {
    inBookmark = true;
    showWaitingGif();
    $("#actionTitle").text("Liste des Favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks(); 
    let categories = getCategrories(bookmarks);
    updateDropDownMenu(categories);
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            if(selectedCategory === "" || bookmark.Category === selectedCategory){
                $("#content").append(renderBookmark(bookmark)); 
                $(".bookmarkCommandPanel").hide();
            }
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { 
            $(".bookmarkCommandPanel").hide();
            $(this).find(".bookmarkCommandPanel").show();
            e.preventDefault(); 
        })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}


function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.URL = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmark(bookmark) {
    const faviconURL = `https://www.google.com/s2/favicons?domain=${bookmark.URL}`//Trouvé sur https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e
    return $(`
     <div class="bookmarkRow">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
                <div class="bookmarkTitleAndImage"><img src="${faviconURL}"></i><span class="bookmarkTitle">${bookmark.Title}</span></div>
                <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Title"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="URL" class="form-label" id="form-url">URL </label><img class="form-logo" src="bookmark-logo.svg" id="website-logo"></img>
            <input
                class="form-control URL"
                name="URL"
                id="URL"
                placeholder="https://www.example.com/"
                required
                RequireMessage="Veuillez entrer l'URL du favori" 
                InvalidMessage="Veuillez entrer un URL valide"
                value="${bookmark.URL}" 
            />
            <label for="Category" class="form-label">Categorie </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer la catégrie du favori" 
                InvalidMessage="La catégorie comporte un caractère illégal"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#URL').on("change", async function(){
        const faviconURL =`https://www.google.com/s2/favicons?domain=${$('#URL').val()}`;
        $('#website-logo').attr("src", faviconURL);
    });
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let contact = await API_GetBookmark(id);
    if (contact !== null)
        renderBookmarkForm(contact);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    const faviconURL = `https://www.google.com/s2/favicons?domain=${bookmark.URL}`//Trouvé sur https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="bookmarkRow">
                <div class="bookmarkContainer noselect">
                    <div class="bookmarkLayout">
                        <div class="bookmarkTitleAndImage"><img src="${faviconURL}"></i><span class="bookmarkTitle">${bookmark.Title}</span></div>
                        <span class="bookmarkCategory">${bookmark.Category}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
 
function updateDropDownMenu(categories) { 
    let DDMenu = $("#DDMenu"); 
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw"; 
    DDMenu.empty(); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="allCatCmd"> 
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories 
        </div> 
        `)); 
    DDMenu.append($(`<div class="dropdown-divider"></div>`)); 
    categories.forEach(category => { 
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw"; 
        DDMenu.append($(` 
            <div class="dropdown-item menuItemLayout category" id="allCatCmd"> 
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category} 
            </div> 
        `)); 
    }) 
    DDMenu.append($(`<div class="dropdown-divider"></div> `)); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="aboutCmd"> 
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos... 
        </div> 
        `)); 
    $('#aboutCmd').on("click", function () { 
        renderAbout(); 
    }); 
    $('#allCatCmd').on("click", function () { 
        selectedCategory = ""; 
        renderBookmarks(); 
    }); 
    $('.category').on("click", function () { 
        selectedCategory = $(this).text().trim(); 
        renderBookmarks(); 
    }); 
}