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
                <Datatable :data="data" :columns="columns" />
            </div>
        </div>
    </section>
</template>

<script setup>
    import Datatable from '~/components/Datatable.vue';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    let data = ref(null);
    const loadOrganizations = async () => {
        data.value = await useApiService('organizations').fetchAll();
    };
    loadOrganizations();

    const { hasAdminRole } = storeToRefs(useUserStore());

    const columns = [
        { 
            data: 'name', 
            title: 'Nom',
            render: (data, type, row) => {
                return `
                    <div>
                        <img src="${getUrlImage(row.image)}" alt="${row.name}" class="me-2 thumb" style="width: 30px; height: 30px;" />
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