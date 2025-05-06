<template>
    <div class="auth">
        <div class="auth__main-wrap">
            <div class="text-center mb-4">
                <h1><NuxtImg :src="`${ $frontUrl }/images/logo.svg`" densities="x1" alt="Nood·e"/></h1>
            </div>
            <form>
                <div class="mb-2">
                    <h2 class="subtitle-2 mb-1">Has oblidat la contrasenya?</h2>
                    <p class="p2 mb-2">Facilita el teu email i t’enviarem les instruccions per crear-ne una nova.</p>
                    <input type="email" v-model="recoveryEmail" class="form-control mb-1" id="email" placeholder="Email" name="email" autocomplete="email">
                    <div class="input-errors" v-for="error of v$.recoveryEmail.$errors" :key="error.$uid">
                        <div class="p2 mb-1 text-danger">
                            {{ translateError(error.$validator) }}
                        </div>
                    </div>
                </div>
                <Button
                    buttonClass="btn btn-primary btn-sm w-100 mb-2"
                    buttonType="submit"
                    @action="recoveryPass"
                >
                    Enviar
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
    import { required, email } from '@vuelidate/validators';
    import { translateError } from '~/helpers/auth';
    import { useApiService } from '~/services/apiService';
    const { $frontUrl } = useNuxtApp();

    definePageMeta({
        layout: 'auth'
    });

    const recoveryEmail = ref('');

    const rules = {
        recoveryEmail: { required, email },
    };

    const v$ = useVuelidate(rules, { recoveryEmail });
    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;

    const { forgotPassword } = useApiService()

    const recoveryPass = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                await forgotPassword(recoveryEmail.value);
                $Snackbar.show({
                    text: "T'hem enviat un correu electronic amb les instruccions per recuperar la contrasenya",
                    pos: 'bottom-center',
                    duration: 3000,
                });
            } catch (err) {
                if (err.statusCode === 422) {
                    $Snackbar.show({
                        text: 'Si us plau, espera abans de tornar-ho a intentar.',
                        pos: 'bottom-center',
                        duration: 3000,
                    });
                } else {
                    $Snackbar.show({
                        text: "L'email no existeix a la base de dades",
                        pos: 'bottom-center',
                        duration: 3000,
                    });
                }
            }
        } else {
            console.log('Validación fallida');
        }
        stopLoading();
    };
</script>
