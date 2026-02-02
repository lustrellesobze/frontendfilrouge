<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Créer un nouveau compte
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Ou
                    <Link :href="route('login')" class="font-medium text-indigo-600 hover:text-indigo-500">
                        connectez-vous à votre compte existant
                    </Link>
                </p>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="submit">
                <div class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Nom complet</label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Votre nom complet"
                        />
                        <div v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</div>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="adresse@email.com"
                        />
                        <div v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</div>
                    </div>
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
                        <input
                            id="phone"
                            v-model="form.phone"
                            type="tel"
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="+237 6XX XXX XXX"
                        />
                        <div v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</div>
                    </div>
                    <div>
                        <label for="national_id" class="block text-sm font-medium text-gray-700">CNI (optionnel)</label>
                        <input
                            id="national_id"
                            v-model="form.national_id"
                            type="text"
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Numéro de CNI"
                        />
                        <div v-if="errors.national_id" class="mt-1 text-sm text-red-600">{{ errors.national_id }}</div>
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Minimum 8 caractères"
                        />
                        <div v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</div>
                    </div>
                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                        <input
                            id="password_confirmation"
                            v-model="form.password_confirmation"
                            type="password"
                            required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Répétez le mot de passe"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        :disabled="processing"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <span v-if="!processing">Créer mon compte</span>
                        <span v-else>Création...</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    password: '',
    password_confirmation: '',
});

const props = defineProps({
    errors: Object,
});

const submit = () => {
    form.post(route('register'));
};

const processing = form.processing;
</script>

