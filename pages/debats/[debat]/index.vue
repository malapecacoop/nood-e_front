<template>
    <div>
        <div class="page-prehead">
            <div class="breadcrumb">
                <a class="breadcrumb__item" href="/debats">Espais de debat</a>
                <span class="breadcrumb__item active">{{ data.title }}</span>
            </div>
            <div class="page-prehead__ctas">
                <Button
                    :buttonLink="`/debats/${id}/crear-fil`"
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="hyperlink"
                >
                    Nou tema
                </Button>
                <Button
                    v-if="hasAdminRole || isOwner"
                    :buttonLink="`/debats/editar/${id}`"
                    buttonClass="btn btn-sm btn-outline-primary"
                    buttonType="hyperlink"
                >
                    Editar
                </Button>
                <div
                    v-if="(hasAdminRole || isOwner) && data.topics.length === 0"
                    class="dropdown"
                >
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="$showBootstrapModal('DiscussionConfirmDelete')">Eliminar</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <div class="d-flex mb-4">
                <i class="material-symbols-outlined me-1">check_box</i>
                <div class="d-flex align-items-center">
                    <h1 class="h5">{{ data.title }}</h1>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-4">
                        <h2 class="subtitle-2 mb-1">Descripció</h2>
                        <div class="wysiwyg-14">
                            <div v-html="htmlDescription"></div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h2 class="subtitle-2 mb-1">Persones d’aquest espai:</h2>
                        <div v-for="member in data.members" :key="member.id" class="d-flex align-items-center mb-1">
                            <img :src="getUrlImage(member.image)" class="me-1 thumb" style="width: 30px; height: 30px;" alt=""/>
                            <p class="p2">{{ member.name }} {{ member.surname }}</p>
                        </div>
                    </div>          
                </div>
                <div class="col-md-8">
                    <div class="mb-4">
                        <h2 class="subtitle-2 mb-1">Fòrum:</h2>
                        <Datatable :data="data.topics" :columns="columns" />
                    </div>
                </div>
            </div>
        </div>
        <Modal 
            v-if="hasAdminRole || isOwner"
            id="DiscussionConfirmDelete" 
            @save="deleteDiscussion"
            @cancel="$hideBootstrapModal('DiscussionConfirmDelete')"
        >
            <template #title>
                Segur que vols eliminar el debat?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
        <Modal 
            v-if="hasAdminRole || isOwner"
            id="ForumConfirmDelete" 
            @save="deleteForum"
            @cancel="$hideBootstrapModal('ForumConfirmDelete')"
        >
            <template #title>
                Segur que vols eliminar el forum?
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
    const { $Snackbar } = nuxtApp;
    const { user, hasAdminRole } = storeToRefs(useUserStore());
    const route = useRoute();
    const router = useRouter();
    const id = route.params.debat;
    const forumToDelete = ref(null);

    const data = await useApiService('discussions').fetchById(id);
    const isOwner = user.value.id == data.author_id;
    const htmlDescription = getDescriptionHTML(data.description);

    const columns = [
        { 
            data: 'title', 
            title: 'Nom',
        },
        { 
            data: 'comments_counter', 
            title: 'Respostes',
        },
        { 
            data: 'last_update', 
            title: 'Activitat mes recent',
        },
        {
            data: null, 
            title: 'Accions', 
            render: (data, type, row) => {
                let view = `<a href="/debats/${id}/${row.id}" class="btn btn-sm btn-outline-primary">Veure</a>`;
                let actions = ((hasAdminRole || isMine(row)) && row.comments_counter == 0) ? `
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="showTopicDeleteModal(${row.id})">Eliminar</a></li>
                    </ul>` : '';

                return row ? `${view} ${actions}` : '';
            }
        },
    ];

    const isMine = (row) => {
        return row.author_id == user.value.id;
    };

    const deleteDiscussion = async () => {
        try {
            await useApiService('discussions').remove(id);  
            const index = data.topics.findIndex(forum => forum.id === forumToDelete.value);
            if (index !== -1) {
                data.topics.splice(index, 1);
            }
            $Snackbar.show({
                text: 'Debat eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('DiscussionConfirmDelete');
            router.push('/debats');
        } catch (error) {
            console.error('Error eliminant el debat:', error);
        }
    };

    const deleteForum = async () => {
        try {
            await useApiService(`discussions/${id}`).remove(forumToDelete.value);  

            $Snackbar.show({
                text: 'Forum eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('ForumConfirmDelete');
            router.push('/debats');
        } catch (error) {
            console.error('Error eliminant el forum:', error);
        }
    };

    const showTopicModal = (id) => {
        forumToDelete.value = id;
        nuxtApp.$showBootstrapModal('ForumConfirmDelete');
    };
    window.showTopicDeleteModal = showTopicModal;

</script>
