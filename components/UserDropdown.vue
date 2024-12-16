<template>
    <div class="dropdown">
        <button type="button" class="d-flex align-items-center" data-bs-toggle="dropdown" aria-expanded="false">
            <NuxtImg :src="getUrlImage(image)" class="rounded-circle me-1" densities="x1 x2" width="30" height="30"/>
            <span class="caption d-none d-md-block">{{ name }} {{ surname }}</span>
            <i class="material-symbols-outlined d-none d-md-block">expand_more</i>
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" @click="goToProfile">Veure perfil</a></li>
            <li><a class="dropdown-item" @click="logout">Tancar sessió</a></li>
        </ul>
    </div>
</template>

<script setup>
    import { useUserStore } from '~/stores/user';
    import { getUrlImage } from '~/helpers/imageHelper';

    const userStore = useUserStore();
    const router = useRouter();
    const name = computed(() => userStore.user?.name);
    const surname = computed(() => userStore.user?.surname);
    const image = computed(() => userStore.user?.image);
    const id = computed(() => userStore.user?.id);

    const goToProfile = () => {
        router.push(`/persones/${id.value}`);
    };

    const logout = async () => {
        try {
            const accessToken = useCookie('accessToken');
            const refreshToken = useCookie('refreshToken');
            accessToken.value = null;
            refreshToken.value = null;
            await userStore.setUser(null); 

            router.push('/auth/login');
        } catch (err) {
            console.error('Error al tancar sessió:', err);
        }
    }
</script>
