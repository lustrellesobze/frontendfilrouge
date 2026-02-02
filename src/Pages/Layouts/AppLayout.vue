<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <Link :href="route('dashboard')" class="text-xl font-bold text-indigo-600">
                                SGEE
                            </Link>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                v-if="$page.props.auth?.user"
                                :href="route('dashboard')"
                                :class="[
                                    $page.url.startsWith('/dashboard') 
                                        ? 'border-indigo-500 text-gray-900' 
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]"
                            >
                                Tableau de bord
                            </Link>
                            <Link
                                v-if="hasStudentRole"
                                :href="route('enrollments.index')"
                                :class="[
                                    $page.url.startsWith('/enrollments') 
                                        ? 'border-indigo-500 text-gray-900' 
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]"
                            >
                                Mes enrôlements
                            </Link>
                            <Link
                                v-if="hasAdminRole"
                                :href="route('admin.dashboard')"
                                :class="[
                                    $page.url.startsWith('/admin') 
                                        ? 'border-indigo-500 text-gray-900' 
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                ]"
                            >
                                Administration
                            </Link>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div v-if="$page.props.auth?.user" class="flex items-center space-x-4">
                            <span class="text-sm text-gray-700">
                                {{ $page.props.auth.user.name }}
                            </span>
                            <Link
                                :href="route('logout')"
                                method="post"
                                class="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Déconnexion
                            </Link>
                        </div>
                        <div v-else class="flex items-center space-x-4">
                            <Link
                                :href="route('login')"
                                class="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Connexion
                            </Link>
                            <Link
                                :href="route('register')"
                                class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                            >
                                Inscription
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Page Content -->
        <main>
            <slot />
        </main>

        <!-- Flash Messages -->
        <div v-if="$page.props.flash?.success" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
            {{ $page.props.flash.success }}
        </div>
        <div v-if="$page.props.flash?.error" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg">
            {{ $page.props.flash.error }}
        </div>
    </div>
</template>

<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const user = computed(() => page.props.auth?.user);
const userRoles = computed(() => user.value?.roles || []);

const hasStudentRole = computed(() => {
    return userRoles.value.includes('student');
});

const hasAdminRole = computed(() => {
    return userRoles.value.includes('admin');
});
</script>

