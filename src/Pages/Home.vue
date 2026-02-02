<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
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
                            <Link :href="route('sites.index')" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                                Nos sites
                            </Link>
                            <Link :href="route('exams.index')" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                                Anciennes épreuves
                            </Link>
                            <Link :href="route('faq')" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                                FAQ
                            </Link>
                            <Link :href="route('arretes.index')" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                                Arrêtés du concours
                            </Link>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <Link
                            v-if="!$page.props.auth?.user"
                            :href="route('login')"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            Connexion
                        </Link>
                        <Link
                            v-else
                            :href="route('dashboard')"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            Mon compte
                        </Link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-gray-900 mb-4">
                    Bienvenue sur notre plateforme d'inscription de ESTLC
                </h1>
                <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Plateforme moderne et sécurisée pour l'inscription aux concours d'entrée. 
                    Inscrivez-vous facilement en ligne, suivez votre dossier en temps réel et 
                    recevez toutes les informations importantes par email.
                </p>
                <p class="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                    Choisissez votre niveau d'admission et commencez votre inscription dès maintenant.
                </p>
            </div>

            <!-- Choice Buttons -->
            <div class="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
                <Link
                    :href="route('enrollments.create', { level: 'first-year' })"
                    class="w-full sm:w-80 px-8 py-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                >
                    <div class="text-4xl mb-4">🎓</div>
                    <h2 class="text-2xl font-bold mb-2">Première Année</h2>
                    <p class="text-indigo-100">
                        Pour les candidats ayant le niveau Baccalauréat camerounais
                    </p>
                </Link>

                <Link
                    :href="route('enrollments.create', { level: 'third-year' })"
                    class="w-full sm:w-80 px-8 py-12 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                >
                    <div class="text-4xl mb-4">📚</div>
                    <h2 class="text-2xl font-bold mb-2">Troisième Année</h2>
                    <p class="text-purple-100">
                        Pour les candidats ayant le niveau Licence
                    </p>
                </Link>
            </div>

            <!-- CTA Button -->
            <div class="text-center mt-12">
                <Link
                    :href="route('arretes.index')"
                    class="inline-block px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg text-lg font-medium hover:bg-indigo-50 transition"
                >
                    Commencer
                </Link>
            </div>
        </div>

        <!-- Footer with Contact -->
        <footer class="bg-gray-800 text-white mt-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="mb-4 md:mb-0">
                        <p class="text-gray-300">Contactez-nous :</p>
                        <a :href="`mailto:${contactEmail}`" class="text-indigo-400 hover:text-indigo-300">
                            {{ contactEmail }}
                        </a>
                    </div>
                    <div>
                        <a
                            :href="whatsappUrl"
                            target="_blank"
                            class="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg transition"
                        >
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>Nous contacter sur WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

const contactEmail = 'contact@estlc.cm';
const whatsappUrl = 'https://wa.me/237XXXXXXXXX?text=Bonjour, je souhaite obtenir des informations sur le concours.';
</script>

