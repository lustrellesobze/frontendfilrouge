<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Connexion à votre compte
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Ou
                    <Link :href="route('register')" class="font-medium text-indigo-600 hover:text-indigo-500">
                        créez un nouveau compte
                    </Link>
                </p>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="submit">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email" class="sr-only">Email</label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Adresse email"
                        />
                        <div v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</div>
                    </div>
                    <div>
                        <label for="password" class="sr-only">Mot de passe</label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Mot de passe"
                        />
                        <div v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</div>
                    </div>
                    <div>
                        <label for="quitus_number" class="sr-only">Numéro de quitus unique</label>
                        <input
                            id="quitus_number"
                            v-model="form.quitus_number"
                            type="text"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Numéro de quitus unique (après paiement à la banque)"
                        />
                        <div v-if="errors.quitus_number" class="mt-1 text-sm text-red-600">{{ errors.quitus_number }}</div>
                        <p class="mt-1 text-xs text-gray-500">Le numéro de quitus vous est fourni après votre paiement à la banque</p>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input
                            id="remember"
                            v-model="form.remember"
                            type="checkbox"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label for="remember" class="ml-2 block text-sm text-gray-900">
                            Se souvenir de moi
                        </label>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        :disabled="processing"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <span v-if="!processing">Se connecter</span>
                        <span v-else>Connexion...</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    email: '',
    password: '',
    quitus_number: '',
    remember: false,
});

const props = defineProps({
    errors: Object,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};

const processing = form.processing;
</script>

