import Snackbar from 'node-snackbar/dist/snackbar.min.js'
import 'node-snackbar/dist/snackbar.min.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('Snackbar', Snackbar)
});
