<template>
    <div class="top-bar d-flex align-items-center justify-content-between py-2">
        <NuxtImg :src="`${ $frontUrl }/images/logo.svg`" densities="x1" alt="Nood·e" />
        <div class="d-flex align-items-center">
            <UserDropdown />
            <button class="icon-btn icon-btn-xl ms-2 d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mainMenu" aria-controls="mainMenu">
                <i class="material-symbols-outlined">menu</i>
            </button>
        </div>
    </div>
</template>

<script setup>
    const { $frontUrl } = useNuxtApp();
</script>