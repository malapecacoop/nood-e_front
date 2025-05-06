<template>
    <div v-if="loading">
        <button type="button" :class="buttonClass" disabled>
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </button>
    </div>
    <div v-else>
        <button v-if="buttonType === 'button' || buttonType === 'submit'" 
            :type="buttonType" :class="buttonClass" @click.prevent="sendEvent" :disabled="disabled" :aria-expanded="buttonAriaExpanded">
            <slot></slot>
        </button>
        <NuxtLink v-else :to="buttonLink" :class="buttonClass" @click.prevent="handleLinkClick" :aria-expanded="buttonAriaExpanded">
            <slot></slot>
        </NuxtLink>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const props = defineProps({
        buttonType: { type: String, default: 'button' },
        buttonClass: { type: String, default: 'btn' },
        buttonLink: { type: String, default: '#' },
        disabled: { type: Boolean, default: false },
        loadingText: { type: Boolean, default: true },
        actionAttr: { type: [String, Number, Object, Array, Boolean], default: false },
        buttonToggle: { type: String },
        buttonAriaExpanded: { type: Boolean }
    });

    const loading = ref(false);
    const emit = defineEmits(['action']);
    const router = useRouter();

    const eventExecuted = () => {
        loading.value = false;
    };

    const sendEvent = async (event) => {
        if (props.buttonType === 'button' || props.buttonType === 'submit') {
            event.preventDefault();
            loading.value = true;
            emit('action', props.actionAttr, eventExecuted);
        } else {
            event.preventDefault();
            emit('action', props.actionAttr);
            await router.push(props.buttonLink);
        }
    };

    const handleLinkClick = async (event) => {
        event.preventDefault();
        emit('action', props.actionAttr);

        if (props.buttonLink.includes('#')) {
            const anchor = props.buttonLink.split('#')[1];
            const element = document.getElementById(anchor);
            if (element) element.scrollIntoView();
        } else {
            await router.push(props.buttonLink);
        }
    };
</script>
