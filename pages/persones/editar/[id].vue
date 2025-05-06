<template>
    <div>
        <form>
            <div class="row">
                <div class="col-md-9">
                    <div class="page-prehead px-0">
                        <div class="breadcrumb">
                            <NuxtLink class="breadcrumb__item" to="/persones">Persones</NuxtLink>
                            <NuxtLink class="breadcrumb__item" :href="`/persones/${id}`">{{ data.name }} {{ data.surname }}</NuxtLink>
                            <span class="breadcrumb__item active">Edició</span>
                        </div>
                    </div>
                    <div class="d-flex mb-4">
                        <NuxtImg :src="getUrlImage(imageUrl)" ref="profileImage" class="rounded img-fluid" densities="x1 x2" width="150" height="150" :alt="data.name"/>
                        <div class="d-flex flex-column justify-content-end">
                            <label class="bd-link mb-1" for="upload-image">
                                <i class="material-symbols-outlined me-1">photo_camera</i>
                                <span class="p2">Canvia la imatge</span>
                                <input type="file" id="upload-image" name="user-image" class="d-none" @change="onImageChange"/>
                            </label>
                            <button type="button" class="bd-link" @click="removeImage">
                                <i class="material-symbols-outlined me-1">delete</i>
                                <span class="p2">Elimina la imatge</span>
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 col-lg-4">
                            <div class="form-group">
                                <label class="form-label" for="user-name">Nom</label>
                                <input v-model="userName" type="text" class="form-control" placeholder="Nom"
                                    id="user-name" name="user-name">
                                <div class="input-errors" v-for="error of v$.userName.$errors" :key="error.$uid">
                                    <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4">
                            <div class="form-group">
                                <label class="form-label" for="user-surname">Cognoms</label>
                                <input v-model="userSurname" type="text" class="form-control" placeholder="Cognoms"
                                    id="user-surname" name="user-surname">
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4">
                            <div class="form-group">
                                <label class="form-label" for="user-entity">Entitat</label>
                                <select v-model="userEntity" class="form-control js--select2" placeholder="Entitat"
                                    id="user-entity">
                                    <option value="">–</option>
                                    <option v-for="entity in entities" :key="entity.id" :value="entity.id">
                                        {{ entity.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="form-group">
                            <label class="form-label" for="user-description">Descripció</label>
                            <div class="wysiwyg-14">
                                <QuillEditor v-model="userDescription" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-6">
                    <div class="sticky-top pt-2">
                        <Button buttonClass="btn btn-primary w-100 mb-2" buttonType="button" @action="saveForm">
                            Desar canvis
                        </Button>
                        <Button buttonClass="btn btn-outline-primary w-100 mb-2" buttonType="button"
                            @action="showModal">
                            Descartar canvis
                        </Button>
                        <Button buttonClass="btn btn-outline-primary w-100" buttonType="button"
                            @action="showPasswordModal">
                            Canviar contrasenya
                        </Button>
                    </div>
                </div>
            </div>
        </form>
        <Modal id="UserConfirmChanges" @save="discardChanges"
            @cancel="$hideBootstrapModal('UserConfirmChanges')">
            <template #title>
                Vols descartar els canvis?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
        <Modal id="changePassword" @save="changePassword"
            @cancel="$hideBootstrapModal('changePassword')">
            <template #title>
                Canviar contrasenya
            </template>
            <template #body>
                <div class="form-group mb-2">
                    <label class="form-label" for="user-pass">Contrasenya</label>
                    <input v-model="userPass" type="password" class="form-control"
                        placeholder="Contrasenya" id="user-pass" name="user-pass">
                    <div class="input-errors" v-for="error in v$Password.userPass.$errors" :key="error.$uid">
                        <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="user-pass2">Repeteix la contrasenya</label>
                    <input v-model="userPass2" type="password" class="form-control"
                        placeholder="Repetir contrasenya" id="user-pass2" name="user-pass2">
                    <div class="input-errors" v-for="error in v$Password.userPass2.$errors" :key="error.$uid">
                        <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
    import { useVuelidate } from '@vuelidate/core';
    import { required, sameAs } from '@vuelidate/validators';
    import { translateError } from '~/helpers/auth';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    const nuxtApp = useNuxtApp();
    const { $Snackbar, $storageUrl } = nuxtApp;

    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const data = await useApiService('users').fetchById(id);

    const loadEntities = async () => {
        const entities = await useApiService('organizations').fetchAll();
    };
    loadEntities();

    const originalData = {
        userName: data.name,
        userSurname: data.surname,
        userEntity: data.organization_id,
        userPass: '',
        userPass2: '',
        userDescription: data.description,
        imageUrl: data.image
    };

    const { user, hasAdminRole } = storeToRefs(useUserStore());
    const isOwner = user.value.id == id;

    if (!hasAdminRole.value && !isOwner) {
        router.push(`/persones/${id}`);
    }

    const userName = ref(originalData.userName);
    const userSurname = ref(originalData.userSurname);
    const userEntity = ref(originalData.userEntity);
    const userPass = ref(originalData.userPass);
    const userPass2 = ref(originalData.userPass2);
    const userDescription = ref(originalData.userDescription);
    const imageUrl = ref(originalData.imageUrl);
    const imageFile = ref(null);

    const rules = {
        userName: { required },
    }

    const passwordRules = {
        userPass: { required },
        userPass2: { required, sameAsPassword: sameAs(userPass, 'Les contrasenyes han de ser iguals') }
    };

    const v$Password = useVuelidate(passwordRules, { userPass, userPass2 });

    const v$ = useVuelidate(rules, {
        userName: userName.value, 
        userSurname: userSurname.value, 
        userEntity: userEntity.value, 
        userDescription: userDescription.value
    });

    const userStore = useUserStore();
    const loggedInUserId = userStore.user?.id;

    const saveForm = async (props, stopLoading) => {
        v$.value.$touch()
        if (!v$.value.$invalid) {
            const user = await useApiService('users').update(id, {
                name: userName.value, 
                surname: userSurname.value, 
                organization_id: userEntity.value, 
                description: typeof userDescription.value === 'string' ? userDescription.value : JSON.stringify(userDescription.value),
                image: imageUrl.value,
                email: data.email
            });

            if (loggedInUserId == id) {
                userStore.setUser({
                    ...userStore.user,
                    image: user.image
                });
            }

            $Snackbar.show({
                text: 'Usuari editat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            router.push(`/persones/${id}`);
        } else {
            console.log('Validation failed')
        }
        stopLoading();
    }

    const onImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            imageFile.value = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl.value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        imageFile.value = null;
        imageUrl.value = originalData.imageUrl;
    };

    const discardChanges = (stopLoading) => {
        Object.keys(originalData).forEach(key => {
            if (key === 'imageUrl') {
                imageUrl.value = originalData[key];
            } else {
                eval(`${key}.value = originalData[key]`);
            }
        });
        imageFile.value = null;
        nuxtApp.$hideBootstrapModal('UserConfirmChanges');
        stopLoading();
    };

    const showModal = (props, callback) => {
        callback();
        nuxtApp.$showBootstrapModal('UserConfirmChanges');
    }

    const showPasswordModal = (props, callback) => {
        callback();
        nuxtApp.$showBootstrapModal('changePassword')
    }

    const changePassword = async (stopLoading) => {
        v$Password.value.$touch(); 
        if (!v$Password.value.$invalid) {
            try {
                await useApiService('users').update(`${id}/basic`, {
                    name: userName.value,
                    password: userPass.value, 
                    repeat_password: userPass2.value
                });
                $Snackbar.show({
                    text: 'Contrasenya editada amb éxit',
                    pos: 'bottom-center',
                    type: 'success',
                    duration: 3000,
                });
                nuxtApp.$hideBootstrapModal('changePassword');
            } catch (error) {
                console.error("Error al cambiar la contraseña:", error);
            } finally {
                stopLoading();  // Detiene el estado de carga
            }
        } else {
            stopLoading();  // Detiene el estado de carga si la validación falla
        }
    };
</script>

