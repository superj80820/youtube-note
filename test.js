function loadScript(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        document.head.appendChild(script);
    });
}

(async () => {
    await Promise.all([
        loadScript('https://unpkg.com/vue'),
        loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/markdown-it/10.0.0/markdown-it.min.js')
    ])
    $('#primary-inner #player').after(`<div id='vuejs'>
    <div id="output">
    </div>
    <textarea v-model="markData">
    </textarea>
</div>`)

    new Vue({
    el: '#vuejs',
    data: {
        message: '',
        ytplayer: null,
        markData: ''
    },
    watch: {
        markData() {
            var md = window.markdownit();
            var html = md.render(this.markData);
            $('#output').html(html);
        }
    },
    created() {
        // this.ytplayer = document.getElementById("movie_player");
        // this.ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
        // onPlayerStateChange = (state) => {
        // if (state === 1){
        //         console.log(ytplayer)
        //     this.message = this.ytplayer.getCurrentTime()
        //     }
        // };
    }
    })
})()

