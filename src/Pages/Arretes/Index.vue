<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center space-x-8">
                        <Link :href="route('welcome')" class="text-xl font-bold text-indigo-600">
                            SGEE
                        </Link>
                        <div class="hidden md:flex space-x-6">
                            <Link :href="route('welcome')" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                                Accueil
                            </Link>
                            <Link :href="route('arretes.index')" class="text-indigo-600 border-b-2 border-indigo-600 px-3 py-2 text-sm font-medium">
                                Arrêtés du concours
                            </Link>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <Link
                            :href="route('login')"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            Connexion
                        </Link>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="bg-white shadow-lg rounded-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-6">Arrêté du Concours d'Entrée</h1>
                
                <div class="prose max-w-none mb-8">
                    <div v-if="arrete" class="space-y-6">
                        <div>
                            <h2 class="text-xl font-semibold text-gray-800 mb-2">Informations Générales</h2>
                            <p class="text-gray-600" v-html="arrete.content"></p>
                        </div>

                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <h3 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ Dates Importantes</h3>
                            <ul class="space-y-2 text-yellow-700">
                                <li><strong>Date limite de dépôt de dossier :</strong> {{ formatDate(arrete.deadline_date) }}</li>
                                <li><strong>Date de composition :</strong> {{ formatDate(arrete.exam_date) }}</li>
                                <li><strong>Date de publication des résultats :</strong> {{ formatDate(arrete.results_date) }}</li>
                            </ul>
                        </div>

                        <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <h3 class="text-lg font-semibold text-blue-800 mb-2">💰 Frais du Concours</h3>
                            <ul class="space-y-2 text-blue-700">
                                <li><strong>Frais d'inscription :</strong> {{ arrete.registration_fee }} FCFA</li>
                                <li><strong>Frais de traitement :</strong> {{ arrete.processing_fee }} FCFA</li>
                                <li><strong>Total à payer :</strong> <span class="text-lg font-bold">{{ arrete.total_fee }} FCFA</span></li>
                            </ul>
                        </div>

                        <div class="bg-green-50 border-l-4 border-green-400 p-4">
                            <h3 class="text-lg font-semibold text-green-800 mb-2">📋 Conditions d'Admission</h3>
                            <ul class="space-y-2 text-green-700">
                                <li v-for="(condition, index) in arrete.conditions" :key="index">
                                    {{ condition }}
                                </li>
                            </ul>
                        </div>

                        <div v-if="arrete.document_path" class="mt-8">
                            <a
                                :href="route('arretes.download', arrete.id)"
                                class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Télécharger l'arrêté complet (PDF)
                            </a>
                        </div>
                    </div>
                    <div v-else class="text-center py-12">
                        <p class="text-gray-500">Aucun arrêté disponible pour le moment.</p>
                    </div>
                </div>

                <div class="mt-8 pt-8 border-t border-gray-200">
                    <Link
                        :href="route('login')"
                        class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Commencer mon inscription
                    </Link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    arrete: Object,
});

const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

