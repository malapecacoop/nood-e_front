<template>
    <div class="auth">
        <div class="auth__main-wrap">
            <div class="text-center mb-4">
                <h1>
                    <NuxtImg :src="`${ $frontUrl }/images/logo.svg`" densities="x1" alt="Nood·e" />
                </h1>
            </div>
            <form>
                <div class="mb-2">
                    <h2 class="subtitle-2 mb-1">Inicia sessió:</h2>
                    <input type="email" v-model="emailLogin" class="form-control mb-1" id="emailLogin"
                        placeholder="Email" name="emailLogin" autocomplete="email" />
                    <div class="input-errors" v-for="error of v$.emailLogin.$errors" :key="error.$uid">
                        <div class="p2 mb-1 text-danger">
                            {{ translateError(error.$validator) }}
                        </div>
                    </div>
                    <div class="input-group">
                        <input :type="passwordFieldType" v-model="passwordLogin" class="form-control" id="passwordLogin"
                            placeholder="Contrasenya" autocomplete="current-password" name="passwordLogin" />
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
                <Button buttonClass="btn btn-primary btn-sm w-100 mb-1" buttonType="submit" @action="login">
                    Inicia sessió
                </Button>
                <NuxtLink to="/auth/recuperar-contrasenya" class="caption mb-0 link-dark">Has oblidat la contrasenya?</NuxtLink>
            </form>
        </div>
    </div>
</template>

<script setup>
    import { useVuelidate } from '@vuelidate/core';
    import { required, email } from '@vuelidate/validators';
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

    const emailLogin = ref('');
    const passwordLogin = ref('');
    const error = ref(null);

    const rules = {
        emailLogin: { required, email },
        passwordLogin: { required },
    };

    const v$ = useVuelidate(rules, { emailLogin, passwordLogin });
    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;

    const login = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                const data = await useApiService('auth/login').create({
                    email: emailLogin.value,
                    password: passwordLogin.value,
                });

                const accessToken = useCookie('accessToken');
                const refreshToken = useCookie('refreshToken');
                accessToken.value = data.access_token; 
                refreshToken.value = data.refresh_token || null;

                nuxtApp.$router.push('/calendari');
                stopLoading();
            } catch (err) {
                console.error('Error general en el login:', err);
                error.value = 'Error al iniciar sesión';
                stopLoading();
                $Snackbar.show({
                    text: 'Usuari o contrasenya incorrectes',
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