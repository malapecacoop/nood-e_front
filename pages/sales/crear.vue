<template>
    <div>
        <form>
            <div class="row">
                <div class="col-md-9">
                    <div class="page-prehead">
                        <div class="breadcrumb">
                            <NuxtLink class="breadcrumb__item" to="/sales">Sales</NuxtLink>
                            <span class="breadcrumb__item active">Creació</span>
                        </div>
                    </div>
                    <div class="d-flex mb-4">
                        <NuxtImg :src="getUrlImage(imageUrl)" class="rounded img-fluid" densities="x1 x2" width="150" height="150" alt=""/>
                        <div class="d-flex flex-column justify-content-end">
                            <label class="bd-link mb-1" for="upload-image">
                                <i class="material-symbols-outlined me-1">photo_camera</i>
                                <span class="p2">Canvia la imatge</span>
                                <input type="file" id="upload-image" name="company-image" class="d-none" @change="onImageChange"/>
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
                                <label class="form-label" for="company-name">Nom</label>
                                <input type="text" class="form-control" v-model="name" placeholder="Nom" id="company-name" name="company-name">
                                <div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
                                    <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="form-group">
                            <label class="form-label" for="company-description">Descripció</label>
                            <div class="wysiwyg-14">
                                <QuillEditor v-model="description" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-6">
                    <div class="sticky-top pt-2">
                        <Button
                            buttonClass="btn btn-primary w-100 mb-2"
                            buttonType="button"
                            @action="saveForm"
                        >
                            Desar canvis
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100"
                            buttonType="button"
                            @action="showModal"
                        >
                            Descartar canvis
                        </Button>
                    </div>
                </div>
            </div>
        </form>
        <Modal id="EntityConfirmChanges" @save="discardChanges"
            @cancel="$hideBootstrapModal('EntityConfirmChanges')">
            <template #title>
                Vols descartar els canvis?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
    </div>
</template>

<script setup>
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { translateError } from '~/helpers/auth';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    const { $Snackbar } = useNuxtApp();
    const nuxtApp = useNuxtApp();
    const { hasAdminRole } = storeToRefs(useUserStore());

    if (!hasAdminRole.value) {
        nuxtApp.$router.push(`/sales`);
    }

    const originalData = {
        name: '',
        description: { ops: [] },
        imageUrl: ''
    };

    const name = ref('');
    const description = ref('');
    const imageUrl = ref('');
    const imageFile = ref(null);

    const rules = {
        name: { required }
    }

    const v$ = useVuelidate(rules, {name, description});

    const saveForm = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                await useApiService('rooms').create({
                    name: name.value,
                    description: typeof description.value === 'string' ? description.value : JSON.stringify(description.value),
                    image: imageUrl.value,
                    is_available: true
                });

                $Snackbar.show({
                    text: 'Sala creada amb éxit',
                    pos: 'bottom-center',
                    type: 'success',
                    duration: 3000,
                });

                nuxtApp.$router.push('/sales');
            } catch (error) {
                $Snackbar.show({
                    text: 'Hi ha hagut un error al crear una sala. Fes un intent més tard',
                    pos: 'bottom-center',
                    type: 'error',
                    duration: 3000,
                });
                stopLoading();
            }
        } else {
            console.log('Validation failed');
            stopLoading();
        }
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

    const discardChanges = () => {
        Object.keys(originalData).forEach(key => {
            if (key === 'imageUrl') {
                imageUrl.value = originalData[key];
            } else {
                eval(`${key}.value = originalData[key]`);
            }
        });
        imageFile.value = null;
        nuxtApp.$hideBootstrapModal('EntityConfirmChanges');
    };

    const showModal = (props, callback) => {
        callback();
        nuxtApp.$showBootstrapModal('EntityConfirmChanges');
    }
</script>
