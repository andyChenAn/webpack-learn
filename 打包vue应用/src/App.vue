<template>
    <div id="app">
        <h1>{{message}}</h1>
    </div>
</template>
<script>
export default {
    data () {
        return {
            message : 'hello world'
        }
    }
}
</script>
<style>
*{
    margin: 0;
    padding: 0;
    list-style: none;
}
body {
    font-family: 'Courier New', Courier, monospace;
}
h1{
    font-size: 20px;
    color: #f00;
}
</style>

