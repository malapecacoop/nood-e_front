<template>
    <div>
        <div class="page-prehead">
            <div class="breadcrumb">
                <a class="breadcrumb__item" href="/persones">Persones</a>
                <span class="breadcrumb__item active">{{ person.name }} {{ person.surname }}</span>
            </div>
            <div class="page-prehead__ctas">
                <Button
                    v-if="hasAdminRole || isOwner" 
                    :buttonLink="`editar/${person.id}`"
                    buttonClass="btn btn-sm btn-outline-primary"
                    buttonType="hiperlink"
                >
                    Editar
                </Button>
                <div v-if="hasAdminRole && !isOwner" class="dropdown">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-symbols-outlined icon-size-20">more_vert</i>
                    </button>
                    <ul class="dropdown-menu">
                        <li v-if="hasSuperadminRole && !isOwner" >
                            <Button
                                buttonClass="dropdown-item"
                                buttonType="hyperlink"
                                @action="$showBootstrapModal('UserPermissions')"
                            >
                                Permisos
                            </Button>
                        </li>
                        <li>
                            <Button
                                buttonClass="dropdown-item"
                                buttonType="hyperlink"
                                @action="$showBootstrapModal('UserBlock')"
                            >
                                Bloquejar
                            </Button>
                        </li>
                        <li>
                            <Button
                                v-if="hasSuperadminRole && !isOwner"
                                buttonClass="dropdown-item"
                                buttonType="hyperlink"
                                @action="$showBootstrapModal('UserDelete')"
                            >
                                Eliminar
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <div class="row">
                <div class="col-md-3">
                    <NuxtImg :src="getUrlImage(person.image)" class="rounded mb-4 img-fluid w-100" densities="x1 x2" width="234" height="234" :alt="person.name"/>
                </div>
                <div class="col-md-9">
                    <div class="d-flex mb-4">
                        <i class="material-symbols-outlined me-1">person</i>
                        <div class="">
                            <div class="d-flex align-items-center">
                                <h1 class="h5 me-1">{{ person.name }} {{ person.surname }}</h1>
                                <span class="badge bg-primary-dark">{{ person.role.name }}</span>
                            </div>
                            <p v-if="person.organization" class="p2 mb-0">Treballa a <NuxtLink class="link" :to="`/entitats/${person.organization.id}`">{{ person.organization.name }}</NuxtLink></p>
                        </div>
                    </div>
                    <div class="mb-2">
                        <h2 class="subtitle-2 mb-1">Descripció</h2>
                        <div class="wysiwyg-14">
                            <div v-html="htmlDescription"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal
            v-if="hasSuperadminRole && !isOwner"
            id="UserPermissions"
            @save="savePermissions"
            @cancel="$hideBootstrapModal('UserPermissions')"
            >
            <template #title>
                Permisos de {{ person.name }}
            </template>
            <template #body>
                <form>
                    <div v-for="role in userRoles" :key="role.id" class="form-check">
                        <input class="form-check-input" type="radio" :id="`user-permissions-${role.id}`" v-model="selectedPermission" :value="role.id">
                        <label class="form-check-label" :for="`user-permissions-${role.id}`">
                            {{ role.name }}
                        </label>
                    </div>
                </form>
            </template>
        </Modal>
        <Modal
            v-if="hasAdminRole && !isOwner"
            id="UserBlock"
            @save="blockUser"
            @cancel="$hideBootstrapModal('UserBlock')"
            >
            <template #title>
                Estàs segur que vols bloquejar a aquest usuari?
            </template>
            <template #body>
                L'usuari no es mostrarà als llistats ni podrà iniciar sessió a la plataforma. Podràs desbloquejar-lo en qualsevol moment.
            </template>
        </Modal>
        <Modal
            id="UserNoDelete"
            @save="$hideBootstrapModal('UserNoDelete')"
            @cancel="$hideBootstrapModal('UserNoDelete')"
            >
            <template #title>
                Aquest usuari no es pot eliminar
            </template>
            <template #body>
                L'usuari ha creat contingut a la plataforma pel que no podem eliminar-lo. Si vols, el pots bloquejar per ocular-lo i que no pugui iniciar sessió.
            </template>
        </Modal>
        <Modal
            v-if="hasSuperadminRole && !isOwner"
            id="UserDelete"
            @save="deleteUser"
            @cancel="$hideBootstrapModal('UserDelete')"
            >
            <template #title>
                Estàs segur que vols eliminar aquest usuari?
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

    const nuxtApp = useNuxtApp();
    const { $Snackbar, $storageUrl } = nuxtApp;

    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;

    const data = await useApiService('users').fetchById(id);
    const roles = await useApiService('roles').fetchAll();
    
    const person = ref(data);
    const htmlDescription = getDescriptionHTML(person.value.description);
    const selectedPermission = ref(person.value.role.id);
    const userRoles = ref(roles);
    
    const { user, hasAdminRole, hasSuperadminRole } = storeToRefs(useUserStore());
    const isOwner = user.value.id == person.value.id;

    const savePermissions = async () => {
        try {
            const updatedUser = await useApiService('users').update(id, { 
                role_id: selectedPermission.value, 
                name: person.value.name, 
                email: person.value.email }); 
            
            person.value = updatedUser;

            $Snackbar.show({
                text: 'Permisos actualitzats amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });

            nuxtApp.$hideBootstrapModal('UserPermissions');
        } catch (error) {
            console.error('Error actualizando permisos:', error);
        }
    };

    const deleteUser = async () => {
        try {
            await useApiService('users').remove(id);  
            $Snackbar.show({
                text: 'Usuari eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('UserDelete');
            router.push('/persones');
        } catch (error) {
            console.error('Error eliminando usuario:', error);
        }
    };

    const blockUser = async () => {
        try {
            await useApiService('users').remove(id);  
            $Snackbar.show({
                text: 'Usuari bloquejat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('UserBlock');
            router.push('/persones');
        } catch (error) {
            console.error('Error bloqueando al usuario:', error);
        }
    };
</script>
