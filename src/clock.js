function init() {
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
    //While this does mean that it will update based on when the page is loaded instead of the system clock,
    //it simply means less JS calls and that's a tradeoff I'm okay with.
    setTimeout(init, 60000);
}
function displayDate(timeElement, date, options) {
    timeElement.innerText = date.toLocaleString(navigator.language, options);
}

init();
