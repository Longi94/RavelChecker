
chrome.storage.sync.get({
    enabled: false
}, items => {
    $("input").prop('checked', items.enabled);
});

$('document').ready(() => {
    $("input").change(function () {
        chrome.storage.sync.set({enabled: $(this).is(":checked")});
    });
});
