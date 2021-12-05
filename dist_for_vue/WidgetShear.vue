<template>
    <div id="cropper_easy">
        <div id="cropper_easy_inner">
            <img :src="src" id="cropper_easy_inner_img" @load="shear.init()">
            <div id="cropper_easy_inner_window"></div>
        </div>            
    </div>
</template>

<script>
let Shear = require('../dist/shear.min.js') // import Shear from '../dist/shear.min.js'

    export default {
        props:{
            src: String,
            ratio: Number
        },
        data() {
            return {
                shear: null
            }
        },
        mounted() {
            this.shear = new Shear(this.ratio)
        },
        methods: {
            result() {
                return this.shear.result()
            }
        }
    }
</script>

<style lang="sass" scoped>
@import ./shear.sass
</style>