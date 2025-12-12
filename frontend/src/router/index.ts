import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { defineComponent } from 'vue';
import { getProducts } from '@/services/productService';
import HomeView from '@/views/user/Home/HomeView.vue'
import AboutUs from '@/views/user/AboutUs/AboutUs.vue'
import Product from '@/views/user/Product/ProductView.vue'
import Location from '@/views/user/Locations/LocationView.vue'

// Impor Halaman Cart & Checkout
import CartView from '@/views/user/Product/Cart/Cart.vue';

import AdminLogin from '@/views/admin/auth/Login.vue'
import AdminDashboard from '@/views/admin/dashboard/Dashboard/MainDashboard.vue'

// Definisikan rute anak (children) secara terpisah
const adminChildrenRoutes: RouteRecordRaw[] = [
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
    path: 'sales',
    name: 'admin-sales',
    component: () => import('@/views/admin/dashboard/Penjualan/PenjualanProduct.vue'),
  },
  {
    path: 'products/review',
    name: 'admin-review',
    component: () => import('@/views/admin/dashboard/Review/ReviewProduct.vue'),
  },
  {
    path: 'orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/dashboard/Pesanan/KelolaPesanan.vue'),
  },
];

const superAdminChildrenRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'superadmin-dashboard-main',
    component: () => import('@/views/superadmin/Dashboard/Dashboard/MainDashboard.vue'),
  },
  {
    path: 'products',
    name: 'superadmin-products',
    redirect: '/superadmin/dashboard/products/kelola',
  },
  {
    path: 'products/kelola',
    name: 'superadmin-products-kelola',
    component: () => import('@/views/superadmin/Dashboard/Product/KelolaProduct.vue'),
  },
  {
    path: 'sales',
    name: 'superadmin-sales',
    component: () => import('@/views/superadmin/Dashboard/Penjualan/PenjualanProduct.vue'),
  },
  {
    path: 'products/review',
    name: 'superadmin-review',
    component: () => import('@/views/superadmin/Dashboard/Review/ReviewProduct.vue'),
  },
  {
    path: 'orders',
    name: 'superadmin-orders',
    component: () => import('@/views/superadmin/Dashboard/Pesanan/KelolaPesanan.vue'),
  },
  {
    path: 'accounts',
    name: 'superadmin-accounts',
    component: () => import('@/views/superadmin/Account/KelolaAccount.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Selalu scroll ke paling atas setiap kali navigasi
    return { top: 0 }
  },
  routes: [
    // Rute Publik
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
      path: '/products/:id(\\d+)',
      name: 'product-detail-user',
      component: () => import('@/views/user/Product/[slug]/DetailProduct.vue'),
      props: true,
    },
    {
      path: '/locations',
      name: 'locations',
      component: Location,
    },

    // Rute Cart
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },

    // ✅ [BARU] Rute Checkout
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/user/Product/Checkout/CheckOut.vue'),
      beforeEnter: (to, from, next) => {
        // Optional: Cek apakah cart kosong
        const cartSessionId = localStorage.getItem('cartSessionId');
        if (!cartSessionId) {
          // Jika belum ada cart session, redirect ke products
          alert('Keranjang Anda kosong. Silakan pilih produk terlebih dahulu.');
          next({ name: 'products' });
        } else {
          next();
        }
      },
    },
    // ---------------------------------

    // Rute Admin
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLogin,
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          next({ name: 'admin-dashboard-main' });
        } else {
          next();
        }
      },
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/dashboard/App.vue'),
      children: adminChildrenRoutes,
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          next({ name: 'admin-login' });
        } else {
          next();
        }
      },
    },
    {
      path: '/superadmin',
      redirect: '/superadmin/dashboard',
    },
    {
      path: '/superadmin/dashboard',
      name: 'superadmin-dashboard',
      component: () => import('@/views/superadmin/Dashboard/App.vue'),
      children: superAdminChildrenRoutes,
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          next({ name: 'admin-login' });
        } else {
          next();
        }
      },
    },
  ],
})

export default router