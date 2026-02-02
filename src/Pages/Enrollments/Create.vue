<template>
    <AppLayout title="Inscription au Concours">
        <div class="py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Progress Bar -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <ProgressBar
                        :current-step="currentStep"
                        :total-steps="totalSteps"
                        :steps="stepLabels"
                    />
                </div>

                <!-- Form Steps -->
                <div class="bg-white rounded-lg shadow p-8">
                    <!-- Step 1: Informations Personnelles -->
                    <div v-show="currentStep === 1">
                        <h2 class="text-2xl font-bold mb-6">Informations Personnelles</h2>
                        <form @submit.prevent="nextStep">
                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Nom complet *
                                        </label>
                                        <input
                                            v-model="formData.personal.name"
                                            type="text"
                                            required
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Date de naissance *
                                        </label>
                                        <input
                                            v-model="formData.personal.birth_date"
                                            type="date"
                                            required
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Souffrez-vous d'un handicap ?
                                    </label>
                                    <div class="flex items-center space-x-4">
                                        <label class="flex items-center">
                                            <input
                                                v-model="formData.personal.has_disability"
                                                type="checkbox"
                                                class="mr-2"
                                            />
                                            Oui
                                        </label>
                                    </div>
                                    <textarea
                                        v-if="formData.personal.has_disability"
                                        v-model="formData.personal.disability_description"
                                        placeholder="Décrivez votre handicap"
                                        class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                            <div class="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 2: Informations Académiques -->
                    <div v-show="currentStep === 2">
                        <h2 class="text-2xl font-bold mb-6">Informations Académiques</h2>
                        <form @submit.prevent="nextStep">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Filière d'admission *
                                    </label>
                                    <select
                                        v-model="formData.academic.program_id"
                                        @change="onProgramChange"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez une filière</option>
                                        <option
                                            v-for="program in filteredPrograms"
                                            :key="program.id"
                                            :value="program.id"
                                        >
                                            {{ program.name }} ({{ program.department?.name }})
                                        </option>
                                    </select>
                                </div>
                                
                                <div v-if="selectedProgram">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Diplôme requis *
                                    </label>
                                    <select
                                        v-model="formData.academic.diploma"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez un diplôme</option>
                                        <option
                                            v-for="diploma in availableDiplomas"
                                            :key="diploma"
                                            :value="diploma"
                                        >
                                            {{ diploma }}
                                        </option>
                                    </select>
                                </div>
                                
                                <div v-if="selectedProgram">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Spécialité / Site de formation *
                                    </label>
                                    <select
                                        v-model="formData.academic.campus_id"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez une spécialité</option>
                                        <option
                                            v-for="campus in availableCampuses"
                                            :key="campus.id"
                                            :value="campus.id"
                                        >
                                            {{ campus.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    @click="previousStep"
                                    class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 3: Informations Concours -->
                    <div v-show="currentStep === 3">
                        <h2 class="text-2xl font-bold mb-6">Informations liées au Concours</h2>
                        <form @submit.prevent="nextStep">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Région de composition *
                                    </label>
                                    <select
                                        v-model="formData.exam.preferred_region_id"
                                        @change="onRegionChange"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez une région</option>
                                        <option
                                            v-for="region in regions"
                                            :key="region.id"
                                            :value="region.id"
                                        >
                                            {{ region.name }}
                                        </option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Centre d'examen *
                                    </label>
                                    <select
                                        v-model="formData.exam.preferred_center_id"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez un centre</option>
                                        <option
                                            v-for="center in availableCenters"
                                            :key="center.id"
                                            :value="center.id"
                                        >
                                            {{ center.name }} - {{ center.city }}
                                        </option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Centre de dépôt *
                                    </label>
                                    <select
                                        v-model="formData.exam.depot_center_id"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Sélectionnez un centre de dépôt</option>
                                        <option
                                            v-for="center in examCenters"
                                            :key="center.id"
                                            :value="center.id"
                                        >
                                            {{ center.name }} - {{ center.city }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    @click="previousStep"
                                    class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 4: Informations Complémentaires -->
                    <div v-show="currentStep === 4">
                        <h2 class="text-2xl font-bold mb-6">Informations Complémentaires</h2>
                        <form @submit.prevent="nextStep">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du père ou tuteur *
                                    </label>
                                    <input
                                        v-model="formData.complementary.guardian_name"
                                        type="text"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone du père/tuteur *
                                    </label>
                                    <input
                                        v-model="formData.complementary.guardian_phone"
                                        type="tel"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Numéro à contacter en cas d'urgence *
                                    </label>
                                    <input
                                        v-model="formData.complementary.emergency_contact"
                                        type="tel"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div class="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    @click="previousStep"
                                    class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 5: Documents -->
                    <div v-show="currentStep === 5">
                        <h2 class="text-2xl font-bold mb-6">Pièces du Dossier</h2>
                        <form @submit.prevent="nextStep">
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Diplômes (PDF) *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'diploma')"
                                        accept=".pdf"
                                        multiple
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                    <p class="mt-1 text-xs text-gray-500">Téléchargez vos diplômes au format PDF</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Photocopie de l'acte de naissance *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'birth_certificate')"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        4 Photos d'identité *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'photos')"
                                        accept=".jpg,.jpeg,.png"
                                        multiple
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                    <p class="mt-1 text-xs text-gray-500">Téléchargez 4 photos d'identité</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Reçu du versement à la banque (scanné) *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'payment_receipt')"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Photocopie de la carte d'identité *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'id_card')"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Quitus de la banque *
                                    </label>
                                    <input
                                        type="file"
                                        @change="handleFileUpload($event, 'quitus')"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div class="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    @click="previousStep"
                                    class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 6: Confirmation et Soumission -->
                    <div v-show="currentStep === 6">
                        <h2 class="text-2xl font-bold mb-6">Confirmation et Soumission</h2>
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <p class="text-yellow-800 font-semibold">
                                ⚠️ Attention : Veuillez vérifier votre dossier
                            </p>
                            <p class="text-yellow-700 mt-2">
                                L'envoi de ce dossier ne pourra pas être réversible une fois le dossier envoyé.
                            </p>
                        </div>
                        
                        <div class="space-y-4 mb-6">
                            <div class="bg-gray-50 p-4 rounded">
                                <h3 class="font-semibold mb-2">Récapitulatif</h3>
                                <p class="text-sm text-gray-600">Vérifiez toutes les informations avant de soumettre.</p>
                            </div>
                        </div>
                        
                        <div class="flex justify-between">
                            <button
                                type="button"
                                @click="previousStep"
                                class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Précédent
                            </button>
                            <button
                                type="button"
                                @click="submitEnrollment"
                                :disabled="submitting"
                                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                <span v-if="!submitting">Soumettre le dossier</span>
                                <span v-else>Soumission...</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AppLayout from '../Layouts/AppLayout.vue';
