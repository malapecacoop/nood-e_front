<template>
    <div class="auth">
        <div class="auth__main-wrap">
            <div class="text-center mb-4">
                <h1><NuxtImg :src="`${ $frontUrl }/images/logo.svg`" densities="x1" alt="Nood·e"/></h1>
            </div>
            <form>
                <div class="mb-2">
                    <h2 class="subtitle-2 mb-2">Crea una nova contrasenya:</h2>
                    <div class="input-group mb-2">
                        <input :type="passwordFieldType" v-model="passwordLogin" class="form-control" id="passwordLogin" placeholder="Nova contrasenya" autocomplete="new-password">
                        <div class="input-group-text">
                            <button type="button" @click.prevent="togglePasswordVisibility"
                                class="material-symbols-outlined icon-size-16"
                                aria-label="Mostrar o ocultar contrasenya">
                                {{ passwordFieldType === 'password'
                                    ? 'visibility_off'
                                    : 'visibility' }}
                            </button>
                        </div>
                    </div>
                    <div class="input-errors" v-for="error of v$.passwordLogin.$errors" :key="error.$uid">
                        <div class="p2 mt-1 text-danger">
                            {{ translateError(error.$validator) }}
                        </div>
                    </div>
                </div>
                <Button
                    buttonClass="btn btn-primary btn-sm w-100 mb-2"
                    buttonType="submit"
                    @action="login"
                >
                    Acceptar i iniciar sessió
                </Button>
                <div class="text-center">
                    <NuxtLink to="/auth/login" class="caption mb-0 link-dark">Torna per iniciar sessió</NuxtLink>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
    import { useVuelidate } from '@vuelidate/core';
    import { required, email, minLength } from '@vuelidate/validators';
    const { $frontUrl } = useNuxtApp();
    import {
        translateError,
        passwordFieldType,
        togglePasswordVisibility,
    } from '~/helpers/auth';
    import { useApiService } from '~/services/apiService';

    definePageMeta({
        layout: 'auth',
    });

    const passwordLogin = ref('');

    const rules = {
        passwordLogin: { required, minLength: minLength(9) },
    };

    const v$ = useVuelidate(rules, { passwordLogin });
    const nuxtApp = useNuxtApp();
    const route = useRoute();
    const { $Snackbar } = nuxtApp;

    const login = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                const data = await useApiService('auth/reset-password').create({
                    password: passwordLogin.value,
                    token: route.query.token,
                    email: route.query.email,
                });

                $Snackbar.show({
                    text: 'Contrasenya canviada amb éxit',
                    pos: 'bottom-center',
                    duration: 3000,
                });

                nuxtApp.$router.push('/calendari');
                
            } catch (err) {
                console.error('Error general en el login:', err);
                stopLoading();
                $Snackbar.show({
                    text: 'Hi ha hagut un error',
                    pos: 'bottom-center',
                    duration: 3000,
                });
            }
        } else {
            console.log('Validación fallida');
            stopLoading();
        }
    };
</script>