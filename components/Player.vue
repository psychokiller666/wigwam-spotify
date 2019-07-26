<template>
    <div>
        <div class="fl f6 w-10">{{ formatTime(position) }}</div>
            <div class="fl w-80">
                <client-only>
                    <VueSlider 
                    v-model="position"
                    :max="duration"
                    :tooltip= "'none'"
                    :processStyle="{'background': '#1db954'}"
                    :bg-style="{'background': '#737575'}"
                    :disabled= true
                    >
                        <template v-slot:dot="{ value, focus }">
                            <div :class="['custom-dot', { focus }]"></div>
                        </template>
                    </VueSlider>
                </client-only>
            </div>
        <div class="fl f6 w-10">{{ formatTime(duration) }}</div>
    </div>
</template>

<script>
    // import vueSlider from 'vue-slider-component'

    export default {
        props: {
            duration: {
                type: Number,
                default: 0
            },
            position: {
                type: Number,
                default: 0
            }
        },

        data() {
            return {
                progress: 0,
                progressInterval: null,
                isDragStart: false,
                songDuration: 0
            }
        },
        
        methods: {
            formatTime(ms) {
                let time = ms /1000;

                let day = Math.floor(time /60 /60 /24);

                let hour = Math.floor(time /60 /60) %24;

                let minute = Math.floor(time /60) %60;
                
                let second = Math.floor(time) %60;

                if (second < 10) {
                    second = '0' + second.toString()
                }

                return `${minute}:${second}`
            }
        }
    }
</script>
<style scoped>
    .custom-dot {
        display: none
    }
</style>
