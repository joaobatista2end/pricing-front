export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // Se o usuário não estiver autenticado e a rota não é de login ou confirmação
  if (!user.value && to.path !== '/login' && to.path !== '/confirm') {
    return navigateTo('/login');
  }

  // Se o usuário estiver autenticado e tentar acessar a página de login
  if (user.value && (to.path === '/login' || to.path === '/confirm')) {
    return navigateTo('/');
  }
}); 