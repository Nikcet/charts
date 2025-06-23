<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
)

const props = defineProps({
    data: {
        type: Array as () => Array<{ x: Date; y: number }>,
        required: true
    },
    loading: Boolean,
    error: String
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'day' as const,
                tooltipFormat: 'dd.MM.yyyy HH:mm',
                displayFormats: {
                    day: 'dd.MM.yyyy',
                    week: 'dd.MM.yyyy',
                    month: 'MMM yyyy',
                    year: 'yyyy'
                }
            },
            title: {
                display: true,
                text: 'Дата'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Цена (USD)'
            },
            beginAtZero: false,
            grace: '5%'
        }
    },
    plugins: {
        tooltip: {
            callbacks: {
                label: (context: any) => `$${context.parsed.y.toFixed(2)}`
            }
        },
        legend: {
            display: false,
        }
    }
}

const dataset = computed(() => ({
    data: props.data,
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 2,
    pointBackgroundColor: '#2980b9',
    tension: 0.5,
    fill: {
        target: 'origin', // Заливка от линии до оси X
        above: 'rgba(52, 152, 219, 0.1)', // Цвет выше базовой линии
    }
}))
</script>

<template>
    <div v-if="loading" class="text-center py-8">
        Загрузка данных...
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
        {{ error }}
    </div>
    <div v-else class="chart h-96">
        <Line :data="{ datasets: [dataset] }" :options="chartOptions" />
    </div>
</template>

<style>
.chart {
    height: 80vh;
    width: 100%;
}
</style>