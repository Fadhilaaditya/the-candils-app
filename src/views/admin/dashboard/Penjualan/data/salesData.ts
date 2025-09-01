export interface SalesData {
  id: number
  productName: string
  quantity: number
  price: number
  location: string
  date: string
}

export interface RevenueData {
  location: string
  revenue: number
}

export interface ProductSoldData {
  productCode: string
  productName: string
  quantity: number
}

export interface SalesFilters {
  dateFrom: string
  dateTo: string
  location: string
}

// Mock data for sales table
export const mockSalesData: SalesData[] = [
  {
    id: 1,
    productName: 'Bubur Manis Komplit',
    quantity: 2,
    price: 34000,
    location: 'Ciputat',
    date: '2025-07-26',
  },
  {
    id: 2,
    productName: 'Singkong Thailand',
    quantity: 1,
    price: 17000,
    location: 'Pamulang',
    date: '2025-07-26',
  },
  {
    id: 3,
    productName: 'Ubi Duo Twin',
    quantity: 3,
    price: 51000,
    location: 'Ciputat',
    date: '2025-07-26',
  },
  {
    id: 4,
    productName: 'Hijau Hitam Legenda',
    quantity: 5,
    price: 75000,
    location: 'Bukit Indah',
    date: '2025-07-25',
  },
  {
    id: 5,
    productName: 'Bubur Manis Komplit',
    quantity: 1,
    price: 17000,
    location: 'Pamulang',
    date: '2025-07-25',
  },
  {
    id: 6,
    productName: 'Singkong Premium Legenda',
    quantity: 2,
    price: 45000,
    location: 'Ciputat',
    date: '2025-07-25',
  },
  {
    id: 7,
    productName: 'Mie Sapi Mantap',
    quantity: 3,
    price: 38000,
    location: 'Bukit Indah',
    date: '2025-07-24',
  },
  {
    id: 8,
    productName: 'Ubi Duo Twin Special',
    quantity: 1,
    price: 25000,
    location: 'Pamulang',
    date: '2025-07-24',
  },
]

// Mock data for revenue chart
export const mockRevenueData: RevenueData[] = [
  { location: 'Ciputat', revenue: 640000 },
  { location: 'Pamulang', revenue: 520000 },
  { location: 'Bukit Indah', revenue: 380000 },
]

// Mock data for products sold chart
export const mockProductsSoldData: ProductSoldData[] = [
  { productCode: 'BMK', productName: 'Bubur Manis Komplit', quantity: 24 },
  { productCode: 'ST', productName: 'Singkong Thailand', quantity: 21 },
  { productCode: 'UDT', productName: 'Ubi Duo Twin', quantity: 16 },
  { productCode: 'HHL', productName: 'Hijau Hitam Legenda', quantity: 24 },
  { productCode: 'SPL', productName: 'Singkong Premium Legenda', quantity: 21 },
  { productCode: 'UDT2', productName: 'Ubi Duo Twin Special', quantity: 16 },
  { productCode: 'MSM', productName: 'Mie Sapi Mantap', quantity: 16 },
]

export class SalesDataService {
  // Fetch sales data with optional filters
  static async fetchSalesData(filters?: SalesFilters): Promise<SalesData[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!filters) {
      return mockSalesData
    }

    let filteredData = [...mockSalesData]

    if (filters.location) {
      filteredData = filteredData.filter((sale) => sale.location === filters.location)
    }

    if (filters.dateFrom) {
      filteredData = filteredData.filter(
        (sale) => new Date(sale.date) >= new Date(filters.dateFrom),
      )
    }

    if (filters.dateTo) {
      filteredData = filteredData.filter((sale) => new Date(sale.date) <= new Date(filters.dateTo))
    }

    return filteredData
  }

  // Fetch revenue data
  static async fetchRevenueData(): Promise<RevenueData[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockRevenueData
  }

  // Fetch products sold data
  static async fetchProductsSoldData(): Promise<ProductSoldData[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProductsSoldData
  }

  // Add new sales record
  static async addSalesRecord(sale: Omit<SalesData, 'id'>): Promise<SalesData> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const newSale: SalesData = {
      ...sale,
      id: Math.max(...mockSalesData.map((s) => s.id)) + 1,
    }

    mockSalesData.push(newSale)
    return newSale
  }

  // Update sales record
  static async updateSalesRecord(id: number, updates: Partial<SalesData>): Promise<SalesData> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockSalesData.findIndex((sale) => sale.id === id)
    if (index === -1) {
      throw new Error('Sales record not found')
    }

    mockSalesData[index] = { ...mockSalesData[index], ...updates }
    return mockSalesData[index]
  }

  // Delete sales record
  static async deleteSalesRecord(id: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockSalesData.findIndex((sale) => sale.id === id)
    if (index === -1) {
      return false
    }

    mockSalesData.splice(index, 1)
    return true
  }

  // Export sales data to PDF
  static async exportToPDF(filters?: SalesFilters): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Fetch filtered data for PDF generation (could be used for actual PDF creation)
    await this.fetchSalesData(filters)
    const timestamp = new Date().toISOString().split('T')[0]

    // Simulate PDF generation
    return `sales_report_${timestamp}.pdf`
  }
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const getDefaultDateRange = () => {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    dateFrom: weekAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  }
}
