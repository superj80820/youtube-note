function insert_main() {
    return new Promise((reslove, recject) => {
        (function(document) {
            "use strict";
            var s = document.createElement("script");
            s.src = chrome.extension.getURL("accessible.js");
            s.onload = function() {
                this.parentNode.removeChild(this);
                s = undefined
                reslove()
            };
            document.documentElement.appendChild(s)
        })(window.document);
    })
}
function checkInsertVueIdDone() {
    return new Promise((reslove, recject) => {
        window.setTimeout(() => {
            if (window.document.getElementById('vuejs') !== null) reslove()
        }, 1000)
    })
}
function formatTime(time) {
    return parseInt(time.toString().match(/^(\d+)\.*/)[1])
}

(async() => {
    await insert_main()
    await checkInsertVueIdDone();

    const ytController = {
        //Ref: https://developers.google.com/youtube/iframe_api_reference?csw=1
        getCurrentTime() {
            window.document.getElementById("ytControllerInput").innerHTML = '{"type": "getCurrentTime"}'
            return window.document.getElementById("ytControllerOutput").innerHTML
        },
        pauseVideo() {
            window.document.getElementById("ytControllerInput").innerHTML = '{"type": "pauseVideo"}'
        },
        seekTo(time) {
            window.document.getElementById("ytControllerInput").innerHTML = `{"type": "seekTo", "value": "${time}"}`
        },
        getTimeKeyLessOrThanCurrentTme(noteObj, lessOrThan) {
            currentTime = this.getCurrentTime()
            let allNoteTime = Object.keys(noteObj)
            .map(item => parseInt(item))
            if (allNoteTime.length === 0) {
                return null
            }
            let ret = ''
            switch (lessOrThan){
                case 'less':
                    ret = Math
                    .max(...allNoteTime 
                        .filter(item => item <= currentTime))
                    break
                case 'than':
                    ret = Math
                    .min(...allNoteTime 
                        .filter(item => item > currentTime))
                    break
            }
            if (ret === -Infinity || ret === Infinity){
                ret = currentTime
            }
            return ret.toString()
        },
    }

    const store = new Vuex.Store({
        state: {
            markDataInjectKey: null,
            noteObj: {},
            noteObjLength: 0,
            currentKey: 1,
            noteCache: '',
            videoId: ''
            },
        mutations: {
            updateCurrentNoteObj (state, note) {
                state.noteObj[state.markDataInjectKey] = note
                console.log(state.noteObj)
            },
            updateNoteObjByKey (state, payload) {
                state.markDataInjectKey = payload["key"]
                state.noteObj[payload["key"]] = payload["note"]
                state.noteObjLength = Object.keys(state.noteObj).length
                console.log(state.noteObj)
            },
            updateMarkDataInjectKey (state, key) {
                state.markDataInjectKey = key
                console.log(state.noteObj)
            },
            updateCurrentKey (state) {
                let yutebeCurrentTime = ytController.getTimeKeyLessOrThanCurrentTme(state.noteObj, 'less')
                state.currentKey = Object.keys(state.noteObj).indexOf(yutebeCurrentTime) + 1
                console.log(state.noteObj)
            },
            updateCurrentTimeOfNote (state) {
                let yutebeCurrentTime = formatTime(ytController.getCurrentTime())
                const deleteKey = Object.entries(state.noteObj)
                    .filter(item => item[1] === state.noteCache)
                state.noteObj[yutebeCurrentTime] = state.noteCache
                state.markDataInjectKey = yutebeCurrentTime
                delete state.noteObj[deleteKey[0][0]]
                console.log(state.noteObj)
            },
            updateNoteCache (state, note) {
                state.noteCache = note
                console.log(state.noteObj)
            },
            updateVideoId (state, videoId) {
                state.videoId = videoId
                console.log(`updateVideoId: Save video id ${state.videoId}`)
            },
            deleteNoteByKey (state, key) {
                let allNoteKeys = Object.keys(state.noteObj)
                let preNoteKey = allNoteKeys[allNoteKeys.indexOf(key) - 1]
                state.markDataInjectKey = preNoteKey
                state.noteCache = state.noteObj[state.markDataInjectKey]
                delete state.noteObj[key]
                state.noteObjLength = Object.keys(state.noteObj).length
                console.log(state.noteObj)
            }
        },
    })

    let viewComponent = {
        template: '<div v-html="output" class="style-scope ytd-watch-next-secondary-results-renderer autoImgSize scroll"></div>',
        data: function () {
            return {
                output: ''
            }
        },
        mounted() {
            this.rendenMarkdownToHtml()
            this.setInterval = window.setInterval(() => {
                let currentKey = ytController.getTimeKeyLessOrThanCurrentTme(this.$store.state.noteObj, 'less')
                this.$store.commit("updateCurrentKey")
                this.$store.commit("updateMarkDataInjectKey", currentKey)
                this.rendenMarkdownToHtml()
            }, 500)
        },
        destroyed() {
            window.clearInterval(this.setInterval)
        },
        methods: {
            rendenMarkdownToHtml() {
                let md = window.markdownit();
                let lastNote = this.$store.state.noteObj[this.$store.state.markDataInjectKey]
                if (typeof lastNote === 'string'){
                    let html = md.render(lastNote);
                    this.output = html
                } else if (lastNote === undefined) {
                    let html = md.render('');
                    this.output = html
                }
            },
        }
    };
    
    let editComponent = {
        template: `
        <mu-text-field v-model="note" multi-line :rows="21" full-width class="textarea"></mu-text-field><br/>
        `,
        data() {
            return {
            }
        },
        computed: {
            note: {
                get () {
                    return this.$store.state.noteCache
                },
                set (note) {
                    // this.noteCache = this.$store.state.noteObj[this.$store.state.markDataInjectKey]
                    this.$store.commit('updateNoteCache', note)
                    this.$store.commit('updateCurrentNoteObj', note)
                }
            }
        }
    };

    new Vue({
        el: "#vuejs",
        store,
        components: {
            'view-component': viewComponent,
            'edit-component': editComponent,
        },
        template: `
            <mu-container>
                <mu-tabs :value.sync="selectMode" color="red" indicator-color="yellow" full-width>
                    <mu-tab>觀看模式</mu-tab>
                    <mu-tab>編輯模式</mu-tab>
                </mu-tabs>
                <view-component v-if="selectMode === 0" :id="1"></view-component>
                <edit-component v-if="selectMode === 1"></edit-component>
                <mu-flex justify-content="center" style="margin: 5px;">
                    <mu-button small @click='saveNoteToCloud' color="red" style="margin: 1px;">
                        儲存
                    </mu-button>
                    <mu-button small @click='addNoteToNoteObj' color="red" style="margin: 1px;">
                        添加
                    </mu-button>
                    <mu-button small @click='deleteNote' color="red" style="margin: 1px;">
                        刪除
                    </mu-button>
                    <mu-button small @click='moveNoteTime' color="red" style="margin: 1px;">
                        移動
                    </mu-button>
                </mu-flex>
                <mu-flex justify-content="center" style="margin: 5px;">
                    <mu-pagination raised circle :total="$store.state.noteObjLength * 10" :current.sync="$store.state.currentKey" @change="paginationEvent()"></mu-pagination>
                </mu-flex>
            </mu-container>
        `,
        data: {
            ytplayer: null,
            noteObj: {},
            selectMode: 0,
            setInterval: null,
            videoId: '',
        },
        computed: {
            // current() {
            //     console.log('jiji')
            //     return this.$store.state.currentKey
            // }
        },
        watch: {
            markData() {
                if (this.markDataInjectKey !== null){
                    this.noteObj[this.markDataInjectKey] = this.markData
                }
            },
            // selectMode() {
            //     switch (this.selectMode) {
            //         case 0:
            //             this.onViewMode()
            //             break;
            //         case 1:
            //             this.onEditMode()
            //             break;
            //     }
            // },
        },
        created() {
            // ytController = document.getElementById("movie_player"); //Ref: https://developers.google.com/youtube/iframe_api_reference?csw=1
            const init = () => {
                let videoId = new URLSearchParams(window.location.search).get('v');
                this.$store.commit("updateVideoId", videoId)
            }
            init()
            window.addEventListener("yt-navigate-finish", function(event) {
                init()
            })
        },
        methods: {
            addNoteToNoteObj() {
                let yutebeCurrentTime = formatTime(ytController.getCurrentTime())
                console.log(yutebeCurrentTime)
                if (this.checkIfTimeNotExistInNoteObj(this.$store.state.noteObj, yutebeCurrentTime)) {
                    this.selectMode = 1
                    ytController.pauseVideo()
                    this.$store.commit("updateNoteObjByKey", {key: yutebeCurrentTime,note: ''})
                    this.$store.commit("updateMarkDataInjectKey", yutebeCurrentTime)
                    this.$store.commit("updateCurrentKey")
                    this.$store.commit('updateNoteCache', '')
                } else {
                    window.alert('此時間點已經有筆記囉')
                }
            },
            deleteNote() {
                let currentKey = ytController.getTimeKeyLessOrThanCurrentTme(this.$store.state.noteObj, 'less')
                this.$store.commit('deleteNoteByKey', currentKey)
                ytController.seekTo(currentKey)
                this.$store.commit("updateCurrentKey")
            },
            // switchLessOrThanNote(LessOrThan, selectMode) {
            //     switch (selectMode){
            //         case 'view':
            //             break
            //         case 'edit':
            //             this.markDataInjectKey = this.getTimeKeyLessOrThanCurrentTme(this.noteObj, formatTime(this.markDataInjectKey), LessOrThan)
            //             this.markData = this.noteObj[this.markDataInjectKey]
            //             ytController.seekTo(
            //                 this.getTimeKeyLessOrThanCurrentTme(this.noteObj, formatTime(this.markDataInjectKey), LessOrThan)
            //             )
            //             break
            //     }
            // },
            saveNoteToCloud() {
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "https://api.github.com/gists",
                    "method": "POST",
                    "headers": {
                        "authorization": "token d7f903aa51819b31d0d57412dab8cb4be5cc6469",
                        "content-type": "application/json"
                    },
                    "processData": false,
                    "data": JSON.stringify({
                        "description": "youtube-note-testing",
                        "public": true,
                        "files": {
                            "test": {
                                "content": JSON.stringify(this.$store.state.noteObj)
                            }
                        }
                    })
                }
                $.ajax(settings).done(function (response) {
                    console.log(response);
                });
            },
            paginationEvent() {
                let currentKey = Object.keys(this.$store.state.noteObj)[this.$store.state.currentKey - 1]
                ytController.seekTo(currentKey)
                this.$store.commit('updateNoteCache', this.$store.state.noteObj[currentKey])
                this.$store.commit("updateMarkDataInjectKey", currentKey)
            },
            // onEditMode() {
            //     ytController.pauseVideo()
            //     if (this.$store.state.markDataInjectKey !== null) {
            //         this.markData = this.noteObj[this.$store.state.markDataInjectKey]
            //     }
            //     var md = window.markdownit();
            //     var html = md.render('');
            //     $("#output").html(html);
            //     window.clearInterval(this.setInterval)
            // },
            moveNoteTime() {
                this.$store.commit("updateCurrentKey")
                this.$store.commit("updateCurrentTimeOfNote")
            },
            checkIfTimeNotExistInNoteObj(checkObject, time) {
                return Object.keys(checkObject)
                .filter(item => item === time.toString())
                .length === 0
            },
        },
    });
})()