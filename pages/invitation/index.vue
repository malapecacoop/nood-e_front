<template>
    <div class="auth">
        <div class="auth__main-wrap">
            <div class="text-center mb-4">
                <h1><NuxtImg :src="`${ $frontUrl }/images/logo.svg`" densities="x1" alt="Nood·e"/></h1>
            </div>
            <form>
                <div class="mb-2">
                    <h2 class="subtitle-2 mb-2">Registre:</h2>
                    <div class="mb-2">
                        <p class="p2 mb-1">T’estàs registrant amb el mail:</p>
                        <span class="tag">{{ email }}</span>
                    </div>
                    <div class="row gutters-sm">
                        <div class="col-md-6">
                            <input 
                                type="text" 
                                v-model="name" 
                                class="form-control mb-1" 
                                id="name" 
                                placeholder="Nom"
                                name="name" 
                                autocomplete="name"
                            >
                            <div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
                                <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <input 
                                type="text" 
                                v-model="lastName" 
                                class="form-control mb-1" 
                                id="lastName" 
                                placeholder="Cognoms" 
                                name="lastName" 
                                autocomplete="family-name"
                            >
                        </div>
                    </div>
                    <div class="input-group">
                        <input
                            :type="passwordFieldType"
                            v-model="password"
                            class="form-control"
                            id="passwordLogin"
                            placeholder="Contrasenya"
                            autocomplete="current-password"
                            name="passwordLogin"
                        />
                        <div class="input-group-text">
                            <button
                                type="button"
                                @click.prevent="togglePasswordVisibility"
                                class="material-symbols-outlined icon-size-16"
                                aria-label="Mostrar o ocultar contrasenya"
                            >
                            {{ passwordFieldType === 'password' ? 'visibility_off' : 'visibility' }}
                            </button>
                        </div>
                    </div>
                    <div class="input-errors" v-for="error of v$.password.$errors" :key="error.$uid">
                        <div class="p2 mb-1 mt-1 text-danger">{{ translateError(error.$validator) }}</div>
                    </div>
                </div>
                <div class="form-check mb-2">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        v-model="termsAccepted" 
                        id="terms-accept"
                    >
                    <label class="form-check-label caption" for="terms-accept">
                        Acceptes els termes legals
                    </label>
                    <p v-if="v$.termsAccepted.$error" class="p2 mb-1 text-danger">Has d'acceptar els termes legals</p>
                </div>
                <Button
                    buttonClass="btn btn-primary btn-sm w-100 mb-3"
                    buttonType="submit"
                    @action="register"
                >
                    Registra't
                </Button>
                <div class="text-center">
                    <NuxtLink to="/auth/login" class="caption mb-0 link-dark">Ja ets usuària? Inicia sessió</NuxtLink>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
    import useVuelidate from '@vuelidate/core';
    import { required, sameAs, minLength } from '@vuelidate/validators';
    import { translateError, passwordFieldType, togglePasswordVisibility } from '~/helpers/auth';
    import { useApiService } from '~/services/apiService';
    const { $frontUrl } = useNuxtApp();

    definePageMeta({
        layout: 'auth',
    });

    const email = ref('');
    const name = ref('');
    const lastName = ref('');
    const password = ref('');
    const termsAccepted = ref(false);
    const router = useRouter();
    const route = useRoute();

    const rules = {
        name: { required },
        password: { required, minLength: minLength(9) },
        termsAccepted: { required, sameAs: sameAs(true) },
    };

    const v$ = useVuelidate(rules, { name, password, termsAccepted });

    const userId = route.query.user_id;
    const signature = route.query.signature;

    if (userId && signature) {
        try {
            const response = await useApiService(`auth/invitation/${userId}?signature=${signature}`).create();
            
            const accessToken = useCookie('accessToken');
            const refreshToken = useCookie('refreshToken');
            accessToken.value = await Promise.resolve(response.access_token);
            refreshToken.value = await Promise.resolve(response.refresh_token || null);

            const user = await useApiService('me').fetchAll();
            email.value = user.email;

        } catch (err) {
            console.error('Error en la crida a la API:', err);
            const accessToken = useCookie('accessToken');
            const refreshToken = useCookie('refreshToken');
            accessToken.value = null;
            refreshToken.value = null;
            router.push('/auth/login');
        }
    } else {
        router.push('/error');
    }

    const register = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                await useApiService('users').update(`${userId}/basic`, {
                    email: email.value,
                    password: password.value,
                    name: name.value,
                    surname: lastName.value,
                });

                router.push('/calendari');

            } catch (err) {
                console.error('Error general en el registre:', err);
                stopLoading();
            }
        } else {
            console.log('Validació fallida');
            stopLoading();
        }
    };
</script>

