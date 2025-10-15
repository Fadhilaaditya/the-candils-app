// Product detail interfaces and mock data

export interface ProductDetail {
  id: number
  productType: string
  description: string
  image: string
  createdAt: string
  updatedAt: string
  overallRating: number
  totalReviews: number
  totalSold: number
  isBestSeller: boolean
  ratingDistribution: RatingDistribution
  reviews: ProductReview[]
}

export interface RatingDistribution {
  fiveStars: number
  fourStars: number
  threeStars: number
  twoStars: number
  oneStar: number
}

export interface ProductReview {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  verified: boolean
}

export interface ReviewFilters {
  rating?: number
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'
  search?: string
}

// Mock data for product details
export const mockProductDetails: ProductDetail[] = [
  {
    id: 1,
    productType: 'Candil 3 Rasa',
    description: 'Tiga rasa dalam satu mangkuk: bubur sumsum lembut, candil kenyal, dan topping manis yang menggugah selera.',
    image: '/src/assets/product1.jpg',
    createdAt: '2025-07-22T14:56:20',
    updatedAt: '2025-07-22T14:56:20',
    overallRating: 4.7,
    totalReviews: 100,
    totalSold: 150,
    isBestSeller: true,
    ratingDistribution: {
      fiveStars: 75,
      fourStars: 63,
      threeStars: 11,
      twoStars: 0,
      oneStar: 0
    },
    reviews: [
      {
        id: 1,
        userId: 1,
        userName: 'User A',
        userAvatar: '/src/assets/avatar1.jpg',
        rating: 5,
        comment: 'Rasanya sangat enak dan teksturnya lembut. Candilnya kenyal dan bubur sumsumnya harum. Sangat recommended!',
        createdAt: '2025-01-09T10:30:00',
        helpful: 12,
        verified: true
      },
      {
        id: 2,
        userId: 2,
        userName: 'User B',
        userAvatar: '/src/assets/avatar2.jpg',
        rating: 4,
        comment: 'Enak banget, tapi agak manis. Kalau bisa dikurangi gulanya akan lebih perfect. Overall tetap recommended.',
        createdAt: '2025-01-08T15:45:00',
        helpful: 8,
        verified: true
      },
      {
        id: 3,
        userId: 3,
        userName: 'User C',
        userAvatar: '/src/assets/avatar3.jpg',
        rating: 5,
        comment: 'Sempurna! Tekstur candil yang kenyal dan bubur sumsum yang lembut sangat cocok. Akan pesan lagi.',
        createdAt: '2025-01-07T09:20:00',
        helpful: 15,
        verified: false
      },
      {
        id: 4,
        userId: 4,
        userName: 'User D',
        userAvatar: '/src/assets/avatar4.jpg',
        rating: 3,
        comment: 'Rasanya biasa saja, tidak ada yang istimewa. Mungkin ekspektasi terlalu tinggi.',
        createdAt: '2025-01-06T14:15:00',
        helpful: 3,
        verified: true
      },
      {
        id: 5,
        userId: 5,
        userName: 'User E',
        userAvatar: '/src/assets/avatar5.jpg',
        rating: 5,
        comment: 'Best seller memang pantas! Rasanya autentik dan mengingatkan pada masa kecil. Highly recommended!',
        createdAt: '2025-01-05T11:30:00',
        helpful: 20,
        verified: true
      },
      {
        id: 6,
        userId: 6,
        userName: 'User F',
        userAvatar: '/src/assets/avatar6.jpg',
        rating: 4,
        comment: 'Enak dan mengenyangkan. Porsinya pas untuk satu orang. Akan coba varian lain juga.',
        createdAt: '2025-01-04T16:45:00',
        helpful: 7,
        verified: false
      },
      {
        id: 7,
        userId: 7,
        userName: 'User G',
        userAvatar: '/src/assets/avatar7.jpg',
        rating: 5,
        comment: 'Sangat memuaskan! Tekstur yang sempurna dan rasa yang tidak terlalu manis. Perfect!',
        createdAt: '2025-01-03T13:20:00',
        helpful: 11,
        verified: true
      },
      {
        id: 8,
        userId: 8,
        userName: 'User H',
        userAvatar: '/src/assets/avatar8.jpg',
        rating: 4,
        comment: 'Bagus untuk dessert setelah makan. Tidak terlalu berat dan rasanya enak.',
        createdAt: '2025-01-02T10:15:00',
        helpful: 5,
        verified: true
      },
      {
        id: 9,
        userId: 9,
        userName: 'User I',
        userAvatar: '/src/assets/avatar9.jpg',
        rating: 5,
        comment: 'Worth it banget! Harga terjangkau dengan kualitas yang sangat baik. Akan jadi langganan.',
        createdAt: '2025-01-01T08:30:00',
        helpful: 18,
        verified: true
      }
    ]
  }
]

// Product detail service
export class ProductDetailService {
  // Fetch product detail by ID
  static async fetchProductDetail(id: number): Promise<ProductDetail | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const product = mockProductDetails.find((p) => p.id === id)
    return product || null
  }

  // Fetch product reviews with filters
  static async fetchProductReviews(
    productId: number, 
    filters: ReviewFilters = {}
  ): Promise<ProductReview[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const product = mockProductDetails.find((p) => p.id === productId)
    if (!product) return []

    let reviews = [...product.reviews]

    // Apply filters
    if (filters.rating) {
      reviews = reviews.filter(review => review.rating === filters.rating)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      reviews = reviews.filter(review => 
        review.comment.toLowerCase().includes(searchLower) ||
        review.userName.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'oldest':
          reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case 'highest':
          reviews.sort((a, b) => b.rating - a.rating)
          break
        case 'lowest':
          reviews.sort((a, b) => a.rating - b.rating)
          break
        case 'most_helpful':
          reviews.sort((a, b) => b.helpful - a.helpful)
          break
      }
    }

    return reviews
  }

  // Add new review
  static async addReview(productId: number, review: Omit<ProductReview, 'id' | 'createdAt' | 'helpful'>): Promise<ProductReview> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const product = mockProductDetails.find((p) => p.id === productId)
    if (!product) throw new Error('Product not found')

    const newReview: ProductReview = {
      ...review,
      id: Math.max(...product.reviews.map(r => r.id), 0) + 1,
      createdAt: new Date().toISOString(),
      helpful: 0
    }

    product.reviews.push(newReview)
    
    // Update overall rating and distribution
    this.updateProductRating(product)

    return newReview
  }

  // Update product rating based on reviews
  private static updateProductRating(product: ProductDetail): void {
    const reviews = product.reviews
    if (reviews.length === 0) return

    // Calculate overall rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    product.overallRating = Math.round((totalRating / reviews.length) * 10) / 10
    product.totalReviews = reviews.length

    // Update rating distribution
    product.ratingDistribution = {
      fiveStars: reviews.filter(r => r.rating === 5).length,
      fourStars: reviews.filter(r => r.rating === 4).length,
      threeStars: reviews.filter(r => r.rating === 3).length,
      twoStars: reviews.filter(r => r.rating === 2).length,
      oneStar: reviews.filter(r => r.rating === 1).length
    }
  }
}

// Utility functions
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) +
    ', ' +
    date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  )
}

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hari ini'
  if (diffInDays === 1) return 'Kemarin'
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu yang lalu`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} bulan yang lalu`
  return `${Math.floor(diffInDays / 365)} tahun yang lalu`
}
