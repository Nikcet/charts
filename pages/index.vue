<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PriceChart from '~/components/PriceChart.vue'
import { useFetch } from '#app'
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns'
import { ru } from 'date-fns/locale' // Добавлена локализация
import DatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// Состояния
const range = ref<'day' | 'week' | 'month' | 'year' | 'custom'>('month')
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const chartData = ref<Array<{ x: Date; y: number }>>([])
const errorMessage = ref<string | undefined>(undefined)
const loading = ref(false)

// Рассчитанные даты для отображения
const displayDates = computed(() => {
  if (range.value === 'custom' && startDate.value && endDate.value) {
    return `${format(startDate.value, 'dd.MM.yyyy')} - ${format(endDate.value, 'dd.MM.yyyy')}`
  }
  return ''
})

// Функция для загрузки данных
async function fetchData() {
  loading.value = true
  errorMessage.value = undefined

  let url = '/api/prices?'
  if (range.value !== 'custom') {
    url += `range=${range.value}`
  } else {
    if (!startDate.value || !endDate.value) {
      errorMessage.value = 'Укажите диапазон дат'
      loading.value = false
      return
    }
    url += `startTime=${startDate.value.toISOString()}&endTime=${endDate.value.toISOString()}`
  }

  try {
    const { data, error } = await useFetch(url)
    if (error.value) {
      throw new Error(error.value.message)
    }

    // Нормализация данных
    chartData.value = (data.value as any[]).map(item => {
      return {
        x: new Date(item.time_bucket || item.timestamp),
        y: parseFloat(item.avg_price || item.price)
      }
    })
  } catch (err: any) {
    errorMessage.value = err.message || 'Ошибка загрузки данных'
  } finally {
    loading.value = false
  }
}

// Инициализация: загрузка данных по умолчанию
fetchData()

// Следим за изменением периода
watch(range, (newRange) => {
  if (newRange !== 'custom') {
    startDate.value = null
    endDate.value = null
    fetchData()
  }
})

// Обработчик для кнопок периода
function setPeriod(period: 'day' | 'week' | 'month' | 'year') {
  range.value = period
}

// Обновить данные
function refresh() {
  fetchData()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Исторические данные о ценах на биткоин</h1>

    <!-- Управление -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="flex gap-2">
        <button v-for="period in ['day', 'week', 'month', 'year']" :key="period" @click="setPeriod(period)"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :class="{ 'bg-blue-700': range === period }">
          {{ period === 'day' ? 'День' : period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год' }}
        </button>
        <button @click="range = 'custom'" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :class="{ 'bg-blue-700': range === 'custom' }">
          Кастомный
        </button>
      </div>

      <div v-if="range === 'custom'" class="flex gap-2 items-center">
        <DatePicker v-model="startDate" placeholder="Начало" :enable-time-picker="false" :locale="ru" />
        <DatePicker v-model="endDate" placeholder="Конец" :enable-time-picker="false" :locale="ru" />
      </div>

      <div v-if="displayDates" class="text-sm text-gray-600">
        {{ displayDates }}
      </div>

      <button @click="refresh" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Обновить
      </button>
    </div>

    <!-- График -->
    <PriceChart :data="chartData" :loading="loading" :error="errorMessage" />
  </div>
</template>

<style>
.container {
  max-width: 1600px;
  width: 94%;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
}
</style>