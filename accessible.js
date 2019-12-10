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

// function formatTime(time) {
//     return parseInt(time.toString().match(/^(\d+)\.*/)[1])
// }

(async () => {
await Promise.all([
    loadScript("https://cdn.jsdelivr.net/npm/vue@2.6.0"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/vuex/2.1.1/vuex.min.js"),
    loadScript(
        "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"
    ),
    loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/10.0.0/markdown-it.min.js"
    ),
    loadScript(
        "https://unpkg.com/muse-ui/dist/muse-ui.js"
    ),
    loadLink(
        "https://unpkg.com/muse-ui/dist/muse-ui.css"
    ),
    loadLink(
        "https://cdn.bootcss.com/material-design-icons/3.0.1/iconfont/material-icons.css"
    ),
]);
// ytController = {
//     ytPlayer: document.getElementById("movie_player"), //Ref: https://developers.google.com/youtube/iframe_api_reference?csw=1
//     getCurrentTime() {
//         return this.ytPlayer.getCurrentTime()
//     },
//     pauseVideo() {
//         return this.ytPlayer.pauseVideo()
//     },
//     seekTo(time) {
//         return this.ytPlayer.seekTo(time)
//     },
//     getTimeKeyLessOrThanCurrentTme(noteObj, lessOrThan) {
//         currentTime = this.getCurrentTime()
//         let allNoteTime = Object.keys(noteObj)
//         .map(item => parseInt(item))
//         if (allNoteTime.length === 0) {
//             return null
//         }
//         let ret = ''
//         switch (lessOrThan){
//             case 'less':
//                 ret = Math
//                 .max(...allNoteTime 
//                     .filter(item => item <= currentTime))
//                 break
//             case 'than':
//                 ret = Math
//                 .min(...allNoteTime 
//                     .filter(item => item > currentTime))
//                 break
//         }
//         if (ret === -Infinity || ret === Infinity){
//             ret = currentTime
//         }
//         return ret.toString()
//     },
// }
// addStyle(`
// .autoImgSize img {
//     max-width: 100%;
//     height: auto;
// }
// .scroll {
//     width: auto;
//     height: 520px;
//     overflow: scroll;
//     padding:15px 20px;
// }
// .textarea {
//     width: auto;
//     height: 520px;
// }
// `)
$("#columns #secondary #secondary-inner #panels").before(`
<div id='vuejs'>
</div>
<div id='ytControllerInput'>asdf</div>
<div id='ytControllerOutput'>asdf</div>
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

(async() => {
    await checkMoviePlayer()
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
})()

// const store = new Vuex.Store({
//     state: {
//         markDataInjectKey: null,
//         noteObj: {},
//         noteObjLength: 0,
//         currentKey: 1,
//         noteCache: '',
//         videoId: ''
//         },
//     mutations: {
//         updateCurrentNoteObj (state, note) {
//             state.noteObj[state.markDataInjectKey] = note
//             console.log(state.noteObj)
//         },
//         updateNoteObjByKey (state, payload) {
//             state.markDataInjectKey = payload["key"]
//             state.noteObj[payload["key"]] = payload["note"]
//             state.noteObjLength = Object.keys(state.noteObj).length
//             console.log(state.noteObj)
//         },
//         updateMarkDataInjectKey (state, key) {
//             state.markDataInjectKey = key
//             console.log(state.noteObj)
//         },
//         updateCurrentKey (state) {
//             let yutebeCurrentTime = ytController.getTimeKeyLessOrThanCurrentTme(state.noteObj, 'less')
//             state.currentKey = Object.keys(state.noteObj).indexOf(yutebeCurrentTime) + 1
//             console.log(state.noteObj)
//         },
//         updateCurrentTimeOfNote (state) {
//             let yutebeCurrentTime = formatTime(ytController.getCurrentTime())
//             const deleteKey = Object.entries(state.noteObj)
//                 .filter(item => item[1] === state.noteCache)
//             state.noteObj[yutebeCurrentTime] = state.noteCache
//             state.markDataInjectKey = yutebeCurrentTime
//             delete state.noteObj[deleteKey[0][0]]
//             console.log(state.noteObj)
//         },
//         updateNoteCache (state, note) {
//             state.noteCache = note
//             console.log(state.noteObj)
//         },
//         updateVideoId (state, videoId) {
//             state.videoId = videoId
//             console.log(`updateVideoId: Save video id ${state.videoId}`)
//         },
//         deleteNoteByKey (state, key) {
//             let allNoteKeys = Object.keys(state.noteObj)
//             let preNoteKey = allNoteKeys[allNoteKeys.indexOf(key) - 1]
//             state.markDataInjectKey = preNoteKey
//             state.noteCache = state.noteObj[state.markDataInjectKey]
//             delete state.noteObj[key]
//             state.noteObjLength = Object.keys(state.noteObj).length
//             console.log(state.noteObj)
//         }
//     },
// })

// {/* <button @click='switchLessOrThanNote("less", selectMode)'>上一份筆記</button>
// <button @click='switchLessOrThanNote("than", selectMode)'>下一份筆記</button> */}
// {/* <div id="output" class="style-scope ytd-watch-next-secondary-results-renderer autoImgSize scroll"></div> */}'
// {/* <mu-text-field v-model="markData" multi-line :rows="21" full-width></mu-text-field><br/> */}
// let viewComponent = {
//     template: '<div v-html="output" class="style-scope ytd-watch-next-secondary-results-renderer autoImgSize scroll"></div>',
//     data: function () {
//         return {
//             output: ''
//         }
//     },
//     mounted() {
//         this.rendenMarkdownToHtml()
//         this.setInterval = window.setInterval(() => {
//             let currentKey = ytController.getTimeKeyLessOrThanCurrentTme(this.$store.state.noteObj, 'less')
//             this.$store.commit("updateCurrentKey")
//             this.$store.commit("updateMarkDataInjectKey", currentKey)
//             this.rendenMarkdownToHtml()
//         }, 500)
//     },
//     destroyed() {
//         window.clearInterval(this.setInterval)
//     },
//     methods: {
//         rendenMarkdownToHtml() {
//             let md = window.markdownit();
//             let lastNote = this.$store.state.noteObj[this.$store.state.markDataInjectKey]
//             if (typeof lastNote === 'string'){
//                 let html = md.render(lastNote);
//                 this.output = html
//             } else if (lastNote === undefined) {
//                 let html = md.render('');
//                 this.output = html
//             }
//         },
//     }
// };

// let editComponent = {
//     template: `
//     <mu-text-field v-model="note" multi-line :rows="21" full-width class="textarea"></mu-text-field><br/>
//     `,
//     data() {
//         return {
//         }
//     },
//     computed: {
//         note: {
//             get () {
//                 return this.$store.state.noteCache
//             },
//             set (note) {
//                 // this.noteCache = this.$store.state.noteObj[this.$store.state.markDataInjectKey]
//                 this.$store.commit('updateNoteCache', note)
//                 this.$store.commit('updateCurrentNoteObj', note)
//             }
//         }
//     }
// };

// new Vue({
// //     el: "#vuejs",
//     store,
//     components: {
//         'view-component': viewComponent,
//         'edit-component': editComponent,
//     },
//     data: {
//         ytplayer: null,
//         noteObj: {},
//         selectMode: 0,
//         setInterval: null,
//         videoId: '',
//     },
//     computed: {
//         // current() {
//         //     console.log('jiji')
//         //     return this.$store.state.currentKey
//         // }
//     },
//     watch: {
//         markData() {
//             if (this.markDataInjectKey !== null){
//                 this.noteObj[this.markDataInjectKey] = this.markData
//             }
//         },
//         // selectMode() {
//         //     switch (this.selectMode) {
//         //         case 0:
//         //             this.onViewMode()
//         //             break;
//         //         case 1:
//         //             this.onEditMode()
//         //             break;
//         //     }
//         // },
//     },
//     created() {
//         // ytController = document.getElementById("movie_player"); //Ref: https://developers.google.com/youtube/iframe_api_reference?csw=1
//         const init = () => {
//             let videoId = new URLSearchParams(window.location.search).get('v');
//             this.$store.commit("updateVideoId", videoId)
//         }
//         init()
//         window.addEventListener("yt-navigate-finish", function(event) {
//             init()
//         })
//     },
//     methods: {
//         addNoteToNoteObj() {
//             let yutebeCurrentTime = formatTime(ytController.getCurrentTime())
//             console.log(yutebeCurrentTime)
//             if (this.checkIfTimeNotExistInNoteObj(this.$store.state.noteObj, yutebeCurrentTime)) {
//                 this.selectMode = 1
//                 ytController.pauseVideo()
//                 this.$store.commit("updateNoteObjByKey", {key: yutebeCurrentTime,note: ''})
//                 this.$store.commit("updateMarkDataInjectKey", yutebeCurrentTime)
//                 this.$store.commit("updateCurrentKey")
//                 this.$store.commit('updateNoteCache', '')
//             } else {
//                 window.alert('此時間點已經有筆記囉')
//             }
//         },
//         deleteNote() {
//             let currentKey = ytController.getTimeKeyLessOrThanCurrentTme(this.$store.state.noteObj, 'less')
//             this.$store.commit('deleteNoteByKey', currentKey)
//             ytController.seekTo(currentKey)
//             this.$store.commit("updateCurrentKey")
//         },
//         // switchLessOrThanNote(LessOrThan, selectMode) {
//         //     switch (selectMode){
//         //         case 'view':
//         //             break
//         //         case 'edit':
//         //             this.markDataInjectKey = this.getTimeKeyLessOrThanCurrentTme(this.noteObj, formatTime(this.markDataInjectKey), LessOrThan)
//         //             this.markData = this.noteObj[this.markDataInjectKey]
//         //             ytController.seekTo(
//         //                 this.getTimeKeyLessOrThanCurrentTme(this.noteObj, formatTime(this.markDataInjectKey), LessOrThan)
//         //             )
//         //             break
//         //     }
//         // },
//         saveNoteToCloud() {
//             var settings = {
//                 "async": true,
//                 "crossDomain": true,
//                 "url": "https://api.github.com/gists",
//                 "method": "POST",
//                 "headers": {
//                     "authorization": "token d7f903aa51819b31d0d57412dab8cb4be5cc6469",
//                     "content-type": "application/json"
//                 },
//                 "processData": false,
//                 "data": JSON.stringify({
//                     "description": "youtube-note-testing",
//                     "public": true,
//                     "files": {
//                         "test": {
//                             "content": JSON.stringify(this.$store.state.noteObj)
//                         }
//                     }
//                 })
//             }
//             $.ajax(settings).done(function (response) {
//                 console.log(response);
//             });
//         },
//         paginationEvent() {
//             let currentKey = Object.keys(this.$store.state.noteObj)[this.$store.state.currentKey - 1]
//             ytController.seekTo(currentKey)
//             this.$store.commit('updateNoteCache', this.$store.state.noteObj[currentKey])
//             this.$store.commit("updateMarkDataInjectKey", currentKey)
//         },
//         // onEditMode() {
//         //     ytController.pauseVideo()
//         //     if (this.$store.state.markDataInjectKey !== null) {
//         //         this.markData = this.noteObj[this.$store.state.markDataInjectKey]
//         //     }
//         //     var md = window.markdownit();
//         //     var html = md.render('');
//         //     $("#output").html(html);
//         //     window.clearInterval(this.setInterval)
//         // },
//         moveNoteTime() {
//             this.$store.commit("updateCurrentKey")
//             this.$store.commit("updateCurrentTimeOfNote")
//         },
//         checkIfTimeNotExistInNoteObj(checkObject, time) {
//             return Object.keys(checkObject)
//             .filter(item => item === time.toString())
//             .length === 0
//         },
//     },
// });
})();
