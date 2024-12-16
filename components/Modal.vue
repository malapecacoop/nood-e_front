<template>
    <div :id="`${id}`" class="modal fade" :class="modalClasses" tabindex="-1" :aria-hidden="ariaHidden"
        :aria-labelledby="`${id}-label`" :no-enforce-focus="noEnforceFocus">
        <div class="modal-dialog" :class="modalSize">
            <div class="modal-content" :data-testid="dataTestIds?.modal">
                <div v-if="$slots.title" class="modal-header">
                    <h5 id="post-update-modal-label" class="modal-title">
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div v-if="$slots.body" class="modal-body">
                    <slot name="body">
                        {{ bodyContent }}
                    </slot>
                </div>
                <template v-else-if="$slots.full">
                    <slot name="full">
                        {{ bodyContent }}
                    </slot>
                </template>
                <div v-show="baseButtons || extraButtons" class="modal-footer">
                    <slot name="footer">
                        <button v-show="baseButtons" class="btn btn-secondary" @click="buttonClick('cancel')">
                            Cancel.lar
                        </button>
                        <button v-show="baseButtons" class="btn btn-primary" :disabled="isLoading" @click="saveButtonClick">
                            <div v-if="isLoading" class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <span v-if="!isLoading">Acceptar</span>
                        </button>
                        <button v-for="button in extraButtons" :key="button.text" :class="button.class"
                            @click="buttonClick(button.action)">
                            {{ button.text }}
                        </button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
    const props = defineProps({
        id: {
            type: [Number, String],
            required: true,
            default: 'modal'
        },
        modalClasses: {
            type: String,
            default: '',
        },
        extraButtons: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: '',
        },
        bodyContent: {
            type: String,
            default: '',
        },
        ariaHidden: {
            type: Boolean,
            default: true
        },
        noEnforceFocus: {
            type: Boolean,
            default: true
        },
        baseButtons: {
            type: Boolean,
            default: true
        },
        modalSize: {
            type: String,
            default: ''
        },
        disableCloseOnClickOutside: {
            type: Boolean,
            default: false
        },
        dataTestIds: {
            type: Object,
            default: () => ({
                modal: '',
            }),
        },
    });
    const isLoading = ref(false);

    const emit = defineEmits(['save', 'cancel', 'loading']);

    const preventCloseOnClickOutside = () => {
        const modalElement = document.getElementById(`${props.id}`);
        modalElement.addEventListener('click', handleClickOutside, true);
    };

    const removePreventCloseOnClickOutside = () => {
        const modalElement = document.getElementById(`${props.id}`);
        modalElement.removeEventListener('click', handleClickOutside, true);
    };

    const handleClickOutside = (event) => {
        if (event.target.classList.contains('modal')) {
            event.stopPropagation();
        }
    };

    const buttonClick = (action) => {
        emit(action);
    };

    const eventExecuted = () => {
        isLoading.value = false;
    };

    const saveButtonClick = () => {
        isLoading.value = true;
        emit('save', eventExecuted);
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    };

    watch(() => props.disableCloseOnClickOutside, (newValue) => {
        if (newValue) {
            preventCloseOnClickOutside();
        } else {
            removePreventCloseOnClickOutside();
        }
    });

    onMounted(() => {
        if (props.disableCloseOnClickOutside) {
            preventCloseOnClickOutside();
        }
    });

    onBeforeUnmount(() => {
        removePreventCloseOnClickOutside();
    });
</script>
