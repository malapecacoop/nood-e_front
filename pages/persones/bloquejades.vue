<template>
    <section>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Persones bloquejades</h1>
            </div>
            <div class="page-head__ctas">
                <div class="dropdown">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><NuxtLink class="dropdown-item" to="/persones">Veure persones no bloquejades</NuxtLink></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="table--full-width">
                <Datatable :data="data" :columns="columns" />
            </div>
        </div>
        <Modal
            id="UserUnblock"
            @save="unblockUser"
            @cancel="$hideBootstrapModal('UserUnblock')"
            >
            <template #title>
                Estàs segur que vols desbloquejar aquest usuari?
            </template>
        </Modal>
    </section>
</template>

<script setup>
    import Datatable from '~/components/Datatable.vue';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';

    const { hasAdminRole } = storeToRefs(useUserStore());

    if (!hasAdminRole.value) {
        useNuxtApp().$router.push('/persones');
    }
    
    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;
    const data = ref(null);
    const userToUnblock = ref(null);
    
    const loadUsers = async () => {
        data.value = await useApiService('users?show_only_deleted=1').fetchAll();
    };
    loadUsers();

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
            data: 'organization', 
            title: 'Entitat', 
            render: (data, type, row) => {
                return row && row.organization ? row.organization.name : ''; 
            }
        },
        { 
            data: 'role', 
            title: 'Permisos',
            render: (data, type, row) => {
                return row && row.role ? row.role.name : ''; 
            }
        },
        {
            data: null, 
            title: 'Accions', 
            render: (data, type, row) => {
                let actions = `<a href="#" onclick="showUserUnblockModal(${row.id})" class="btn btn-sm btn-outline-primary">Desbloquejar</a>`;
                return actions;
            }
        }
    ];

    const showUserModal = (id) => {
        userToUnblock.value = id;
        nuxtApp.$showBootstrapModal('UserUnblock');
    }
    window.showUserUnblockModal = showUserModal;

    const unblockUser = async () => {
        try {
            await useApiService('users').update(`${userToUnblock.value}/restore`);  
            
            const userIndex = data.value.findIndex(user => user.id === userToUnblock.value);
            if (userIndex !== -1) data.value[userIndex].deleted_at = null;

            $Snackbar.show({
                text: 'Usuari desbloquejat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });

            nuxtApp.$hideBootstrapModal('UserUnblock');
        } catch (error) {
            console.error('Error desbloqueando usuario:', error);
        }
    };

</script>
