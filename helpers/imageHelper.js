import { useNuxtApp } from '#app';

export const getUrlImage = (image) => {
    if (image && image.includes('data:image')) {
        return image;
    }
    const { $storageUrl, $frontUrl } = useNuxtApp();
    return image ? `${$storageUrl}${image}`: `${$frontUrl}/images/default-image.webp`;
}