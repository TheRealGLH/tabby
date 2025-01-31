const defaultConfig = {
    configVersion: chrome.runtime.getManifest().version,
    favouriteFolder: "root________",
    backgroundType: "solid",
    backgroundColor: "#333350",
    backgroundUrl: "",
    fontSize: 14,
};
var currentConfig = structuredClone(defaultConfig);

export async function initializeConfig() {
    var configLoad = browser.storage.sync.get("config");
    await configLoad.then(onConfigLoad, onConfigLoadError);
}

function onConfigLoad(configStoredObject) {
    if (
        Object.keys(configStoredObject).length === 0 &&
        configStoredObject.constructor === Object
    ) {
        onConfigLoadError();
        return;
    }
    Object.assign(currentConfig, configStoredObject.config);
    console.log("config loaded");
    //If there were some incompatability we'd introduce, we could check for it here by comparing the configVersion
}
function onConfigLoadError(e) {
    console.error("Error loading config: " + e);
}

function saveConfig() {
    currentConfig.configVersion = chrome.runtime.getManifest().version;
    browser.storage.sync.set({
        config: currentConfig,
    });
}

export function setFavouriteFolder(folderId) {
    currentConfig.favouriteFolder = folderId;
    saveConfig();
}

export function getFavouriteFolder() {
    return currentConfig.favouriteFolder;
}

export function setBackgroundType(backgroundType) {
    currentConfig.backgroundType = backgroundType;
    saveConfig();
}

export function getBackgroundType() {
    return currentConfig.backgroundType;
}

export function setBackgroundColor(backgroundColor) {
    currentConfig.backgroundColor = backgroundColor;
    saveConfig();
}

export function getBackgroundColor() {
    return currentConfig.backgroundColor;
}

export function setBackgroundUrl(backgroundUrl) {
    currentConfig.backgroundUrl = backgroundUrl;
    saveConfig();
}

export function getBackgroundUrl() {
    return currentConfig.backgroundUrl;
}

export function setFontSize(fontSize) {
    currentConfig.fontSize = fontSize;
    saveConfig();
}

export function getFontSize() {
    return currentConfig.fontSize;
}
