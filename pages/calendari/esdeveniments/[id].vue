<template>
    <div>
        <form>
            <div class="row">
                <div class="col-md-9 pt-4">
                    <div class="mb-2">
                        <input 
                            type="text" 
                            class="form-control event__title" 
                            placeholder="Nom de l'esdeveniment" 
                            id="event-name" 
                            name="event-name"
                            v-model="title"
                            :disabled="!editView"
                        />
                        <div class="input-errors" v-for="error of v$.title.$errors" :key="error.$uid">
                            <div class="p2 mb-1 text-danger">{{ translateError(error.$validator) }}</div>
                        </div>
                    </div>
                    <div class="mb-4 d-sm-flex align-items-center">
                        <i class="material-symbols-outlined me-1" style="width: 1.6rem;">event</i>
                        <input 
                            type="date" 
                            class="form-control" 
                            id="event-date" 
                            name="event-date" 
                            style="max-width: 10rem;"
                            v-model="date"
                            :disabled="!editView"
                        />
                        <span class="p2 mx-1">de</span>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="event-start" 
                            name="event-start" 
                            style="max-width: 6rem;"
                            v-model="start"
                            :disabled="!editView"
                        />
                        <span class="p2 mx-1">a</span>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="event-end" 
                            name="time-to" 
                            style="max-width: 6rem;"
                            v-model="end"
                            :disabled="!editView"
                        >
                        <div class="input-errors" v-if="v$.dateGroup.$error">
                            <div v-if="v$.dateGroup.required.$invalid" class="p2 ms-1 text-danger">Tots els camps de data, inici i fi són obligatoris.</div>
                            <div v-if="v$.dateGroup.validTime.$invalid" class="p2 ms-1 text-danger">L'hora de finalització ha de ser posterior a l'hora d'inici.</div>
                        </div>
                    </div>

                    <div v-if="!editView">
                        <div class="mb-4">
                            <div class="mb-1 d-flex align-items-center">
                                <i class="material-symbols-outlined me-1" style="width: 1.6rem;">people_alt</i>
                                <label class="subtitle-2" for="guests">Creat per</label>
                            </div>
                            <div class="ps-md-4">
                                {{ event.author.name }} {{ event.author.organization ? ` (${event.author.organization.name})` : '' }}
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="mb-1 d-flex align-items-center">
                                <i class="material-symbols-outlined me-1" style="width: 1.6rem;">meeting_room</i>
                                <label class="subtitle-2" for="guests">Sala reservada</label>
                            </div>
                            <div class="ps-md-4">
                                {{ event.room ? event.room.name : 'No hi ha cap sala reservada' }}
                            </div>
                        </div>
                    </div>

                    <!-- Convidats -->
                    <div class="mb-2">
                        <div class="mb-1 d-flex align-items-center">
                            <i class="material-symbols-outlined me-1" style="width: 1.6rem;">people_alt</i>
                            <label class="subtitle-2" for="guests">Convidats</label>
                        </div>
                        <div class="ps-md-4">
                            <div class="row">
                                <div class="col-md-8 col-lg-6">
                                    <multiselect
                                        v-model="selectedGuests"
                                        placeholder="Escull un convidat"
                                        :options="filteredData"
                                        :searchable="true"
                                        :multiple="true"
                                        track-by="name"
                                        label="name"
                                        :show-labels="false"
                                        @search-change="onSearchChange"
                                        :disabled="!editView"
                                    >
                                        <template #selection="{ values, search, isOpen }">
                                            <span class="multiselect__single"
                                                v-if="values.length"
                                                v-show="!isOpen">{{ values.length }} usuaris seleccionats</span>
                                        </template>
                                        <template #option="{ option }">
                                            <div class="d-flex align-items-center mb-1">
                                                <NuxtImg :src="getUrlImage(option.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="42" height="42"/>
                                                <p class="p2 me-1">{{ option.name }}</p>
                                            </div>
                                        </template>
                                    </multiselect>
                                    <div class="mt-2">
                                        <div v-for="guest in selectedGuests" :key="guest.name" class="d-flex align-items-center justify-content-between mb-1">
                                            <div class="d-flex align-items-center">
                                                <NuxtImg :src="getUrlImage(guest.image)" class="rounded-1 me-1 img-fluid" densities="x1 x2" width="42" height="42"/>
                                                <p class="p2 me-1">{{ guest.name }}</p>
                                            </div>
                                            <Button
                                                buttonClass="btn icon-btn icon-btn-white"
                                                buttonType="button"
                                                @click="removeGuest(guest)"
                                                v-if="editView"
                                            >
                                                <i class="material-symbols-outlined">close</i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Sala -->
                    <div v-if="editView" class="mb-4">
                        <div class="mb-1 d-flex align-items-center">
                            <i class="material-symbols-outlined me-1" style="width: 1.6rem;">meeting_room</i>
                            <label class="subtitle-2" for="room">Reserva una sala</label>
                        </div>
                        <div class="ps-md-4">
                            <div class="mb-2" v-if="showRooms">
                                <div v-if="availableRooms.length > 0">
                                    <div class="form-check" v-for="room in availableRooms" :key="room.id">
                                        <input 
                                            class="form-check-input" 
                                            type="radio" 
                                            name="room-select"
                                            :id="`room-${room.id}`"
                                            :value="room.id" 
                                            v-model="selectedRoom"
                                            :disabled="!editView"
                                        />
                                        <label class="form-check-label" :for="`room-${room.id}`">
                                            {{ room.name }}
                                        </label>
                                    </div>
                                </div>  
                            </div>
                            <Button
                                buttonClass="btn btn-sm btn-outline-primary"
                                buttonType="button"
                                @action="toogleRooms"
                                v-show="!showRooms && editView"
                                :disabled="isButtonDisabled || !editView"
                            >
                                Troba una sala
                            </Button>
                            <Button
                                buttonClass="btn btn-sm btn-outline-danger mb-2"
                                buttonType="button"
                                @action="toogleRooms"
                                v-show="showRooms && editView"
                                :disabled="!editView"
                            >
                                Cancel·la reserva
                            </Button>
                            <FullCalendar
                                v-if="showRooms"
                                endpoint="events" 
                                :showTimeline="true" 
                                initialView="resourceTimelineWeek" 
                                class="mt-2"
                            />
                        </div> 
                    </div>

                    <!-- Videotrucada -->
                    <div class="mb-4">
                        <div class="mb-1 d-flex align-items-center">
                            <i class="material-symbols-outlined me-1" style="width: 1.6rem;">video_camera_front</i>
                            <label class="subtitle-2" for="videocall">Videotrucada</label>
                        </div>
                        <div class="ps-md-4">
                            <div class="d-flex align-items-center">
                                <input type="text" class="form-control" v-model="callLink" placeholder="URL a la videotrucada" id="videocall" name="videocall" style="max-width: 17rem" :disabled="!editView">
                                <Button
                                    buttonClass="btn btn-sm btn-outline-primary ms-1"
                                    buttonType="button"
                                    @action="createJitsiLink"
                                    v-if="editView"
                                >
                                    Crear link amb Jitsi
                                </Button>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="mb-4">
                        <div class="mb-1 d-flex align-items-center">
                            <i class="material-symbols-outlined me-1" style="width: 1.6rem;">notes</i>
                            <label class="subtitle-2" for="editor">Notes</label>
                        </div>
                        <div class="ps-md-4">
                            <div class="wysiwyg-14">
                                <QuillEditor v-model="description" :disabled="!editView"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3 mb-6">
                    <div
                        v-if="hasAdminRole || isOwner"
                        class="sticky-top pt-2"
                    >
                        <Button 
                            buttonClass="btn btn-primary w-100 mb-2"
                            buttonType="button"
                            @action="saveForm"
                            v-if="editView"
                        >
                            Desar canvis
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100 mb-2"
                            buttonType="button"
                            @action="showModal"
                            v-if="editView"
                        >
                            Descartar canvis
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100 mb-2"
                            buttonType="button"
                            @action="cancelEdit"
                            v-if="editView"
                        >
                            Cancelar
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100 mb-2"
                            buttonType="button"
                            @action="$showBootstrapModal('EventDelete')"
                            v-if="!editView"
                        >
                            Eliminar
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100 mb-2"
                            buttonType="button"
                            @action="changeEditView"
                            v-if="!editView"
                        >
                            Editar
                        </Button>
                    </div>
                </div>
            </div>
        </form>
        <Modal
            id="confirmChanges"
            @save="discardChanges"
            @cancel="$hideBootstrapModal('confirmChanges')"
        >
            <template #title>
                Vols descartar els canvis?
            </template>
            <template #body>
                Aquesta acció no es pot desfer.
            </template>
        </Modal>
        <Modal
            v-if="hasAdminRole || isOwner && !editView"
            id="EventDelete"
            @save="deleteEvent"
            @cancel="$hideBootstrapModal('EventDelete')"
            >
            <template #title>
                Estàs segur que vols eliminar aquest esdeveniment?
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
    import Multiselect from 'vue-multiselect';
    import 'vue-multiselect/dist/vue-multiselect.css';
    import { useApiService } from '~/services/apiService';
    import { useUserStore } from '~/stores/user';
    import { storeToRefs } from 'pinia';
    import { getUrlImage } from '~/helpers/imageHelper';


    const { $Snackbar } = useNuxtApp();

    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const event = await useApiService('events').fetchById(id);

    const formatTime = (time) => time ? time.slice(0, 5) : '';

    const originalData = {
        title: event.title,
        date: event.start.split(" ")[0],
        start: formatTime(event.start.split(" ")[1]),
        end: formatTime(event.end.split(" ")[1]),
        description: event.description,
        callLink: event.meet_link,
        selectedGuests: event.members,
        selectedRoom: event.room_id,
        availableRooms: []
    };

    const title = ref(originalData.title);
    const date = ref(originalData.date);
    const start = ref(originalData.start);
    const end = ref(originalData.end);
    const description = ref(originalData.description);
    const callLink = ref(originalData.callLink);
    const selectedGuests = ref(originalData.selectedGuests);
    const data = ref([]);
    const filteredData = ref([]);
    const showRooms = ref(true);
    const availableRooms = ref([]);
    const selectedRoom = ref(originalData.selectedRoom);
    const editView = ref(false);
    const nuxtApp = useNuxtApp();
    const { user, hasAdminRole } = storeToRefs(useUserStore());
    const isOwner = user.value.id == event.author_id;
    const isDiscardingChanges = ref(false);
    
    const dateGroup = computed(() => ({
        date: date.value,
        start: start.value,
        end: end.value
    }));

    const rules = {
        title: { required },
        dateGroup: {
            required: (value) => value.date && value.start && value.end,
            validTime: (value) => !value.start || !value.end || value.start < value.end,
        },
    };

    const v$ = useVuelidate(rules, {title, dateGroup});

    watch([date, start, end], () => {
        if (isButtonDisabled.value) {
            showRooms.value = false;
        }
    });

    const saveForm = async (props, stopLoading) => {
        v$.value.$touch();
        if (!v$.value.$invalid) {
            const memberIds = selectedGuests.value.map(guest => guest.id);
            try {
                await useApiService('events').update(id,{
                    title: title.value,
                    date: date.value,
                    start: `${date.value} ${start.value}:00`,
                    end: `${date.value} ${end.value}:00`,
                    description: typeof description.value === 'string' ? description.value : JSON.stringify(description.value),
                    meet_link: callLink.value,
                    members: memberIds,
                    room_id: selectedRoom.value
                });

                $Snackbar.show({
                    text: 'Esdeveniment creat amb éxit',
                    pos: 'bottom-center',
                    type: 'success',
                    duration: 3000,
                });

                nuxtApp.$router.push('/calendari');
            } catch (error) {
                $Snackbar.show({
                    text: 'Hi ha hagut un error al crear un esdeveniment. Fes un intent més tard',
                    pos: 'bottom-center',
                    type: 'error',
                    duration: 3000,
                });
                stopLoading();
                changeEditView();
            }
        } else {
            console.log('Validation failed');
            stopLoading();
        }
    }

    const discardChanges = () => {
        isDiscardingChanges.value = true;
        Object.keys(originalData).forEach(key => {
            eval(`${key}.value = originalData[key]`);
        });
        nuxtApp.$hideBootstrapModal('confirmChanges');
    };

    const isButtonDisabled = computed(() => {
        return !date.value || !start.value || !end.value;
    });


    const allUsers = await useApiService('users').fetchAllInSearchComponent();
    data.value = allUsers;
    filteredData.value = allUsers;


    const removeGuest = (guest) => {
        selectedGuests.value = selectedGuests.value.filter(g => g.name !== guest.name);
    };

    const onSearchChange = (search) => {
        if (search) {
            filteredData.value = data.value.filter(option => 
                option.name.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            filteredData.value = data.value;
        }
    };

    const toogleRooms = (props, stopLoading) => { 
        stopLoading();
        showRooms.value = !showRooms.value;
        selectedRoom.value = null;
    }

    const generateRandomID = () => Math.random().toString(36).substr(2, 10);

    const createJitsiLink = (props, stopLoading) => {
        stopLoading();
        const jitsiID = generateRandomID();
        callLink.value = `https://meet.jit.si/${jitsiID}`;
    }

    const showModal = (props, callback) => {
        callback();
        nuxtApp.$showBootstrapModal('confirmChanges');
    }

    const changeEditView = () => editView.value = !editView.value;

    const cancelEdit = () => {
        Object.keys(originalData).forEach(key => {
            eval(`${key}.value = originalData[key]`);
        });
        changeEditView();
    }

    const deleteEvent = async () => {
        try {
            await useApiService('events').remove(id);  
            $Snackbar.show({
                text: 'Esdeveniment eliminat amb éxit',
                pos: 'bottom-center',
                type: 'success',
                duration: 3000,
            });
            nuxtApp.$hideBootstrapModal('EventDelete');
            router.push('/calendari');
        } catch (error) {
            console.error('Error eliminando la entidad:', error);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const queryString = `rooms/free?start=${date.value} ${start.value}:00&end=${date.value} ${end.value}:00`;
            const rooms = await useApiService(queryString).fetchAll();
            availableRooms.value = rooms;
        } catch (error) {
            console.error('Error fetching available rooms:', error);
        }
    };

    await fetchAvailableRooms();
    event.room && availableRooms.value.unshift(event.room);
    originalData.availableRooms = availableRooms.value;

    watch([date, start, end], ([newDate, newStart, newEnd]) => {
        if (isDiscardingChanges.value) {
            isDiscardingChanges.value = false;
            return; 
        }

        if (newDate && newStart && newEnd && editView.value) {
            fetchAvailableRooms();
        }
    });
</script>
