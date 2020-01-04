const API_KEY = "AIzaSyByJWSOtTcE4P-yVUIluv2ztALui_YmPDU";
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SPREADSHEET_TAB_NAME = "Sheet1";
const SCOPE = "https://www.googleapis.com/auth/drive";

// for test
// chrome.storage.sync.remove('spreadsheetNoteId')

// model

function getSpreadsheetNoteId() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("spreadsheetNoteId",function(items) {
            if (Object.keys(items).length === 0) {
                resolve(false)
            } else {
                resolve(items.spreadsheetNoteId)
            }
        });
    })
}

function setSpreadsheetId(spreadsheetNoteId) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({"spreadsheetNoteId": spreadsheetNoteId},items => {
            resolve(items)
        })
    })
}

function createSheet(spreadsheetBody = {}) {
    return gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
}

async function getSheetTitle() {
    spreadsheetId = await getSpreadsheetNoteId()
    return await gapi.client.sheets.spreadsheets.values
        .get({
            spreadsheetId: spreadsheetId,
            range: `${SPREADSHEET_TAB_NAME}!A1:A1000`
        })
}

async function getSheetContent(title) {
    const sheetTitles = await getSheetTitle()
    const row = sheetTitles.result.values
        .findIndex(item => {
            return item[0] === title
        })
        + 1
    if (row !== 0) {
        response = await gapi.client.sheets.spreadsheets.values
        .get({
            spreadsheetId: spreadsheetId,
            range: `${SPREADSHEET_TAB_NAME}!B${row}:B${row}`
        })
        return response.result.values[0][0]
    } else {
        return '{}'
    }
}

async function initThenGetToken() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    })
    console.log("gapi initialized");
    const token = await new Promise(resolve => {chrome.identity.getAuthToken({ interactive: true }, token => {resolve(token)})})
    gapi.auth.setToken({access_token: token});
    return Promise.resolve(token)
}

async function uploadRow(title, note) {
    const body = {
        values: [
            [
                title,
                note
            ]
        ]
    };
    const sheetTitles = await getSheetTitle()
    const row = sheetTitles.result.values
        .findIndex(item => {
            return item[0] === title
        })
        + 1
    console.log(row)
    if (row !== 0) {
        return gapi.client.sheets.spreadsheets.values
            .update({
                spreadsheetId: await getSpreadsheetNoteId(),
                range: `${SPREADSHEET_TAB_NAME}!A${row}:B${row}`,
                valueInputOption: "USER_ENTERED",
                resource: body
            })
    } else {
        return gapi.client.sheets.spreadsheets.values
            .append({
                spreadsheetId: await getSpreadsheetNoteId(),
                range: SPREADSHEET_TAB_NAME,
                valueInputOption: "USER_ENTERED",
                resource: body
            })
    }
}

// controller
async function onGAPILoad() {
    await initThenGetToken()
    const spreadsheetNoteId = await getSpreadsheetNoteId()
    if (!spreadsheetNoteId) {
        response = await createSheet({
            "properties": {
                "title": "youtube-note"
            }
        })
        setSpreadsheetId(response.result.spreadsheetId)
    }
}

// Listen for messages from inject.js
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case 'saveNote':
            initThenGetToken()
            .then(() => {
                return uploadRow(request.data.videoId, JSON.stringify(request.data.noteObj))
            })
            .then(response => {
                console.log(`${response} cells appended.`);
            })
            sendResponse({ success: true });
            break
        case 'updateTitleAndGetNoteContent':
            console.log(request.data.videoId)
            getSheetContent(request.data.videoId)
            .then(content => {
                console.log('asdfasdfasdfasdf',content)
                sendResponse(JSON.parse(content));
            })
            break
    }
    return true
});

chrome.tabs.onActivated.addListener(function (tabId) {
    let url;
    chrome.tabs.get(tabId.tabId, function(tab){
        url = tab.url;
        console.log(url);
    });
    
});