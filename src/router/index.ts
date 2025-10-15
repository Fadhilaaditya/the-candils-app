import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/user/Home/HomeView.vue'
import AboutUs from '@/views/user/AboutUs/AboutUs.vue'
import Product from '@/views/user/Product/ProductView.vue'
import Location from '@/views/user/Locations/LocationView.vue'
import AdminLogin from '@/views/admin/auth/Login.vue'
import AdminResetPassword from '@/views/admin/auth/ResetPassword.vue'
import AdminDashboard from '@/views/admin/dashboard/Dashboard/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutUs,
    },
    {
      path: '/products',
      name: 'products',
      component: Product,
    },
    {
      path: '/locations',
      name: 'locations',
      component: Location,
    },
    // Admin routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLogin,
    },
    {
      path: '/admin/reset-password',
      name: 'admin-reset-password',
      component: AdminResetPassword,
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/dashboard/App.vue'),
      children: [
        {
          path: '',
          name: 'admin-dashboard-main',
          component: AdminDashboard,
        },
        {
          path: 'products',
          name: 'admin-products',
          redirect: '/admin/dashboard/products/kelola',
        },
        {
          path: 'products/kelola',
          name: 'admin-products-kelola',
          component: () => import('@/views/admin/dashboard/Product/KelolaProduct.vue'),
        },
        {
          path: 'products/detail',
          name: 'admin-products-detail',
          component: () => import('@/views/admin/dashboard/Product/DetailProduct.vue'),
        },
        {
          path: 'sales',
          name: 'admin-sales',
          component: () => import('@/views/admin/dashboard/Penjualan/Penjualan.vue'),
        },
      ],
      beforeEnter: (to, from, next) => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true'
        if (!isAuthenticated) {
          next('/admin/login')
        } else {
          next()
        }
      },
    },
  ],
})

export default router
