<template>
    <div>
        <div class="page-prehead">
            <div class="breadcrumb">
                <a class="breadcrumb__item" href="/sales">Sales</a>
                <span class="breadcrumb__item active">{{ data.name }}</span>
            </div>
            <div
                v-if="hasAdminRole"
                class="page-prehead__ctas"
            >
                <Button
                    :buttonLink="`editar/${id}`"
                    buttonClass="btn btn-sm btn-outline-primary"
                    buttonType="hiperlink"
                >
                    Editar
                </Button>
                <div class="dropdown">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#"@click="updateRoom">{{`Marcar com a ${isAvailable ? 'no' : ''} disponible`  }}</a></li>
                        <li><a class="dropdown-item" href="#" @click="$showBootstrapModal('RoomConfirmDelete')">Eliminar</a></li>
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
                    <h2 class="subtitle-2 mb-1">Calendari de reserves</h2>
                    <FullCalendar :endpoint="`events/rooms/${id}`" />
                </div>
            </div>
        </div>
        <Modal id="RoomConfirmDelete" @save="deleteRoom"
            @cancel="$hideBootstrapModal('RoomConfirmDelete')">
            <template #title>
                Segur que vols eliminar aquesta sala?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
    </div>
</template>

<script setup>
    import DataTable from 'datatables.net-vue3';
    import DataTablesLib from 'datatables.net-bs5';
    import { useApiService } from '~/services/apiService';
    import { getDescriptionHTML } from '~/helpers/quillHelper';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    DataTable.use(DataTablesLib);

    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const data = await useApiService('rooms').fetchById(id);
    const { hasAdminRole } = storeToRefs(useUserStore());

    const userToDelete = ref(null);
    const isAvailable = ref(data.is_available);
    const htmlDescription = getDescriptionHTML(data.description);

    const deleteRoom = async () => {
        try {
            await useApiService('rooms').remove(id);  
            $Snackbar.show({
                text: 'Sala eliminada amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('RoomConfirmDelete');
            router.push('/sales');
        } catch (error) {
            if (error.statusCode === 409) {
                $Snackbar.show({
                    text: 'No es poden eliminar sales que continguin futurs events',
                    pos: 'bottom-center',
                    duration: 10000,
                });
            }
            nuxtApp.$hideBootstrapModal('RoomConfirmDelete');
        }
    };
    
    const showUserModal = (id) => {
        userToDelete.value = id;
        nuxtApp.$showBootstrapModal('EntityConfirmUserDelete');
    }
    window.showUserDeleteModal = showUserModal;

    const updateRoom = async () => {
        isAvailable.value = !isAvailable.value;

        try {
            await useApiService('rooms').update(id, {
                name: data.name,
                is_available: isAvailable.value
            });

            $Snackbar.show({
                text: 'Sala editada amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });

        } catch (error) {
            $Snackbar.show({
                text: 'Hi ha hagut un error al editar una sala. Fes un intent més tard',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
        }
    }
</script>
