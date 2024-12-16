<template>
    <section>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Persones</h1>
            </div>
            <div v-if="hasAdminRole" class="page-head__ctas">
                <div class="dropdown">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><NuxtLink class="dropdown-item" to="/persones/bloquejades">Veure persones bloquejades</NuxtLink></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="table--full-width">
                <DataTable :data="data" :columns="columns" :options="datatableOptions"></DataTable>
            </div>
        </div>
    </section>
</template>

<script setup>
    import DataTable from 'datatables.net-vue3';
    import DataTablesLib from 'datatables.net-bs5';
    import { useApiService } from '~/services/apiService';
    import { datatableOptions } from '~/config/datatableOptions';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    DataTable.use(DataTablesLib);

    const nuxtApp = useNuxtApp();
    const { $storageUrl } = nuxtApp;

    const data = await useApiService('users').fetchAll();

    const { hasAdminRole } = storeToRefs(useUserStore());

    const columns = [
        { 
            data: 'name', 
            title: 'Nom',
            render: (data, type, row) => {
                return `
                    <div>
                        <img src="${getUrlImage(row.image)}" alt="${row.name}" class="me-2" style="width: 30px; height: 30px;" />
                        ${data}
                    </div>
                `;
            }
        },
        { 
            data: 'organization', 
            title: 'Entitat', 
            render: (data, type, row) => {
                return row && row.organization ? row.organization.name : ''; 
            }
        },
        { 
            data: 'roles', 
            title: 'Permisos',
            render: (data, type, row) => {
                return row && row.role ? row.role.name : '';
            }
        },
        {
            data: null, 
            title: 'Accions', 
            render: (data, type, row) => {
                return row 
                    ? `<a href="/persones/${row.id}" class="btn btn-sm btn-outline-primary">Veure perfil</a>` 
                    : '';
            }
        },
    ];
</script>