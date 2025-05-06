<template>
    <div>
        <div class="page-prehead">
            <div class="breadcrumb">
                <a class="breadcrumb__item" href="/entitats">Entitats</a>
                <span class="breadcrumb__item active">{{ data.name }}</span>
            </div>
            <div
                v-if="hasAdminRole || isOwner"
                class="page-prehead__ctas"
            >
                <Button
                    :buttonLink="`editar/${id}`"
                    buttonClass="btn btn-sm btn-outline-primary"
                    buttonType="hiperlink"
                >
                    Editar
                </Button>
                <div 
                    v-if="hasSuperadminRole"
                    class="dropdown"
                >
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="$showBootstrapModal('EntityConfirmDelete')">Eliminar</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <NuxtImg :src="getUrlImage(data.image)" class="rounded mb-4 img-fluid w-100" densities="x1 x2" width="234" height="234" :alt="data.name"/>
            </div>
            <div class="col-md-9">
                <div class="d-flex mb-4">
                    <i class="material-symbols-outlined me-1">maps_home_work</i>
                    <div class="d-flex align-items-center">
                        <h1 class="h5">{{ data.name }}</h1>
                    </div>
                </div>
                <div class="mb-4">
                    <h2 class="subtitle-2 mb-1">Descripció</h2>
                    <div class="wysiwyg-14">
                        <div v-html="htmlDescription"></div>
                    </div>
                </div>
                <div class="mb-4">
                    <h2 class="subtitle-2 mb-1">Equip de {{ data.name }}:</h2>
                    <Datatable :data="data.users" :columns="columns" />
                </div>
            </div>
        </div>
        <Modal id="EntityConfirmUserDelete" @save="deleteUserEntity"
            @cancel="$hideBootstrapModal('EntityConfirmUserDelete')">
            <template #title>
                Segur que vols excloure aquest usuari de l'entitat?
            </template>
        </Modal>
        <Modal 
            v-if="hasSuperadminRole"
            id="EntityConfirmDelete" 
            @save="deleteEntity"
            @cancel="$hideBootstrapModal('EntityConfirmDelete')"
        >
            <template #title>
                Segur que vols eliminar aquesta entitat?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
    </div>
</template>

<script setup>
    import Datatable from '~/components/Datatable.vue';
    import { useApiService } from '~/services/apiService';
    import { getDescriptionHTML } from '~/helpers/quillHelper';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    const nuxtApp = useNuxtApp();
    const { user, hasAdminRole, hasSuperadminRole } = storeToRefs(useUserStore());
    const { $Snackbar } = nuxtApp;
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const userToDelete = ref(null);
    const isOwner = ref(false);
    const htmlDescription = ref('');
    const data = ref(null);

    const loadOrganizations = async () => {
        data.value = await useApiService('organizations').fetchById(id);
        isOwner.value = data.value.owner ? user.value.id == data.value.owner.id : false;
        htmlDescription.value = getDescriptionHTML(data.value.description);
    };
    await loadOrganizations();

    const columns = [
        { 
            data: 'name', 
            title: 'Nom',
            render: (item, type, row) => {
                return `
                    <div>
                        <img src="${getUrlImage(row.image)}" alt="${row.name}" class="me-2 thumb" style="width: 30px; height: 30px;" />
                        ${item}
                    </div>
                `;
            }
        },
        {
            data: null, 
            title: 'Accions', 
            render: (item, type, row) => {
                let perfil = `<a href="/persones/${row.id}" class="btn btn-sm btn-outline-primary">Veure perfil</a>`
                let exclude = (hasAdminRole || isOwner) 
                    ? `<button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="material-symbols-outlined icon-size-20">more_vert</i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="showUserDeleteModal(${row.id})">Excloure de ${data.name}</a></li>
                        </ul>` : '';
                return row 
                    ? `${perfil} ${exclude}` 
                    : '';
            }
        },
    ];

    const deleteUserEntity = async () => {
        try {
            await useApiService(`organizations/${id}`).remove(userToDelete.value);
            const index = data.users.findIndex(user => user.id === userToDelete.value);
            if (index !== -1) {
                data.users.splice(index, 1);
            }
            $Snackbar.show({
                text: 'Usuari eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('EntityConfirmUserDelete');
        } catch (error) {
            console.error('Error eliminando la entidad:', error);
        }
    };

    const deleteEntity = async () => {
        try {
            await useApiService('organizations').remove(id);  
            $Snackbar.show({
                text: 'Entitat eliminada amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('EntityConfirmDelete');
            router.push('/entitats');
        } catch (error) {
            console.error('Error eliminando la entidad:', error);
        }
    };
    
    const showUserModal = (id) => {
        userToDelete.value = id;
        nuxtApp.$showBootstrapModal('EntityConfirmUserDelete');
    }
    window.showUserDeleteModal = showUserModal;
</script>
