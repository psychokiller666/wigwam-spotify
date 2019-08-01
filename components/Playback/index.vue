<template>
    <div v-if="playLoaded && playback">
        <hr />
        <div class="w-100 bb b--black-05 mt2">
            <div class="fl w-20">
                <img :src='playback.track_window.current_track.album.images[0].url' class="ba bw1 db mid-gray"/>
                <!-- <sparkline>
                    <sparklineLine :data="spData7" :hasSpot="false" :limit="20" :styles="spLineStyles7" />
                    <sparklineLine :data="spData9" :hasSpot="false" :limit="20" />
                    <sparklineLine :data="spData8" :hasSpot="false" :limit="20" />
                </sparkline> -->
            </div>
            <div class="fr w-70">
                <h3 class="f6 tl fw4 gray mt0">状态：<span :class="playback.paused ? 'bg-black ph2 pv1 white': 'bg-dark-green ph2 pv1 white'">{{ playback.paused ? '停止播放' : '正在播放' }}</span></h3>
                <h3 class="f5 tl fw4 white mt0 pb1">{{ playback.track_window.current_track.name }} - {{ playback.track_window.current_track.artists[0].name }}</h3>
                <Progress class="fw4 white mt0 w-100" :duration="playback.duration" :position="playback.position"></Progress>
            </div>
        </div>
    </div>
</template>

<script>
// 进度条
import Progress from './progress'

