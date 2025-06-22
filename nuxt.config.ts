// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/fonts'
  ],
  $production: {
    routeRules: {
      "/**": {isr: true}
    }
  },
  $development: {},
  $env: {
    staging: {}
  },
  nitro: {
    plugins: ['~/server/plugins/scheduler.ts']
  }
})