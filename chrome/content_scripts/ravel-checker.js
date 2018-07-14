
chrome.storage.sync.get({
    enabled: false
}, items => {
    if (items.enabled) {
        let freeRooms = $(".home_available_container").find(".home_available_element").not(".full");

        if (freeRooms.length > 0) {
            chrome.runtime.sendMessage({});
        } else {
            setTimeout(() => window.location.reload(true), 5000);
        }
    }
});