export default {
    components: {
        Progress
    },

    computed: {
        playLoaded () {
            return this.$store.state.player.playLoaded
        },
        playback () {
            return this.$store.state.player.playback
        },
    },

    data () {
        return {
            spData7: (() => {
                const len = 30
                return Array.from({
                    length: len
                }, () => Math.floor(Math.random() * len))
            })(),
            spData9: (() => {
                const len = 30
                return Array.from({
                    length: len
                }, () => Math.floor(Math.random() * len))
            })(),
            spHasSpot7: false,
            spLineStyles7: {
                stroke: '#54a5ff',
                strokeWidth: 1
            },
            spData8: (() => {
                const len = 20
                return Array.from({
                    length: len
                    }, () => Math.floor(Math.random() * len))
                })(),
            spBarStyles8: {
                fill: '#d14',
                fillOpacity: 0.3
            }
        }
    },

    watch: {
        // playback(state) {
        //     // 转换成ms
        //     const position = state.position / this.$webPlaybackSdkProps().playerRefreshRateMs
            
        //     this.spData7.push(0)
        //     this.spData8.push(0)
        //     this.spData9.push(0)

        //     // console.log(state)
        //     if (state.paused) return false
            
        //     // 当前 Analysis sections
        //     if (state.track_window.current_track.id === this.currentId && this.analysisLoad) {
        //         for (let item of this.currentAnalysis.sections) {
        //             if (this.decimalPoint(item.start + item.duration) > position) {
        //                 console.log(item.start, position)
        //                 this.$store.dispatch('player/REQ_LINK_BPM', item.tempo)
        //                 break
        //             }
        //         }
        //     }

        //     // 节拍
        //     if (state.track_window.current_track.id === this.currentId && this.analysisLoad) {
                
        //         // beats
        //         for (let item of this.currentAnalysis.beats) {
        //             if (this.decimalPoint(item.start) > position) {
        //                 this.$axios.put('/link/beat-at-time')
        //                 this.spData7.push(item.confidence * 10)
        //                 break
        //             }
        //         }

        //         // tatums
        //         for (let item of this.currentAnalysis.tatums) {
        //             if (this.decimalPoint(item.start) > position) {
        //                 // console.log(item)
        //                 this.spData8.push(item.confidence * 10)
        //                 break
        //             }
        //         }

        //         // bar
        //         for (let item of this.currentAnalysis.bars) {
        //             if (this.decimalPoint(item.start) > position) {
        //                 this.spData9.push(item.confidence * 10)
        //             }
        //         }
        //         // state.position / this.$webPlaybackSdkProps().playerRefreshRateMs
        //     }

            
        // }
    },

    methods: {
        /**
         * 方法参考 https://github.com/francoborrelli/spotify-react-web-client/blob/master/src/spotify/webPlayback.jsx
         */

        // 处理playback state值
        async handleState(state) {
            if (state) {
                this.$store.dispatch('player/PONG_PLAYBACK', state)
                // this.$store.dispatch('player/REQ_FEATURES')
            } else {
                this.clearStatePolling();
                await this.waitForDeviceToBeSelected()
            }
        },

        // 等待Spotify sdk ready
        waitForSpotify() {
            return new Promise(resolve => {
                if ('Spotify' in window) {
                    resolve()
                } else {
                    window.onSpotifyWebPlaybackSDKReady = () => {
                        resolve()
                    }
                }
            })
        },

        // 等待设备被选中 
        waitForDeviceToBeSelected() {
            return new Promise(resolve => {
                this.deviceSelectedInterval = setInterval(() => {
                    if (this.webPlaybackInstance) {
                        this.webPlaybackInstance.getCurrentState().then(state => {
                            if (state !== null) {
                                this.startStatePolling();
                                clearInterval(this.deviceSelectedInterval)
                                resolve(state)
                            }
                        })
                    }
                })
            })
        },

        startStatePolling() {
            this.statePollingInterval = setInterval(async () => {
            let state = await this.webPlaybackInstance.getCurrentState();
                await this.handleState(state);
            }, this.$webPlaybackSdkProps().playerRefreshRateMs || 1000)
        },

        clearStatePolling() {
            clearInterval(this.statePollingInterval)
        },

        // setup playback事件
        async setupWebPlaybackEvents() {
            let { Player } = window.Spotify
                this.webPlaybackInstance = new Player({
                name: this.$webPlaybackSdkProps().playerName,
                volume: this.$webPlaybackSdkProps().playerInitialVolume,
                getOAuthToken: async callback => {
                if (typeof this.$webPlaybackSdkProps().onPlayerRequestAccessToken !== 'undefined') {
                    let userAccessToken = await this.$webPlaybackSdkProps().onPlayerRequestAccessToken()
                        callback(userAccessToken)
                    }
                }
            })

            this.webPlaybackInstance.on('initialization_error', e => {
                this.$webPlaybackSdkProps().onPlayerError('initialization_error:', e.message)
            })

            this.webPlaybackInstance.on('authentication_error', e => {
                this.$webPlaybackSdkProps().onPlayerRefreshAccessToken()
            })

            this.webPlaybackInstance.on('account_error', e => {
                this.$webPlaybackSdkProps().onPlayerError('account_error', e.message)
            })

            this.webPlaybackInstance.on('playback_error', e => {
                this.$webPlaybackSdkProps().onPlayerError('playback_error', e.message)
            })

            this.webPlaybackInstance.on('player_state_changed', async state => {
                await this.handleState(state)
            })

            this.webPlaybackInstance.on('ready', data => {
                // 选择当前设备
                this.$store.commit('player/SET_PLAYLOADED', true)
                // 连接websocket
                this.$store.dispatch('START_WEBSOCKET')

            })

            if (this.$webPlaybackSdkProps().playerAutoConnect) {
                this.webPlaybackInstance.connect()
            }
        },

        // setup 等待设备
        setupWaitingForDevice () {
            return new Promise(resolve => {
                this.webPlaybackInstance.on('ready', data => {
                    resolve(data)
                })
            })
        }
    },

    async mounted () {
        this.deviceSelectedInterval = null
        this.statePollingInterval = null
        this.webPlaybackInstance = null

        // 通知播放器正在加载
        this.$webPlaybackSdkProps().onPlayerLoading()

        // 等待Spotify加载播放器
        await this.waitForSpotify()

        // 设置实例和回调
        await this.setupWebPlaybackEvents()

        // 等待设备准备好
        let device_data = await this.setupWaitingForDevice()
        this.$webPlaybackSdkProps().onPlayerWaitingForDevice(device_data)

        // 等待设备被选中
        await this.waitForDeviceToBeSelected()
    }
}
</script>
