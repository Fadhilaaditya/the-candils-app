// Product data service and interfaces

export interface Product {
  id: number
  productType: string
  description: string
  image: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  productType: string
  description: string
  image: File | null
}

// Mock data for development
export const mockProducts: Product[] = [
  {
    id: 1,
    productType: 'Candil 3 Rasa',
    description:
      'Tiga rasa dalam satu mangkuk: bubur sumsum lembut, candil kenyal, dan topping manis yang menggugah selera.',
    image: '/src/assets/product1.jpg',
    createdAt: '2025-07-22T14:56:20',
    updatedAt: '2025-07-22T14:56:20',
  },
  {
    id: 2,
    productType: 'Sumsum Pandan Lembut',
    description:
      'Nikmati kelembutan ganda dari perpaduan bubur sumsum pandan yang harum dan tekstur yang lembut.',
    image: '/src/assets/product2.jpg',
    createdAt: '2025-07-22T14:56:20',
    updatedAt: '2025-07-22T14:56:20',
  },
  {
    id: 3,
    productType: 'Bubur Manis Komplit',
    description:
      'Perpaduan lengkap tujuh rasa: sumsum pandan & ori, candil, ubi, dan topping manis yang melengkapi.',
    image: '/src/assets/product3.jpg',
    createdAt: '2025-07-22T14:56:20',
    updatedAt: '2025-07-22T14:56:20',
  },
  {
    id: 4,
    productType: 'Ubi Duo Twin',
    description:
      'Rasakan kelembutan ganda dari bubur sumsum yang dipadukan dengan ubi ungu dan ubi jalar.',
    image: '/src/assets/product4.jpg',
    createdAt: '2025-07-22T14:56:20',
    updatedAt: '2025-07-22T14:56:20',
  },
]

// Product data service
export class ProductDataService {
  // Fetch all products
  static async fetchProducts(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProducts
  }

  // Fetch product by ID
  static async fetchProductById(id: number): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const product = mockProducts.find((p) => p.id === id)
    return product || null
  }

  // Add new product
  static async addProduct(productData: ProductFormData): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate unique ID
    const newId = Math.max(...mockProducts.map((p) => p.id), 0) + 1

    // Handle image - for API integration, this would be the uploaded image URL
    let imageUrl = '/src/assets/default-product.jpg'
    if (productData.image) {
      // In real API, this would be the response from image upload endpoint
      // For development, create a persistent mock URL
      const timestamp = Date.now()
      imageUrl = `/src/assets/products/product_${newId}_${timestamp}.jpg`

      // Alternative: Generate a mock URL for API testing
      // imageUrl = `https://api.example.com/uploads/products/${newId}_${timestamp}.jpg`
    }

    const newProduct: Product = {
      id: newId,
      productType: productData.productType,
      description: productData.description,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to mock data
    mockProducts.push(newProduct)

    console.log('Product added to service:', newProduct)
    console.log('Total products in service:', mockProducts.length)

    return newProduct
  }

  // Update product
  static async updateProduct(id: number, updates: Partial<ProductFormData>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockProducts.findIndex((product) => product.id === id)
    if (index === -1) {
      throw new Error('Product not found')
    }

    // Handle image update
    let imageUrl = mockProducts[index].image
    if (updates.image) {
      // In real API, this would be the response from image upload endpoint
      // For development, create a persistent mock URL
      const timestamp = Date.now()
      imageUrl = `/src/assets/products/product_${id}_${timestamp}.jpg`

      // Alternative: Generate a mock URL for API testing
      // imageUrl = `https://api.example.com/uploads/products/${id}_${timestamp}.jpg`
    }

    const updatedProduct: Product = {
      ...mockProducts[index],
      productType: updates.productType || mockProducts[index].productType,
      description: updates.description || mockProducts[index].description,
      image: imageUrl,
      updatedAt: new Date().toISOString(),
    }

    // Update mock data
    mockProducts[index] = updatedProduct

    console.log('Product updated in service:', updatedProduct)

    return updatedProduct
  }

  // Delete product
  static async deleteProduct(id: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockProducts.findIndex((product) => product.id === id)
    if (index === -1) {
      return false
    }

    mockProducts.splice(index, 1)
    return true
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const lowercaseQuery = query.toLowerCase()
    return mockProducts.filter(
      (product) =>
        product.productType.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
    )
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

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
