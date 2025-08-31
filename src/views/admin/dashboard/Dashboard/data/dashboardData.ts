// Dashboard Data Types and Interfaces
export interface LocationData {
  id: number
  name: string
  dailyRevenue: number
  productsSold: number
}

export interface SalesData {
  day: string
  sales: number
}

export interface ProductReview {
  id: number
  productName: string
  rating: number
  soldCount: string
}

export interface DateRange {
  from: string
  to: string
}

// Mock Data - Ready for API replacement
export const mockLocationData: LocationData[] = [
  {
    id: 1,
    name: 'Lokasi Ciputat',
    dailyRevenue: 450000,
    productsSold: 28
  },
  {
    id: 2,
    name: 'Lokasi Pamulang',
    dailyRevenue: 515000,
    productsSold: 32
  },
  {
    id: 3,
    name: 'Lokasi Bukit Indah',
    dailyRevenue: 320000,
    productsSold: 20
  }
]

export const mockSalesChartData: SalesData[] = [
  { day: 'Senin', sales: 120000 },
  { day: 'Selasa', sales: 180000 },
  { day: 'Rabu', sales: 220000 },
  { day: 'Kamis', sales: 280000 },
  { day: 'Jumat', sales: 350000 },
  { day: 'Sabtu', sales: 520000 },
  { day: 'Minggu', sales: 480000 }
]

export const mockProductReviews: ProductReview[] = [
  {
    id: 1,
    productName: 'Bubur Manis Komplit',
    rating: 4.7,
    soldCount: '100+'
  },
  {
    id: 2,
    productName: 'Singkong Thailand',
    rating: 4.7,
    soldCount: '100+'
  },
  {
    id: 3,
    productName: 'Ubi Duo Twin',
    rating: 4.7,
    soldCount: '100+'
  },
  {
    id: 4,
    productName: 'Hijau Hitam Legenda',
    rating: 4.7,
    soldCount: '100+'
  }
]

// API Service Functions - Ready for integration
export class DashboardDataService {
  // Location Performance API
  static async fetchLocationData(): Promise<LocationData[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/locations/performance')
      // return await response.json()

      // Mock API delay simulation
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockLocationData
    } catch (error) {
      console.error('Error fetching location data:', error)
      return mockLocationData // Fallback to mock data
    }
  }

  // Sales Chart API
  static async fetchSalesChartData(dateRange: DateRange): Promise<SalesData[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/sales/chart?from=${dateRange.from}&to=${dateRange.to}`)
      // return await response.json()

      // Mock API delay simulation
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockSalesChartData
    } catch (error) {
      console.error('Error fetching sales chart data:', error)
      return mockSalesChartData // Fallback to mock data
    }
  }

  // Product Reviews API
  static async fetchProductReviews(): Promise<ProductReview[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products/reviews')
      // return await response.json()

      // Mock API delay simulation
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockProductReviews
    } catch (error) {
      console.error('Error fetching product reviews:', error)
      return mockProductReviews // Fallback to mock data
    }
  }

  // Update Location Data
  static async updateLocationData(locationId: number, data: Partial<LocationData>): Promise<LocationData> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/locations/${locationId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      // return await response.json()

      // Mock API delay simulation
      await new Promise(resolve => setTimeout(resolve, 600))
      const updatedLocation = mockLocationData.find(loc => loc.id === locationId)
      if (updatedLocation) {
        Object.assign(updatedLocation, data)
        return updatedLocation
      }
      throw new Error('Location not found')
    } catch (error) {
      console.error('Error updating location data:', error)
      throw error
    }
  }

  // Get Dashboard Summary
  static async getDashboardSummary(): Promise<{
    totalRevenue: number
    totalProducts: number
    averageRating: number
  }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/dashboard/summary')
      // return await response.json()

      // Mock API delay simulation
      await new Promise(resolve => setTimeout(resolve, 200))

      const totalRevenue = mockLocationData.reduce((sum, loc) => sum + loc.dailyRevenue, 0)
      const totalProducts = mockLocationData.reduce((sum, loc) => sum + loc.productsSold, 0)
      const averageRating = mockProductReviews.reduce((sum, review) => sum + review.rating, 0) / mockProductReviews.length

      return {
        totalRevenue,
        totalProducts,
        averageRating: Math.round(averageRating * 10) / 10
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      return {
        totalRevenue: 0,
        totalProducts: 0,
        averageRating: 0
      }
    }
  }
}

// Utility Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const getDefaultDateRange = (): DateRange => {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    to: today.toISOString().split('T')[0],
    from: weekAgo.toISOString().split('T')[0]
  }
}
