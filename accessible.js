function loadScript(url) {
    return new Promise(function(resolve, reject) {
        const script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        document.head.appendChild(script);
    });
}

function loadLink(url) {
    return new Promise(function(resolve, reject) {
        const link = document.createElement("link");
        link.onload = resolve;
        link.onerror = reject;
        link.rel = "stylesheet"
        link.href = url;
        document.head.appendChild(link);
    });
}

function addStyle(css) {
    const head = document.head || document.getElementsByTagName('head')[0], style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
}

(async () => {
await Promise.all([
    loadScript(
        "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"
    ),
    loadLink(
        "https://unpkg.com/muse-ui/dist/muse-ui.css"
    ),
    loadLink(
        "https://cdn.bootcss.com/material-design-icons/3.0.1/iconfont/material-icons.css"
    ),
]);
$("#columns #secondary #secondary-inner #panels").before(`
<div id='vuejs'>
</div>
<div id='ytControllerInput' style='display:none'></div>
<div id='ytControllerOutput' style='display:none'></div>
`);

const checkMoviePlayer = () => {
    return new Promise((resolve, reject) => {
        const checker = setInterval(() => {
            if (window.document.getElementById("movie_player") !== null) {
                clearInterval(checker)
                return resolve()
            }
        }, 1000)
    })
}
const ytControllerInit = () => {
    document.getElementById("ytControllerInput").addEventListener("DOMSubtreeModified", (() => {
        const ytController = window.document.getElementById("movie_player")
        return () => {
            let event = document.getElementById("ytControllerInput").innerHTML
            if (event.length === 0) return
            event = JSON.parse(event)
            switch (event.type) {
                case 'pauseVideo':
                    ytController.pauseVideo()
                    break
                case 'getCurrentTime':
                    document.getElementById("ytControllerOutput").innerHTML = ytController.getCurrentTime()
                    break
                case 'seekTo':
                    ytController.seekTo(event.value)
                    break
            }
        }
    })())
}

await checkMoviePlayer()
ytControllerInit()

})();
