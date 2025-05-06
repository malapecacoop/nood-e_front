import Quill from 'quill';

export const quillGetHTML = (inputDelta) => {
    const tempCont = document.createElement("div");
    (new Quill(tempCont)).setContents(inputDelta);
    return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
};

export const getDescriptionHTML = (description) => {
    if (description != '') {
        try {
            const delta = JSON.parse(description);
            const html = quillGetHTML(delta);
            return html;
        } catch (error) {
            return '';
        }
    }
    return '';
};
