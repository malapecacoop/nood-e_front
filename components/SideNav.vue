<template>
    <nav class="offcanvas-lg offcanvas-end side-nav" tabindex="-1" id="mainMenu" aria-label="Menú principal">
        <div class="text-end">
            <button type="button" class="icon-btn icon-btn-xl d-lg-none" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu" aria-controls="mainMenu">
                <i class="material-symbols-outlined">close</i>
            </button>
        </div>
        <ul class="side-nav__items">
            <li class="side-nav__item" :class="{ active: isActive('/calendari') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/calendari">
                    <i class="material-symbols-outlined me-1">calendar_today</i>
                    <span class="p2">Calendari</span>
                </NuxtLink>
            </li>
            <li class="side-nav__item" :class="{ active: isActive('/xat') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/xat">
                    <i class="material-symbols-outlined me-1">forum</i>
                    <span class="p2">Xat</span>
                </NuxtLink>
            </li>
            <li class="side-nav__item" :class="{ active: isActive('/debats') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/debats">
                    <i class="material-symbols-outlined me-1">check_box</i>
                    <span class="p2">Debat</span>
                </NuxtLink>
            </li>
            <li class="side-nav__item" :class="{ active: isActive('/persones') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/persones">
                    <i class="material-symbols-outlined me-1">people_alt</i>
                    <span class="p2">Persones</span>
                </NuxtLink>
            </li>
            <li class="side-nav__item" :class="{ active: isActive('/entitats') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/entitats">
                    <i class="material-symbols-outlined me-1">maps_home_work</i>
                    <span class="p2">Entitats</span>
                </NuxtLink>
            </li>
            <li class="side-nav__item" :class="{ active: isActive('/sales') }" data-bs-dismiss="offcanvas" data-bs-target="#mainMenu">
                <NuxtLink class="side-nav__link" to="/sales">
                    <i class="material-symbols-outlined me-1">meeting_room</i>
                    <span class="p2">Sales</span>
                </NuxtLink>
            </li>
        </ul>
        <button
            v-if="hasAdminRole"
            @click="$showBootstrapModal('invite')" 
            class="btn btn-sm btn-primary mt-3"
        >Convida a Nood·e</button>
        <Modal
            v-if="hasAdminRole"
            id="invite"
            @save="invite"
            @cancel="$hideBootstrapModal('invite')"
            >
            <template #title>
                Convidar a Nood·e
            </template>
            <template #body>
                <textarea v-model="emails" class="form-control mb-2" rows="5" placeholder="Separa el emails amb una coma.."></textarea>
            </template>
        </Modal>
    </nav>
</template>

<script setup>
    import useVuelidate from '@vuelidate/core';
    import { required, helpers } from '@vuelidate/validators';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';

    const { hasAdminRole } = storeToRefs(useUserStore());

    const emails = ref('');
    const rules = {
        emails: {
            required,
            isEmailList: helpers.withMessage(
                'Introdueix correus electrònics vàlids separats per comes',
                (value) => {
                    if (!value) return false;
                    const emailArray = value.split(',').map(email => email.trim());
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailArray.every(email => emailRegex.test(email));
                }
            )
        }
    };

    const v$ = useVuelidate(rules, { emails });

    const route = useRoute();
    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;

    const isActive = (path) => route.path.startsWith(path);

    const invite = async () => {
        v$.value.$touch();
        if (v$.value.$invalid) {
            $Snackbar.show({
                text: 'Si us plau, introdueix correus electrònics vàlids',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            const emailArray = emails.value.split(',').map(email => email.trim());

            await useApiService('users/mass-invite').create({
                emails: emailArray
            });

            $Snackbar.show({
                text: 'Invitacions enviades amb èxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });

            nuxtApp.$hideBootstrapModal('invite');
        } catch (error) {
            $Snackbar.show({
                text: "Hi ha hagut un error a l'enviar una invitació. Fes un intent més tard",
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
        }
    }
</script>

