<template>
    <div class="table-wrapper">
        <div v-if="data === null" class="loader-overlay">
            <div class="spinner"></div>
        </div>
        <DataTable :data="data" :columns="columns" :options="datatableOptions"></DataTable>
    </div>
</template>

<script setup>
import DataTable from 'datatables.net-vue3';
import DataTablesLib from 'datatables.net-bs5';
import { datatableOptions } from '~/config/datatableOptions';

defineProps({
    data: { type: Array, default: () => null },
    columns: { type: Array, default: () => [] },
    datatableOptions: { type: Object, default: () => datatableOptions },
});

DataTable.use(DataTablesLib);
</script>