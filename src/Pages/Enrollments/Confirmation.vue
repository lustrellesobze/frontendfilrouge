<template>
    <AppLayout title="Confirmation d'Inscription">
        <div class="py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Success Message -->
                <div class="bg-green-50 border-l-4 border-green-400 p-6 mb-8 rounded-lg">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h2 class="text-2xl font-bold text-green-800">
                                Félicitations !
                            </h2>
                            <p class="mt-2 text-green-700">
                                Nous avons bien reçu votre candidature. Nous vérifions que votre dossier est complet 
                                et nous vous renverrons la confirmation par email à l'adresse 
                                <strong>{{ $page.props.auth?.user?.email }}</strong> 
                                ou par téléphone dans les prochaines heures.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Enrollment Form with QR Code -->
                <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div class="text-center mb-6">
                        <h3 class="text-2xl font-bold text-gray-900 mb-2">Fiche d'Enrôlement</h3>
                        <p class="text-gray-600">Code d'enrôlement : <strong>{{ enrollment.enrollment_code }}</strong></p>
                    </div>

                    <!-- QR Code -->
                    <div class="flex justify-center mb-6">
                        <div class="bg-white p-4 border-2 border-gray-300 rounded-lg">
                            <img
                                v-if="enrollment.qr_code_path"
                                :src="enrollment.qr_code_path"
                                alt="QR Code"
                                class="w-48 h-48"
                            />
                            <div v-else class="w-48 h-48 bg-gray-200 flex items-center justify-center">
                                <span class="text-gray-500">QR Code en cours de génération...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Enrollment Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">Informations Personnelles</h4>
                            <p class="text-sm text-gray-600">
                                <strong>Nom :</strong> {{ enrollment.student?.user?.name }}<br>
                                <strong>Email :</strong> {{ enrollment.student?.user?.email }}<br>
                                <strong>CNI/Passeport :</strong> {{ enrollment.student?.user?.national_id || 'N/A' }}
                            </p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">Informations Académiques</h4>
                            <p class="text-sm text-gray-600">
                                <strong>Programme :</strong> {{ enrollment.program?.name }}<br>
                                <strong>Département :</strong> {{ enrollment.program?.department?.name }}<br>
                                <strong>Session :</strong> {{ enrollment.academicSession?.label }}
                            </p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">Centre d'Examen</h4>
                            <p class="text-sm text-gray-600">
                                <strong>Centre :</strong> {{ enrollment.assignedExamCenter?.name || enrollment.preferredCenter?.name || 'À assigner' }}<br>
                                <strong>Région :</strong> {{ enrollment.preferredRegion?.name || 'N/A' }}<br>
                                <strong>Salle :</strong> {{ enrollment.assignedExamRoom?.name || 'À assigner' }}<br>
                                <strong>Place :</strong> {{ enrollment.seat_number || 'À assigner' }}
                            </p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">Informations de Paiement</h4>
                            <p class="text-sm text-gray-600">
                                <strong>Quitus unique :</strong> {{ enrollment.enrollment_code }}<br>
                                <strong>Statut :</strong> 
                                <span :class="{
                                    'text-green-600': enrollment.status === 'validated',
                                    'text-yellow-600': enrollment.status === 'submitted',
                                    'text-gray-600': enrollment.status === 'draft'
                                }">
                                    {{ getStatusLabel(enrollment.status) }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
                        <h4 class="font-semibold text-yellow-800 mb-4">Consignes Importantes</h4>
                        <ol class="list-decimal list-inside space-y-2 text-yellow-700">
                            <li>
                                <strong>Bien vouloir imprimer la fiche en couleur sous peine de rejet</strong> pour le dépôt physique du dossier.
                            </li>
                            <li>
                                <strong>Faire signer la fiche et la timbrer</strong> avant le dépôt.
                            </li>
                            <li>
                                <strong>Bien vouloir enregistrer et conserver</strong> cette fiche de manière confidentielle.
                            </li>
                            <li>
                                En cas de perte de cette fiche, <strong>bien vouloir se connecter sur cette plateforme</strong> avec vos identifiants pour la télécharger à nouveau.
                            </li>
                        </ol>
                    </div>

                    <!-- Download Button -->
                    <div class="text-center">
                        <a
                            :href="route('enrollments.download', enrollment.id)"
                            class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Télécharger la fiche d'enrôlement (PDF)
                        </a>
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">Prochaines Étapes</h4>
                    <ul class="list-disc list-inside space-y-2 text-blue-700">
                        <li>Vous recevrez un email de confirmation dans les prochaines heures</li>
                        <li>Imprimez votre fiche d'enrôlement en couleur</li>
                        <li>Signez et timbrez la fiche</li>
                        <li>Déposez votre dossier complet dans votre centre de dépôt avant la date limite</li>
                        <li>Conservez précieusement votre code d'enrôlement et votre quitus</li>
                    </ul>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '../Layouts/AppLayout.vue';

const props = defineProps({
    enrollment: Object,
});

const getStatusLabel = (status) => {
    const labels = {
        'draft': 'Brouillon',
        'submitted': 'Soumis',
        'validated': 'Validé',
        'rejected': 'Rejeté',
    };
    return labels[status] || status;
};
</script>