import ProgressBar from '../../Components/ProgressBar.vue';

const props = defineProps({
    level: String,
    programs: Array,
    regions: Array,
    campuses: Array,
    examCenters: Array,
    sessions: Array,
    enrollment: Object,
});

const currentStep = ref(1);
const totalSteps = 6;
const submitting = ref(false);

const stepLabels = [
    'Informations Personnelles',
    'Informations Académiques',
    'Informations Concours',
    'Informations Complémentaires',
    'Documents',
    'Confirmation'
];

const formData = ref({
    personal: {
        name: '',
        birth_date: '',
        has_disability: false,
        disability_description: '',
    },
    academic: {
        program_id: '',
        diploma: '',
        campus_id: '',
    },
    exam: {
        preferred_region_id: '',
        preferred_center_id: '',
        depot_center_id: '',
    },
    complementary: {
        guardian_name: '',
        guardian_phone: '',
        emergency_contact: '',
    },
    documents: {
        diploma: [],
        birth_certificate: null,
        photos: [],
        payment_receipt: null,
        id_card: null,
        quitus: null,
    },
});

// Computed properties
const filteredPrograms = computed(() => {
    if (props.level === 'first-year') {
        return props.programs.filter(p => p.cycle === 'licence');
    } else if (props.level === 'third-year') {
        return props.programs.filter(p => p.cycle === 'master');
    }
    return props.programs;
});

const selectedProgram = computed(() => {
    return props.programs.find(p => p.id == formData.value.academic.program_id);
});

const availableDiplomas = computed(() => {
    if (!selectedProgram.value) return [];
    // TODO: Récupérer les diplômes requis depuis la base de données
    return ['Baccalauréat', 'GCE A-Level', 'Autre'];
});

const availableCampuses = computed(() => {
    if (!selectedProgram.value) return [];
    return props.campuses.filter(c => c.id === selectedProgram.value.campus_id || !selectedProgram.value.campus_id);
});

const availableCenters = computed(() => {
    if (!formData.value.exam.preferred_region_id) return [];
    return props.examCenters.filter(c => c.region_id == formData.value.exam.preferred_region_id);
});

// Methods
const onProgramChange = () => {
    formData.value.academic.diploma = '';
    formData.value.academic.campus_id = '';
};

const onRegionChange = () => {
    formData.value.exam.preferred_center_id = '';
};

const handleFileUpload = (event, type) => {
    const files = event.target.files;
    if (type === 'photos' || type === 'diploma') {
        formData.value.documents[type] = Array.from(files);
    } else {
        formData.value.documents[type] = files[0];
    }
    autoSave();
};

const autoSave = async () => {
    try {
        await router.post(route('enrollments.auto-save'), {
            step: currentStep.value,
            data: formData.value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
};

const nextStep = () => {
    if (currentStep.value < totalSteps) {
        currentStep.value++;
        autoSave();
    }
};

const previousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const submitEnrollment = async () => {
    if (!confirm('Êtes-vous sûr de vouloir soumettre votre dossier ? Cette action est irréversible.')) {
        return;
    }
    
    submitting.value = true;
    try {
        await router.post(route('enrollments.submit', props.enrollment?.id || 1), {}, {
            onSuccess: () => {
                // Redirection vers la page de confirmation
            },
        });
    } catch (error) {
        console.error('Submission failed:', error);
        submitting.value = false;
    }
};

// Auto-save on change
watch(formData, () => {
    autoSave();
}, { deep: true });

// Restore from enrollment if exists
onMounted(() => {
    if (props.enrollment?.metadata?.steps) {
        const steps = props.enrollment.metadata.steps;
        Object.keys(steps).forEach(step => {
            const stepData = steps[step];
            if (stepData.personal) formData.value.personal = { ...formData.value.personal, ...stepData.personal };
            if (stepData.academic) formData.value.academic = { ...formData.value.academic, ...stepData.academic };
            if (stepData.exam) formData.value.exam = { ...formData.value.exam, ...stepData.exam };
            if (stepData.complementary) formData.value.complementary = { ...formData.value.complementary, ...stepData.complementary };
        });
        currentStep.value = props.enrollment.metadata.current_step || 1;
    }
});
</script>

