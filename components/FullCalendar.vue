<template>
    <div class="table-wrapper">
        <div v-if="loading" class="loader-overlay">
            <div class="spinner"></div>
        </div>
        <FullCalendar ref="refCalendar" :options="calendarOptions" :endpoint="endpoint"/>
    </div>
    <ModalPage v-if="useModal && isInteractive" id="eventCreatePage" page-path="/calendari/esdeveniments/crear" :route-params="{ dateCreate: dateCreate }" />
    <ModalPage v-if="useModal && isInteractive" id="eventEditPage" page-path="/calendari/esdeveniments/[id]" :route-params="{ id: eventEditId }" />
</template>

<script setup>
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import interactionPlugin from '@fullcalendar/interaction';
    import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
    import { useApiService } from '~/services/apiService';
    import caLocale from '@fullcalendar/core/locales/ca';
    import ModalPage from '~/components/ModalPage.vue'

    const eventEditId = ref(null)
    const dateCreate = ref(null)
    const loading = ref(true)

    const props = defineProps({
        isInteractive: {
            type: Boolean,
            default: true
        },
        useModal: {
            type: Boolean,
            default: true
        },
        showTimeline: {
            type: Boolean,
            default: false
        },
        initialView: {
            type: String,
            default: 'dayGridMonth',
            validator: value => {
                return ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek', 'resourceTimelineWeek', 'resourceTimeline'].includes(value);
            }
        },
        endpoint: {
            type: String,
            default: ''
        },
        showDeletedRooms: {
            type: Boolean,
            default: false
        }
    });

    const nuxtApp = useNuxtApp();
    const calendarOptions = ref({});
    const refCalendar = ref(null);
    const plugins = computed(() => {
        let basePlugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin];
        if (props.showTimeline) {
            basePlugins.push(resourceTimelinePlugin);
        }
        return basePlugins;
    });

    const headerToolbar = computed(() => {
        let baseToolbar = {
            left: 'prev,next today',
            center: 'title',
            right: props.showTimeline
                ? 'resourceTimelineDay,resourceTimelineWeek'
                : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        };

        return baseToolbar;
    });

    let dateStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    let dateEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    const getData = async (args, successCallback, failureCallback) => {
        try {
            loading.value = true;
            if (args) {
                dateStart = args.startStr;
                dateEnd = args.endStr;

                dateStart = dateStart.split('T')[0];
                dateEnd = dateEnd.split('T')[0];
            }
            const rawData = await useApiService(props.endpoint).fetchAll({ start: dateStart, end: dateEnd });

            const transformedEvents = rawData.map(event => ({
                ...event,
                resourceId: event.room_id,
            }));

            successCallback(transformedEvents);
            loading.value = false;
        } catch (e) {
            failureCallback(e);
        }
    }

    calendarOptions.value = {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        height: "auto",
        plugins: plugins.value,
        initialView: props.initialView,
        headerToolbar: headerToolbar.value,
        editable: true,
        dropable: true,
        selectable: true,
        weekends: true,
        locale: caLocale,
        timeZone: 'UTC',
        resources: [],
        events: getData,
        resourceAreaHeaderContent: 'Sales',
        resourceLabelDidMount: function(info) {
            if (!info.resource.extendedProps.is_available) {
                info.el.classList.add('text-muted', 'fw-bold');
            }
        },
        eventClick: function(info) {
            if (props.isInteractive) {
                if (props.useModal) {
                    eventEditId.value = info.event.id;
                    nextTick(() => {
                        nuxtApp.$showBootstrapModal('eventEditPage');
                    });
                } else {
                    nuxtApp.$router.push(`/calendari/esdeveniments/${info.event.id}`);
                }
            }
        },
        dateClick: function(info) {
            if (props.isInteractive) {
                if (props.useModal) {
                    dateCreate.value = info.dateStr;
                    nuxtApp.$showBootstrapModal('eventCreatePage');
                }
            }
        },
    };

    const loadRooms = async () => {
        const roomsEndpoint = props.showDeletedRooms ? 'rooms?show_unavailable=1' : 'rooms';
        const rooms = await useApiService(roomsEndpoint).fetchAll();

        const transformedRooms = rooms.map(room => ({
            ...room,
            title: room.name,
        }));

        calendarOptions.value.resources = transformedRooms;
    };

    const handleRefreshCalendar = () => {
        const api = refCalendar.value?.getApi()
        if (api) {
            api.refetchEvents()
        }
    };

    watch(() => props.showDeletedRooms, () => {
        loadRooms();
    }, { immediate: true });

    onMounted(() => {
        document.addEventListener('hidden.bs.modal', handleRefreshCalendar);
    });
</script>
