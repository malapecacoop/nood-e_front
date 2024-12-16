import { Modal } from 'bootstrap';

export default defineNuxtPlugin((nuxtApp) => {
    const showBootstrapModal = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = new Modal(modalElement);
            modal.show();
        } else {
            console.error(`Modal with id ${modalId} not found.`);
        }
    };

    const hideBootstrapModal = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        } else {
            console.error(`Modal with id ${modalId} not found.`);
        }
    };

    nuxtApp.provide('showBootstrapModal', showBootstrapModal);
    nuxtApp.provide('hideBootstrapModal', hideBootstrapModal);
});
