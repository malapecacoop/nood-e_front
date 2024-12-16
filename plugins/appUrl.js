export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const storageUrl = `${config.public.appUrl}/storage/`;
    const frontUrl = `${config.public.frontUrl}`;

    return {
        provide: {
            storageUrl,
            frontUrl,
        }
    };
});
  