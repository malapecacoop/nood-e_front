import { useUserStore } from '~/stores/user';
import { useApiService } from '~/services/apiService';

export default defineNuxtRouteMiddleware(async (to) => {
    const accessToken = useCookie('accessToken');

    const isAuthRoute = [
        '/auth/login', 
        '/invitation', 
        '/auth/nova-contrasenya', 
        '/auth/recuperar-contrasenya'
    ].includes(to.path);

    if (to.path == '/invitation') return;
    
    if (isAuthRoute && accessToken.value) {
        console.warn('L\'usuari ja està autenticat, redirigint al calendari');
        if (to.path !== '/calendari') {
            return navigateTo('/calendari');
        }
    }

    if (isAuthRoute) return;

    const userStore = useUserStore(); 

    if (!userStore.user) {
        try {
            const user = await useApiService('me').fetchAll();
            await userStore.setUser(user);
        } catch (err) {
            console.error('Error al carregar l\'usuari:', err);
            accessToken.value = null;
            return navigateTo('/auth/login');
        }
    }
});
