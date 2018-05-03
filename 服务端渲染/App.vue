<template>
    <div>
        <h1>{{message}}</h1>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                message : 'hello andy'
            }
        }
    }
</script>
<style>
    h1 {
        color: #f00;
        font-size: 20px;
    }
</style>