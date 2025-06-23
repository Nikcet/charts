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
    TimeScale
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
    TimeScale
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
    maintainAspectRatio: true,
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
            }
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
    tension: 0.1, 
    fill: true
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
    height: 70vh;
    width: 100%;
}
</style>