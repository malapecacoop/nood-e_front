<template>
    <section>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Sales</h1>
            </div>
            <div class="page-head__ctas">
                <Button
                    v-if="currentView === 'list'"
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="button"
                    @click="toggleView"
                >
                    <i class="material-symbols-outlined icon-size-18 me-1">calendar_today</i>
                    <span>Veure calendari</span>
                </Button>
                <Button
                    v-else
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="button"
                    @click="toggleView"
                >
                    <i class="material-symbols-outlined icon-size-18 me-1">list</i>
                    <span>Veure llistat</span>
                </Button>
                <Button
                    v-if="hasAdminRole"
                    buttonLink="/sales/crear"
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="hyperLink"
                >
                    Crear sala
                </Button>
                <div 
                    v-if="hasAdminRole"
                    class="dropdown"
                >
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="toggleDeletedRooms">{{ showDeletedRooms ? 'Ocultar sales no disponibles' : 'Mostrar sales no disponibles' }}</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div v-if="currentView === 'list'" class="table--full-width mb-6">
                <DataTable :data="rooms" :columns="columns" :options="datatableOptions"></DataTable>
            </div>
            <div v-else class="mb-6">
                <FullCalendar
                    endpoint="events"
                    :showTimeline="true"
                    initialView="resourceTimelineWeek"
                    :showDeletedRooms="showDeletedRooms"
                    class="mt-2"/>
            </div>
        </div>
    </section>
</template>

<script setup>
    import DataTable from 'datatables.net-vue3';
    import DataTablesLib from 'datatables.net-bs5';
    import { useApiService } from '~/services/apiService';
    import FullCalendar from '~/components/FullCalendar.vue';
    import { datatableOptions } from '~/config/datatableOptions';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    DataTable.use(DataTablesLib);

    const rooms = ref([]);
    const { hasAdminRole } = storeToRefs(useUserStore());
    
    const columns = [
        { 
            data: 'name', 
            title: 'Nom',
            render: (data, type, row) => {
                const className = row.is_available ? '' : 'text-muted fw-bold';
                return `<img src="${getUrlImage(row.image)}" alt="${row.name}" class="me-2" style="width: 30px; height: 30px;" /><span class="${className}">${data}</span>`;
            }
        },
        {
            data: null, 
            title: 'Accions', 
            render: (data, type, row) => {
                return row 
                    ? `<a href="/sales/${row.id}" class="btn btn-sm btn-outline-primary">Veure</a>` 
                    : '';
            }
        },
    ];

    const currentView = ref('list');
    const showDeletedRooms = ref(false);

    const toggleView = () => {
        currentView.value = currentView.value === 'list' ? 'calendar' : 'list';
    };

    const toggleDeletedRooms = async () => {
        showDeletedRooms.value = !showDeletedRooms.value;
        const endpoint = showDeletedRooms.value ? 'rooms?show_unavailable=1' : 'rooms';
        rooms.value = await useApiService(endpoint).fetchAll();
    };

    const loadRooms = async () => {
        const endpoint = showDeletedRooms.value ? 'rooms?show_unavailable=1' : 'rooms';
        rooms.value = await useApiService(endpoint).fetchAll();
    };

    await loadRooms();
</script>
