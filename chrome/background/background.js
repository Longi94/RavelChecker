let notificationId = "ravel-checker";

let notificationOptions = {
    type: "basic",
    title: "ROOMS AVAILABLE AT RAVEL",
    message: "ROOMS AVAILABLE AT RAVEL",
    iconUrl: "icon.png"
};

chrome.runtime.onMessage.addListener((request, sender) => {
    chrome.notifications.create(notificationId, notificationOptions);
});