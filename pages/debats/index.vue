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
                <Datatable :data="data" :columns="columns" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { useApiService } from '~/services/apiService';
import Datatable from '~/components/Datatable.vue';

let data = ref(null);
const loadDiscussions = async () => {
    data.value = await useApiService('discussions').fetchAll();
};
loadDiscussions();

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