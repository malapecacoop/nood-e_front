<template>
    <section>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Entitats</h1>
            </div>
            <div class="page-head__ctas">
                <Button
                    v-if="hasAdminRole"
                    buttonLink="/entitats/crear"
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="hiperlink"
                >
                    Crear
                </Button>
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

    const data = await useApiService('organizations').fetchAll()
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
            data: 'users_count', 
            title: 'Usuaris en entitat',
            render: (data, type, row) => {
                return `
                    <div>
                        ${data} persones
                    </div>
                `;
            }
        },
        {
            data: null, 
            title: 'Accions', 
            render: (data, type, row) => {
                return row 
                    ? `<a href="/entitats/${row.id}" class="btn btn-sm btn-outline-primary">Veure entitat</a>` 
                    : '';
            }
        },
    ];
</script>