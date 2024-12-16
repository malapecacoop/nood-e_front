<template>
    <div>
        <div class="page-head">
            <div class="page-head__title-wrap">
                <h1 class="page-head__title">Calendari</h1>
            </div>
            <div class="page-head__ctas">
                <Button
                    buttonClass="btn btn-sm btn-primary"
                    buttonType="hyperlink"
                    buttonLink="/calendari/esdeveniments/crear"
                >
                    Nou esdeveniment
                </Button>
            </div>
        </div>
        <div class="page-content">
            <FullCalendar endpoint="events"/>
        </div>
    </div>
</template>

<script setup>
    import FullCalendar from '~/components/FullCalendar.vue';
</script>