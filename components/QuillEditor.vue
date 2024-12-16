<template>
    <div>
        <div ref="editorContainer"></div>
    </div>
</template>

<script setup>
    import Quill from 'quill';
    import 'quill/dist/quill.snow.css';

    const props = defineProps({
        modelValue: {
            type: [Object, String],
            default: () => ({ ops: [] }),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    });

    const emit = defineEmits(['update:modelValue']);

    const editorContainer = ref(null);
    let quillEditor = null;
    let toolbarRef = null;

    onMounted(() => {
        if (editorContainer.value) {
            quillEditor = new Quill(editorContainer.value, {
                theme: 'snow',
                modules: {
                    toolbar: true,
                },
            });

            toolbarRef = editorContainer.value.previousElementSibling;

            if (props.modelValue) {
                let initialContent;

                if (typeof props.modelValue === 'string') {
                    try {
                        initialContent = JSON.parse(props.modelValue);
                    } catch (error) {
                        initialContent = props.modelValue;
                    }
                } else {
                    initialContent = props.modelValue;
                }

                quillEditor.setContents(initialContent);
            }

            quillEditor.enable(!props.disabled);
            if (props.disabled) {
                toolbarRef.style.display = 'none';
            }

            quillEditor.on('text-change', () => {
                const content = quillEditor.getContents();
                emit('update:modelValue', content);
            });
        }
    });

    watch(() => props.modelValue, (newValue) => {
        if (quillEditor) {
            const currentContent = quillEditor.getContents();
            const newContent = typeof newValue === 'string' 
                ? JSON.parse(newValue) 
                : newValue;

            if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
                quillEditor.setContents(newContent);
            }
        }
    });

    watch(() => props.disabled, (newVal) => {
        if (quillEditor) {
            quillEditor.enable(!newVal);
            if (toolbarRef) {
                toolbarRef.style.display = newVal ? 'none' : 'block';
            }
        }
    });
</script>

<style scoped lang="css">
    :deep(.ql-editor) {
        min-height: 200px;
    }

    :deep(.ql-toolbar.ql-snow) {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    :deep(.ql-container.ql-snow) {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    :deep(.ql-toolbar.ql-snow + .ql-container.ql-snow) {
        border-top: 1px solid #ccc;
    }
</style>
