<template>
    <div>
        <div class="page-prehead">
            <div class="breadcrumb">
                <a class="breadcrumb__item" href="/debats">Espais de debat</a>
                <a class="breadcrumb__item" :href="`/debats/${data.discussion.id}`">{{ data.discussion.title }}</a>
                <span class="breadcrumb__item active">{{ data.title }}</span>
            </div>
            <div class="page-prehead__ctas">
                <Button
                    v-if="hasAdminRole || isOwner"
                    :buttonLink="`/debats/${discussionId}/${forumId}/editar`"
                    buttonClass="btn btn-sm btn-outline-primary"
                    buttonType="hyperlink"
                >
                    Editar
                </Button>
                <div
                    v-if="(hasAdminRole || isOwner) && data.comments.length === 0"
                    class="dropdown"
                >
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="showDeleteForumModal">Eliminar</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-9 col-xl-8">
                <div class="d-flex align-items-center jusfity-content-between mb-3">
                    <div class="d-flex align-items-center">
                        <NuxtImg :src="getUrlImage(author.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="56" height="56"/>
                        <div>
                            <p class="p2">{{ author.name }}</p>
                            <p class="p2 text-secondary">{{ formatDate(data.created_at) }}</p>
                        </div>
                    </div>
                </div>
                <h1 class="h4 mb-1">{{ data.title }}</h1>
                <div class="wysiwyg-14 mb-3">
                    <div v-html="htmlDescription"></div>
                </div>
                <Button
                    buttonLink="#respon"
                    buttonClass="btn btn-primary mb-3"
                    buttonType="hyperlink"
                >
                    <i class="material-symbols-outlined me-1">reply</i>
                    Respon
                </Button>
                <h2 class="subtitle-1 mb-2">Respostes:</h2>
                <div class="comments">
                    <div 
                        v-for="comment in data.comments" 
                        :key="comment.id" 
                        class="comment mb-3 border-bottom pb-3"
                    >
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <div class="d-flex align-items-center">
                                <NuxtImg :src="getUrlImage(comment.author.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="38" height="38"/>
                                <div>
                                    <p class="subtitle-2 mb-0">{{ comment.author.name }}</p>
                                    <p class="p2 text-secondary">{{ formatDate(comment.created_at) }}</p>
                                </div>
                            </div>
                            <div
                                v-if="hasAdminRole || isMine(comment)"
                                class="dropdown"
                            >
                                <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="material-symbols-outlined icon-size-20">more_vert</i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" @click="editComment(comment)">Editar</a></li>
                                    <li><a class="dropdown-item" href="#" @click="showModal(comment)">Eliminar</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="wysiwyg-14">
                            <p v-if="!comment.isEditing">{{ comment.content }}</p>
                            <div v-if="comment.isEditing">
                                <textarea class="form-control mb-2" v-model="comment.content" rows="5"></textarea>
                                <div class="d-flex align-items-center justify-content-end">
                                    <Button
                                        buttonClass="btn btn-sm btn-secondary me-2"
                                        buttonType="button"
                                        @action="cancelEdit(comment)"
                                    >
                                        Cancel·lar
                                    </Button>
                                    <Button
                                        buttonClass="btn btn-sm btn-primary"
                                        buttonType="button"
                                        @action="saveComment(comment)"
                                    >
                                        Acceptar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <form class="mb-6">
                    <h2 class="subtitle-1 mb-2" id="respon">Respon:</h2>
                    <textarea v-model="newComment" class="form-control mb-2" placeholder="Escriu un comentari..." rows="6"></textarea>
                    <div class="text-end">
                        <Button
                            buttonClass="btn btn-primary"
                            buttonType="button"
                            @action="postForumComment"
                        >
                            Publicar comentari
                        </Button>
                    </div>
                </form>
            </div>
        </div>
        <Modal id="deleteModal" @save="deleteComment"
            @cancel="$hideBootstrapModal('deleteModal')">
            <template #title>
                Segur que vols eliminar el comentari?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
        <Modal id="deleteForumModal" @save="deleteForum"
            @cancel="$hideBootstrapModal('deleteForumModal')">
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
    import { useApiService } from '~/services/apiService';
    import { getDescriptionHTML } from '~/helpers/quillHelper';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';
    import { formatDate } from '~/helpers/globalHelper';

    const nuxtApp = useNuxtApp();
    const { $Snackbar } = nuxtApp;
    const route = useRoute();
    const router = useRouter();

    const forumId = route.params.forum;
    const discussionId = route.params.debat;

    const data = await useApiService('discussions').fetchById(`${discussionId}/${forumId}`);
    const author = await useApiService('users').fetchById(data.author_id);
    const { user, hasAdminRole } = storeToRefs(useUserStore());
    const isOwner = user.value.id == data.author_id;

    const htmlDescription = getDescriptionHTML(data.content);
    const commentToDelete = ref('');
    const newComment = ref('');

    onMounted(() => {
        data.comments.forEach(comment => {
            comment.isEditing = false;
        });
    });

    const editComment = (comment) => {
        comment.isEditing = true;
    };

    const cancelEdit = (comment) => {
        comment.isEditing = false;
    };

    const isMine = (comment) => {
        return comment.author_id === user.value.id;
    };

    const saveComment = async (comment) => {
        try {
            await useApiService(`discussions/${discussionId}/${forumId}`).update(comment.id, 
            { 
                content: comment.content,
            });
            comment.isEditing = false;
            $Snackbar.show({
                text: 'Comentari guardat correctament.',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
        } catch (error) {
            $Snackbar.show({
                text: 'Error al guardar el comentari.',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
        }
    };

    const deleteComment = async () => {
        try {
            await useApiService(`discussions/${discussionId}/${forumId}`).remove(commentToDelete.value.id);
            data.comments = data.comments.filter(c => c.id !== commentToDelete.value.id);
            nuxtApp.$hideBootstrapModal('deleteModal');
            $Snackbar.show({
                text: 'Comentari eliminat correctament.',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
        } catch (error) {
            $Snackbar.show({
                text: 'Error al eliminar el comentari.',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
        }
    };

    const postForumComment = async (props, callback) => {
        if (!newComment.value.trim()) {
            callback();
            $Snackbar.show({
                text: 'El comentari no pot estar buit.',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            const response = await useApiService(`discussions/${discussionId}/${forumId}`).create({
                content: newComment.value,
            });

            const { id, created_at, content } = response;

            data.comments.push({
                id,
                author: author,
                created_at,
                content,
                isEditing: false,
            });

            newComment.value = '';
            $Snackbar.show({
                text: 'Comentari publicat correctament.',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
        } catch (error) {
            $Snackbar.show({
                text: 'Error al publicar el comentari.',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
        }
        callback();
    };

    const showModal = (comment) => {
        commentToDelete.value = comment;
        nuxtApp.$showBootstrapModal('deleteModal');
    }

    const showDeleteForumModal = () => {
        nuxtApp.$showBootstrapModal('deleteForumModal');
    }

    const deleteForum = async () => {
        try {
            await useApiService(`discussions/${discussionId}`).remove(forumId);  

            $Snackbar.show({
                text: 'Forum eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('deleteForumModal');
            router.push('/debats');
        } catch (error) {
            console.error('Error eliminant el forum:', error);
        }
    };

</script>
