<template>
    <div>
        <form>
            <div class="row">
                <div class="col-md-9">
                    <div class="page-prehead">
                        <div class="breadcrumb">
                            <a class="breadcrumb__item" href="/debats">Espais de debat</a>
                            <span class="breadcrumb__item active">Creació</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="debate-name">Títol de l’espai de debat</label>
                        <input type="text" class="form-control" v-model="title" placeholder="Nom" id="debate-name" name="debate-name">
                        <div class="input-errors" v-for="error of v$.title.$errors" :key="error.$uid">
                            <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="user-description">Descripció</label>
                        <div class="wysiwyg-14">
                            <QuillEditor v-model="description" />
                        </div>
                    </div>
                    <div class="mb-6">
                        <h2 class="subtitle-2 mb-2">Tria les persones per convidar:</h2>
                        <div class="form-check form-group">
                            <input v-model="isPublic" class="form-check-input" type="checkbox" value="" id="public-debate" @change="handleIsPublicChange">
                            <label class="form-check-label" for="public-debate">
                                Espai de debat públic
                            </label>
                        </div>
                        <div v-if="!isPublic">
                            <multiselect
                                v-model="selectedGuests"
                                placeholder="Escull un convidat"
                                :options="filteredData"
                                :searchable="true"
                                :multiple="true"
                                track-by="name"
                                label="name"
                                :show-labels="false"
                                @search-change="onSearchChange"
                                :disabled="!editView"
                            >
                                <template #selection="{ values, search, isOpen }">
                                    <span class="multiselect__single"
                                        v-if="values.length"
                                        v-show="!isOpen">{{ values.length }} usuaris seleccionats</span>
                                </template>
                                <template #option="{ option }">
                                    <div class="d-flex align-items-center mb-1">
                                        <NuxtImg :src="getUrlImage(option.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="42" height="42"/>
                                        <p class="p2 me-1">{{ option.name }}</p>
                                    </div>
                                </template>
                            </multiselect>
                            <div class="mt-2">
                                <div v-for="guest in selectedGuests" :key="guest.name" class="d-flex align-items-center justify-content-between mb-1">
                                    <div class="d-flex align-items-center">
                                        <NuxtImg :src="getUrlImage(guest.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="42" height="42"/>
                                        <p class="p2 me-1">{{ guest.name }}</p>
                                    </div>
                                    <Button
                                        buttonClass="btn icon-btn icon-btn-white"
                                        buttonType="button"
                                        @click="removeGuest(guest)"
                                        v-if="editView"
                                    >
                                        <i class="material-symbols-outlined">close</i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-6">
                    <div class="sticky-top pt-2">
                        <button type="button" @click="saveForm" class="btn btn-primary mb-1 w-100">
                            Desar canvis
                        </button>
                        <button type="button" class="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#DiscussionConfirmChanges">
                            Descartar canvis
                        </button>
                    </div>
                </div>
            </div>
        </form>
        <Modal id="DiscussionConfirmChanges" @save="discardChanges"
            @cancel="$hideBootstrapModal('DiscussionConfirmChanges')">
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
    import Multiselect from 'vue-multiselect';
    import 'vue-multiselect/dist/vue-multiselect.css';
    import { getUrlImage } from '~/helpers/imageHelper';

    const { $Snackbar } = useNuxtApp();

    const originalData = {
        title: '',
        description: { ops: [] },
        selectedGuests: [],
        filteredData: [],
        isPublic: false
    };

    const title = ref('');
    const description = ref('');
    const selectedGuests = ref([]);
    const filteredData = ref([]);
    const editView = ref(true);
    const data = ref([]);
    const isPublic = ref(false);

    const rules = {
        title: { required },
    }

    const v$ = useVuelidate(rules, {title});
    const nuxtApp = useNuxtApp();

    const allUsers = await useApiService('users').fetchAllInSearchComponent();
    data.value = allUsers;
    filteredData.value = allUsers;
    
    const saveForm = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            try {
                const memberIds = selectedGuests.value.map(guest => guest.id);

                await useApiService('discussions').create({
                    title: title.value,
                    description: typeof description.value === 'string' ? description.value : JSON.stringify(description.value),
                    is_public: isPublic.value,
                    members: memberIds
                });

                $Snackbar.show({
                    text: 'Espai de debat creat amb éxit',
                    pos: 'bottom-center',
                    type: 'success',
                    duration: 3000,
                });

                nuxtApp.$router.push('/debats');
            } catch (error) {
                $Snackbar.show({
                    text: 'Hi ha hagut un error al crear un espai de debat. Fes un intent més tard',
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

    const discardChanges = () => {
        Object.keys(originalData).forEach(key => {
            eval(`${key}.value = originalData[key]`);
        });
        nuxtApp.$hideBootstrapModal('DiscussionConfirmChanges');
    };

    const removeGuest = (guest) => {
        selectedGuests.value = selectedGuests.value.filter(g => g.name !== guest.name);
    };

    const onSearchChange = (search) => {
        if (search) {
            filteredData.value = data.value.filter(option => 
                option.name.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            filteredData.value = data.value;
        }
    };

    const handleIsPublicChange = () => {
        if (isPublic.value) {
            selectedGuests.value = [];
        }
    };
</script>
