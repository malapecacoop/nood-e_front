<template>
    <div>
        <form>
            <div class="row">
                <div class="col-md-9">
                    <div class="page-prehead">
                        <div class="breadcrumb">
                            <a class="breadcrumb__item" href="/debats">Espais de debat</a>
                            <a class="breadcrumb__item" :href="`/debats/${data.discussion.id}`">{{ data.discussion.title }}</a>
                            <a class="breadcrumb__item" :href="`/debats/${data.discussion.id}/${data.id}`">{{ data.title }}</a>
                            <span class="breadcrumb__item active">Edició</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="debate-name">Títol  del fòrum</label>
                        <input v-model="title" type="text" class="form-control" value="" placeholder="Nom" id="debate-name" name="debate-name">
                        <div class="input-errors" v-for="error of v$.title.$errors" :key="error.$uid">
                            <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="topic-content">Descripció</label>
                        <div class="wysiwyg-14">
                            <QuillEditor v-model="content" />
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-6">
                    <div class="sticky-top pt-2">
                        <Button
                            buttonClass="btn btn-primary w-100 mb-1"
                            buttonType="button"
                            @action="saveForm"
                        >
                            Desar canvis
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100"
                            buttonType="button"
                            @action="showModal"
                        >
                            Descartar canvis
                        </Button>
                    </div>
                </div>
            </div>
            <Modal
                id="modalUserConfirmChanges"
                @save="$hideBootstrapModal('modalUserConfirmChanges')"
                @cancel="$hideBootstrapModal('modalUserConfirmChanges')"
                >
                <template #title>
                    Vols descartar els canvis?
                </template>
                <template #body>
                    Aquesta acció no es pot desfer.
                </template>
            </Modal>
        </form>
        <Modal id="ForumConfirmChanges" @save="discardChanges"
            @cancel="$hideBootstrapModal('ForumConfirmChanges')">
            <template #title>
                Vols descartar els canvis?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { translateError } from '~/helpers/auth';
import { useApiService } from '~/services/apiService';

const { $Snackbar } = useNuxtApp();

const route = useRoute();
const id = route.params.forum;
const discussionId = route.params.debat;
const data = await useApiService(`discussions/${discussionId}`).fetchById(id);

const originalData = {
    title: data.title,
    content: data.content,
};

const title = ref(originalData.title);
const content = ref(originalData.content);

const rules = {
    title: { required },
    content: { required },
}

const v$ = useVuelidate(rules, {title, content});
const nuxtApp = useNuxtApp();

const saveForm = async (props, stopLoading) => {
    v$.value.$touch();
    if (!v$.value.$invalid) {
        try {
            await useApiService(`discussions/${discussionId}`).update(id, {
                title: title.value,
                content: typeof content.value === 'string' ? content.value : JSON.stringify(content.value),
            });

            $Snackbar.show({
                text: 'Topic editat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });

            nuxtApp.$router.push(`/debats/${discussionId}/${id}`);
        } catch (error) {
            $Snackbar.show({
                text: 'Hi ha hagut un error al crear unn topic. Fes un intent més tard',
                pos: 'bottom-center',
                type: 'error',
                duration: 3000,
            });
            stopLoading();
        }
    } else {
        console.log('Validation failed');
        stopLoading();
    }
}

const discardChanges = () => {
    Object.keys(originalData).forEach(key => {
        eval(`${key}.value = originalData[key]`);
    });
    nuxtApp.$hideBootstrapModal('ForumConfirmChanges');
};

const showModal = (props, callback) => {
    callback();
    nuxtApp.$showBootstrapModal('ForumConfirmChanges');
}
</script>