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
                            :max="maxDate"
                        />
                        <span class="p2 mx-1">de</span>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="event-start" 
                            name="event-start" 
                            style="max-width: 6rem;"
                            v-model="start"
                        />
                        <span class="p2 mx-1">a</span>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="event-end" 
                            name="time-to" 
                            style="max-width: 6rem;"
                            v-model="end"
                        >
                        <div class="input-errors" v-if="v$.dateGroup.$error">
                            <div v-if="v$.dateGroup.required.$invalid" class="p2 ms-1 text-danger">Tots els camps de data, inici i fi són obligatoris.</div>
                            <div v-if="v$.dateGroup.validTime.$invalid" class="p2 ms-1 text-danger">L'hora de finalització ha de ser posterior a l'hora d'inici.</div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="mb-1 d-flex align-items-center">
                            <i class="material-symbols-outlined me-1" style="width: 1.6rem;">refresh</i>
                            <label class="subtitle-2">Recurrència</label>
                        </div>
                        <div class="ps-md-4">
                            <div class="row">
                                <div class="col-3">
                                    <select v-model="recurrencyType" class="form-control js--select2" id="event-recurrency">
                                        <option value="">No recurrent</option>
                                        <option v-for="recurrency in recurencies" :key="recurrency.id" :value="recurrency.id">
                                            {{ recurrency.label }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" v-if="recurrencyType != ''">
                                <div class="col-6">
                                    <label class="form-label mt-2">Finalitza:</label>
                                    <div class="form-check">
                                        <input 
                                            class="form-check-input" 
                                            type="radio" 
                                            id="option-mai" 
                                            name="recurrency-options" 
                                            value="mai" 
                                            v-model="recurrencyOption"
                                        />
                                        <label class="form-check-label" for="option-mai">Mai</label>
                                    </div>
                                    <div class="form-check d-flex align-items-center gap-1">
                                      <input 
                                          class="form-check-input" 
                                          type="radio" 
                                          id="option-el-dia" 
                                          name="recurrency-options" 
                                          value="dia" 
                                          v-model="recurrencyOption"
                                      />
                                      <label class="form-check-label col-2" for="option-el-dia">El dia:</label>
                                      <input 
                                          type="date" 
                                          class="form-control" 
                                          id="event-date" 
                                          name="event-date" 
                                          style="max-width: 10rem;"
                                          v-model="recurrencyDate"
                                          :min="date"
                                          :disabled="recurrencyOption == 'mai'"
                                      />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="input-errors" v-if="v$.dateGroup.$error">
                            <div v-if="v$.dateGroup.validDateRecurrency.$invalid" class="p2 ms-1 text-danger">La data de recurrència ha de ser posterior a la data d'inici.</div>
                        </div>
                    </div>

                    <!-- Convidats -->
                    <div class="mb-4">
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
                    <div class="mb-4">
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
                                            :value="room.id" 
                                            v-model="selectedRoom"
                                            :id="`room-${room.id}`"
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
                                v-show="!showRooms"
                                :disabled="isButtonDisabled"
                            >
                                Troba una sala
                            </Button>
                            <Button
                                buttonClass="btn btn-sm btn-outline-danger mb-2"
                                buttonType="button"
                                @action="toogleRooms"
                                v-show="showRooms"
                            >
                                Cancel·la reserva
                            </Button>
                            <FullCalendar
                                v-if="showRooms"
                                :isInteractive="false"
                                endpoint="events/rooms" 
                                :showTimeline="true" 
                                initialView="resourceTimelineWeek" 
                                class="mt-2"/>
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
                                <input type="text" class="form-control" v-model="callLink" placeholder="URL a la videotrucada" id="videocall" name="videocall" style="max-width: 17rem">
                                <Button
                                    buttonClass="btn btn-sm btn-outline-primary ms-1"
                                    buttonType="button"
                                    @action="createJitsiLink"
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
                                <QuillEditor v-model="description" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-6">
                    <div class="sticky-top pt-2">
                        <Button 
                            buttonClass="btn btn-primary w-100 mb-2"
                            buttonType="button"
                            @action="saveForm"
                        >
                            Desar canvis
                        </Button>
                        <Button
                            buttonClass="btn btn-outline-primary w-100 mb-2"
                            buttonType="button"
                            @action="showModal"
                        >
                            Descartar canvis
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
    </div>
</template>

<script setup>
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { translateError } from '~/helpers/auth';
    import Multiselect from 'vue-multiselect';
    import 'vue-multiselect/dist/vue-multiselect.css';
    import { useApiService } from '~/services/apiService';
    import { getUrlImage } from '~/helpers/imageHelper';

    const formatTime = (time) => time ? time.slice(0, 5) : '';

    const props = defineProps({
        dateCreate: { type: String, default: null }
    });

    const originalData = {
        title: '',
        date: props.dateCreate ? props.dateCreate.split("T")[0] : '',
        start: props.dateCreate ? formatTime(props.dateCreate.split("T")[1]) : '',
        end: props.dateCreate ? formatTime(props.dateCreate.split("T")[1]) : '',
        description: { ops: [] },
        callLink: '',
        selectedGuests: [],
        selectedRoom: null,
        recurrencyType: '',
        recurrencyDate: null,
    };

    const title = ref('');
    const date = ref('');
    const start = ref('');
    const end = ref('');
    const description = ref('');
    const callLink = ref('');
    const selectedGuests = ref([]);
    const data = ref([]);
    const filteredData = ref([]);
    const showRooms = ref(false);
    const availableRooms = ref([]);
    const selectedRoom = ref(null);
    const recurrencyType = ref('');
    const recurrencyDate = ref(null);
    const recurrencyOption = ref('mai');
    const recurencies = [
        { id: 1, label: 'Diari' },
        { id: 2, label: 'Setmanal' },
        { id: 3, label: 'Mensual' },
        { id: 4, label: 'Anual' },
    ];

    date.value = props.dateCreate ? props.dateCreate.split("T")[0] : '';
    start.value = props.dateCreate ? formatTime(props.dateCreate.split("T")[1]) : '';
    end.value = props.dateCreate ? formatTime(props.dateCreate.split("T")[1]) : '';

    if (start.value === end.value) {
        end.value = `${parseInt(start.value.split(':')[0]) + 1}:${start.value.split(':')[1]}`;
    }

    const maxDate = computed(() => {
        const today = new Date();
        return new Date(today.setDate(today.getDate() + 547)).toISOString().split('T')[0];
    });

    const dateGroup = computed(() => ({
        date: date.value,
        start: start.value,
        end: end.value,
        recurrencyOption: recurrencyOption.value,
        recurrencyDate: recurrencyDate.value,
    }));

    const rules = {
        title: { required },
        dateGroup: {
            required: (value) => value.date && value.start && value.end,
            validTime: (value) => !value.start || !value.end || value.start < value.end,
            validDateRecurrency: (value) => value.recurrencyOption == 'mai' || (value.recurrencyDate && (value.date < value.recurrencyDate)),
        },
    };

    const v$ = useVuelidate(rules, {title, dateGroup});
    const nuxtApp = useNuxtApp();
    const { $Snackbar } = useNuxtApp();

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
                await useApiService('events').create({
                    title: title.value,
                    date: date.value,
                    start: `${date.value} ${start.value}:00`,
                    end: `${date.value} ${end.value}:00`,
                    description: typeof description.value === 'string' ? description.value : JSON.stringify(description.value),
                    meet_link: callLink.value,
                    members: memberIds ,
                    room_id: selectedRoom.value,
                    recurrency_type: recurrencyType.value != '' ? recurrencyType.value : null,
                    recurrency_end: recurrencyOption.value != 'mai' ? recurrencyDate.value : null,
                });

                $Snackbar.show({
                    text: 'Esdeveniment creat amb éxit',
                    pos: 'bottom-center',
                    type: 'success',
                    duration: 3000,
                });

                nuxtApp.$hideBootstrapModal('eventCreatePage');
                Object.keys(originalData).forEach(key => {
                    eval(`${key}.value = originalData[key]`);
                });
                v$.value.$reset();
                stopLoading();
                nuxtApp.$router.push('/calendari');
            } catch (error) {
                let errorMessage = error.data?.message || 'Hi ha hagut un error, si us plau torna a intentar-ho';

                if (errorMessage === 'Room is not available for some dates in the recurrency') {
                    errorMessage = 'La sala està ocupada en alguna de les dates de la recurrència';
                } else if (errorMessage === 'Event start date is too far in the future') {
                    errorMessage = 'La data d\'inici de l\'esdeveniment és massa llunyana (màxim 18 mesos)';
                }

                $Snackbar.show({
                    text: errorMessage,
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

    const discardChanges = (stopLoading) => {
        Object.keys(originalData).forEach(key => {
            eval(`${key}.value = originalData[key]`);
        });
        nuxtApp.$hideBootstrapModal('confirmChanges');
        stopLoading();
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
        selectedRoom.value = null
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

    const fetchAvailableRooms = async () => {
        try {
            const queryString = `rooms/free?start=${date.value} ${start.value}:00&end=${date.value} ${end.value}:00`;
            const rooms = await useApiService(queryString).fetchAll();
            availableRooms.value = rooms;
        } catch (error) {
            console.error('Error fetching available rooms:', error);
        }
    };

    watch([date, start, end, recurrencyOption, recurrencyType], ([newDate, newStart, newEnd, newRecurrencyOption, newRecurrencyType]) => {
        if (newRecurrencyType == '') {
            recurrencyDate.value = null;
            recurrencyOption.value = 'mai';
        }
        if (newRecurrencyOption == 'mai') {
            recurrencyDate.value = null;
        }
        //newEnd can be NaN:undefined
        if (newDate && newStart && newEnd && !isNaN(new Date(`${newDate} ${newStart}`)) && !isNaN(new Date(`${newDate} ${newEnd}`))) {
            fetchAvailableRooms();
        }
    });
</script>
