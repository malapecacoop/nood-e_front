<template>
    <FullCalendar :options="calendarOptions" :endpoint="endpoint"/>
</template>

<script setup>
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
    import { useApiService } from '~/services/apiService';

    const props = defineProps({
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
    let data = ref([]);

    const plugins = computed(() => {
        let basePlugins = [dayGridPlugin, timeGridPlugin, listPlugin];
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

    const getData = async (args) => {
        if (args) {
            dateStart = args.startStr;
            dateEnd = args.endStr;

            dateStart = dateStart.split('T')[0];
            dateEnd = dateEnd.split('T')[0];
        }
        data = await useApiService(props.endpoint).fetchAll({ start: dateStart, end: dateEnd });

        let transformedEvents = data.map(event => ({
            ...event,
            resourceId: event.room_id,
        }));

        calendarOptions.value.events = transformedEvents;
    }

    calendarOptions.value = {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        height: "auto",
        plugins: plugins.value,
        initialView: props.initialView,
        datesSet: getData,
        headerToolbar: headerToolbar.value,
        buttonText: {
            today: 'Avui',
            month: 'Mes',
            week: 'Setmana',
            day: 'Dia',
            list: 'Agenda',
            resourceTimelineDay: 'Dia',
            resourceTimelineWeek: 'Setmana'
        },
        editable: true,
        dropable: true,
        selectable: true,
        weekends: true,
        locale: 'ca',
        resources: [],
        events: [],
        resourceAreaHeaderContent: 'Sales',
        resourceLabelDidMount: function(info) {
            if (!info.resource.extendedProps.is_available) {
                info.el.classList.add('text-muted', 'fw-bold');
            }
        },
        eventClick: function(info) {
            nuxtApp.$router.push(`/calendari/esdeveniments/${info.event.id}`);
        }
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

    await getData();

    watch(() => props.showDeletedRooms, () => {
        loadRooms();
    }, { immediate: true });
</script>
