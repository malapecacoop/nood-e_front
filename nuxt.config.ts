import path from 'path';

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: process.env.NUXT_DEVTOOLS == 'true' },

  plugins: [
      '~/plugins/node-snackbar.js',
      { src: '~/plugins/bootstrap-modal.js', mode: 'client' },
      '~/plugins/appUrl.js'
  ],

  css: [
      '@/assets/scss/global-styles.scss',
  ],

  image: {
    presets: {
      'default-image': {
          modifiers: {
            format: 'jpg',
            quality: 75
        }
      }
    }
  },

  vite: {
      resolve: {
          alias: {
              '@bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
              '@font-awesome': path.resolve(__dirname, 'node_modules/@fortawesome'),
              '@multiple-select': path.resolve(__dirname, 'node_modules/multiple-select'),
              '@select2': path.resolve(__dirname, 'node_modules/select2'),
              '@slick-carousel': path.resolve(__dirname, 'node_modules/slick-carousel'),
              '@node-snackbar': path.resolve(__dirname, 'node_modules/node-snackbar'),
              '@datatables': path.resolve(__dirname, 'node_modules/datatables.net-bs5'),
          }
      },
      optimizeDeps: {
          include: ['quill']
      }
  },

  app: {
      head: {
          title: 'Nood·e',
          meta: [
              { name: 'viewport', content: 'width=device-width, initial-scale=1' },
              { name: 'msapplication-TileColor', content: '#898be8' },
              { name: 'theme-color', content: '#ffffff' }
          ],
          link: [
              { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
              { rel: 'icon', type: "image/png", sizes: '32x32', href: '/favicon/favicon-32x32.png' },
              { rel: 'icon', type: "image/png", sizes: '16x16', href: '/favicon/favicon-16x16.png' },
              { rel: 'manifest', href: '/favicon/site.webmanifest' },
              { rel: 'mask-icon', sizes: '180x180', href: '/favicon/safari-pinned-tab.svg', color: '#898be8' },
              { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
              { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOriginPrefetch: true },
              { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
              { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap' },
          ],
      },
      pageTransition: { name: 'page', mode: 'out-in' }
  },

  modules: ["@nuxt/image", '@pinia/nuxt'],

  runtimeConfig: {
      public: {
          apiBase: process.env.API_BASE_URL,
          appUrl: process.env.APP_URL,
          frontUrl: process.env.FRONT_URL,
      }
  },

  alias: {
      pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
  },

  compatibilityDate: '2024-09-19',
})