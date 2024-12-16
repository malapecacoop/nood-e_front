<template>
    <div class="app">
        <div class="container-fluid">
            <TopBar />
        </div>
        <div class="container-fluid">
            <div class="app-content">
                <SideNav />
                <main class="main-content">
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>

<style>
    .page-enter-active,
    .page-leave-active {
        transition: all 0.4s;
    }

    .page-enter-from,
    .page-leave-to {
        opacity: 0;
        filter: blur(1rem);
    }
</style>