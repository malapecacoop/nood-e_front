<template>
    <section>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Debats</h1>
            </div>
            <div class="page-head__ctas">
                <Button
                    buttonLink="/debats/crear"
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="hyperlink"
                >
                    Crear espai de debat
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

DataTable.use(DataTablesLib);

const data = await useApiService('discussions').fetchAll();

const columns = [
    { 
        data: 'title', 
        title: 'Nom',
    },
    {
        data: null, 
        title: 'Accions', 
        render: (data, type, row) => {
            return row 
                ? `<a href="/debats/${row.id}" class="btn btn-sm btn-outline-primary">Veure</a>` 
                : '';
        }
    },
];
</script>