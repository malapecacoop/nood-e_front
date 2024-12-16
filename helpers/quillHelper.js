import Quill from 'quill';
import { ref } from 'vue';

export const quillGetHTML = (inputDelta) => {
    const tempCont = document.createElement("div");
    (new Quill(tempCont)).setContents(inputDelta);
    return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
};

export const getDescriptionHTML = (description) => {
    const htmlDescription = ref('');

    if (description) {
        try {
            const delta = JSON.parse(description);
            const html = quillGetHTML(delta);
            htmlDescription.value = html;
        } catch (error) {
            htmlDescription.value = '';
        }
    } else {
        htmlDescription.value = '';
    }

    return htmlDescription;
};
