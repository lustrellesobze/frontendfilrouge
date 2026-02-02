<template>
    <div class="w-full">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progression</span>
            <span class="text-sm font-medium text-gray-700">{{ currentStep }} / {{ totalSteps }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
                class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
        </div>
        <div class="flex justify-between mt-2">
            <span
                v-for="(step, index) in steps"
                :key="index"
                :class="[
                    'text-xs',
                    index + 1 <= currentStep ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                ]"
            >
                {{ step }}
            </span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    currentStep: {
        type: Number,
        required: true,
    },
    totalSteps: {
        type: Number,
        required: true,
    },
    steps: {
        type: Array,
        default: () => [],
    },
});
</script>

