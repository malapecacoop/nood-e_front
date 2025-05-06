<template>
    <div :id="`${id}`" class="modal fade" tabindex="-1" :aria-hidden="ariaHidden" :aria-labelledby="`${id}-label`">
        <div class="modal-dialog" :class="modalSize">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">                    
                    <component :is="pageComponent" v-if="pageComponent" v-bind="routeParams" :key="JSON.stringify(routeParams)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    id: { type: String, required: true },
    pagePath: { type: String, required: true },
    routeParams: { type: Object, default: () => ({}) },
    ariaHidden: { type: Boolean, default: true },
    modalSize: { type: String, default: 'modal-xl' },
})

const emit = defineEmits(['close'])
const pageComponent = shallowRef(null)
const pages = import.meta.glob('~/pages/**/*.vue')

watch(() => [props.routeParams.dateCreate, props.routeParams.id], async () => {
    if (!props.routeParams.dateCreate && !props.routeParams.id) return

    const resolvedPath = resolveDynamicPath(props.pagePath, props.routeParams)
    const fullPathOrigin = `/pages${props.pagePath}.vue`
    const loader = pages[fullPathOrigin]
    if (loader) {
        try {
            const mod = await loader()
            pageComponent.value = mod.default
        } catch (e) {
            console.error(`Error cargando "${resolvedPath}":`, e)
        }
    } else {
        console.warn(`No se encontró la página "${resolvedPath}"`)
    }
}, { immediate: true, deep: true })

function resolveDynamicPath(path, params) {
    return path.replace(/\[([^\]]+)]/g, (_, key) => params[key])
}
</script>