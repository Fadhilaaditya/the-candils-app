# Penjualan (Sales) Module Architecture

## Overview

The Penjualan module has been built with a component-based architecture for optimal performance and API integration. Each component manages its own data and can be optimized independently for different API endpoints. The system provides comprehensive sales reporting, data visualization, and product management capabilities.

## Component Structure

### 1. **SalesTable** (`_components/SalesTable.vue`)

- **Purpose**: Displays sales data in a comprehensive table with filtering and pagination
- **Props**: `initialData` (SalesData array)
- **Events**:
  - `addReport` - Triggers add report modal
  - `editSale` - Triggers edit sale modal with sale data
  - `deleteSale` - Triggers delete confirmation modal
  - `exportPDF` - Triggers PDF export with current filters
- **Features**:
  - **Advanced Filtering**: Date range and location filtering
  - **Pagination**: Configurable items per page with navigation
  - **Action Buttons**: Edit, delete, and export functionality
  - **Responsive Design**: Adapts to different screen sizes
  - **Real-time Updates**: Automatically reflects data changes from parent
  - **Export Functionality**: PDF export with current filters
  - **Search & Sort**: Built-in search and sorting capabilities

### 2. **RevenueChart** (`_components/RevenueChart.vue`) - **Chart.js Powered**

- **Purpose**: Revenue visualization by location using professional bar charts
- **Props**: `initialData` (RevenueData array)
- **Features**:
  - **Chart.js Integration**: Professional bar chart visualization
  - **Dynamic Data**: Real-time chart updates
  - **Responsive Design**: Chart adapts to container size
  - **Custom Styling**: Uses brand color (#BAB772)
  - **Interactive Tooltips**: Hover information with formatted currency
  - **Grid Lines**: Clean, professional appearance
  - **Exposed Methods**: `updateChartData()`, `refreshChart()`

### 3. **ProductsSoldChart** (`_components/ProductsSoldChart.vue`) - **Chart.js Powered**

- **Purpose**: Products sold visualization by product code
- **Props**: `initialData` (ProductSoldData array)
- **Features**:
  - **Chart.js Integration**: Professional bar chart visualization
  - **Product Analytics**: Shows sales performance by product
  - **Dynamic Updates**: Real-time chart refresh
  - **Responsive Design**: Adapts to container size
  - **Interactive Elements**: Hover tooltips and animations
  - **Exposed Methods**: `updateChartData()`, `refreshChart()`

### 4. **AddReportModal** (`_components/AddReportModal.vue`)

- **Purpose**: Modal for adding new sales reports
- **Props**:
  - `isVisible` (boolean)
  - `existingSalesData` (SalesData array for product dropdown)
- **Events**:
  - `close` - Closes modal and resets form
  - `submit` - Submits form data to parent
- **Features**:
  - **Smart Product Selection**: Dropdown populated from existing sales data
  - **Auto-price Population**: Automatically fills price when product is selected
  - **Total Calculation**: Real-time total price calculation (quantity × price)
  - **Form Validation**: Required field validation
  - **Image Preview**: Product image display
  - **Responsive Layout**: Two-column grid design

### 5. **EditReportModal** (`_components/EditReportModal.vue`)

- **Purpose**: Modal for editing existing sales reports
- **Props**:
  - `isVisible` (boolean)
  - `saleData` (SalesData to edit)
  - `existingSalesData` (SalesData array for product dropdown)
- **Events**:
  - `close` - Closes modal and resets form
  - `submit` - Submits updated data with ID
- **Features**:
  - **Pre-filled Data**: Automatically populates with existing sale data
  - **Smart Updates**: Only updates changed fields
  - **Image Handling**: Shows current image, allows replacement
  - **Total Calculation**: Real-time total price updates
  - **Form Validation**: Ensures data integrity

### 6. **DeleteConfirmModal** (`_components/DeleteConfirmModal.vue`)

- **Purpose**: Confirmation modal for deleting sales records
- **Props**:
  - `isVisible` (boolean)
  - `saleData` (SalesData to delete)
- **Events**:
  - `close` - Closes modal
  - `confirm` - Confirms deletion
- **Features**:
  - **Warning Display**: Clear warning about irreversible action
  - **Sale Preview**: Shows sale details before deletion
  - **Confirmation Buttons**: Cancel and confirm actions
  - **Professional Design**: Consistent with other modals

## Data Structure

### **SalesData Interface**

```typescript
interface SalesData {
  id: number
  productName: string
  quantity: number
  price: number
  location: string
  date: string
}
```

### **RevenueData Interface**

```typescript
interface RevenueData {
  location: string
  revenue: number
  period: string
}
```

### **ProductSoldData Interface**

```typescript
interface ProductSoldData {
  productCode: string
  productName: string
  quantitySold: number
  period: string
}
```

### **SalesFilters Interface**

```typescript
interface SalesFilters {
  dateFrom?: string
  dateTo?: string
  location?: string
  productName?: string
}
```

### **FormData Interface**

```typescript
interface FormData {
  productName: string
  quantity: number
  location: string
  date: string
  price: number
}
```

## API Integration

### **SalesDataService Class**

The service class provides comprehensive methods for API integration:

```typescript
// Core CRUD Operations
static async fetchSalesData(filters?: SalesFilters): Promise<SalesData[]>
static async addSalesRecord(sale: Omit<SalesData, 'id'>): Promise<SalesData>
static async updateSalesRecord(id: number, updates: Partial<SalesData>): Promise<SalesData>
static async deleteSalesRecord(id: number): Promise<boolean>

// Data Visualization
static async fetchRevenueData(): Promise<RevenueData[]>
static async fetchProductsSoldData(): Promise<ProductSoldData[]>

// Export & Utilities
static async exportToPDF(filters?: SalesFilters): Promise<string>
static async searchSales(query: string): Promise<SalesData[]>
static async getSalesSummary(): Promise<{totalRevenue: number, totalSales: number, averageOrderValue: number}>
```

### **API Endpoints to Implement**

```typescript
// Sales Management
GET    /api/sales?filters={dateFrom,dateTo,location,productName}
POST   /api/sales
PUT    /api/sales/{id}
DELETE /api/sales/{id}

// Revenue Analytics
GET    /api/sales/revenue?period={daily,weekly,monthly}
GET    /api/sales/products-sold?period={daily,weekly,monthly}

// Export & Reports
GET    /api/sales/export/pdf?filters={dateFrom,dateTo,location}
GET    /api/sales/summary

// Search & Filtering
GET    /api/sales/search?q={query}
GET    /api/sales/filters/options
```

## Workflow Patterns

### **1. Add New Sales Report**

```typescript
// User clicks "Tambah Laporan" button
const handleAddReport = () => {
  isModalVisible.value = true
}

// User fills form and submits
const handleModalSubmit = async (formData: FormData) => {
  try {
    // Create via service
    const newSale = await SalesDataService.addSalesRecord(formData)

    // Update local state
    salesData.value.unshift(newSale)

    // Refresh charts
    await refreshCharts()

    alert('Laporan berhasil ditambahkan!')
  } catch (error) {
    alert('Gagal menambahkan laporan.')
  }
}
```

### **2. Edit Existing Sales Report**

```typescript
// User clicks edit button
const handleEditSale = (sale: SalesData) => {
  productToEdit.value = sale
  isEditModalVisible.value = true
}

// User submits changes
const handleEditModalSubmit = async (formData: FormData & { id: number }) => {
  try {
    // Update via service
    const updatedSale = await SalesDataService.updateSalesRecord(formData.id, formData)

    // Update local state
    const index = salesData.value.findIndex((s) => s.id === formData.id)
    if (index !== -1) {
      salesData.value.splice(index, 1, updatedSale)
    }

    // Refresh charts
    await refreshCharts()

    alert('Laporan berhasil diupdate!')
  } catch (error) {
    alert('Gagal mengupdate laporan.')
  }
}
```

### **3. Delete Sales Report**

```typescript
// User clicks delete button
const handleDeleteSale = (sale: SalesData) => {
  saleToDelete.value = sale
  isDeleteModalVisible.value = true
}

// User confirms deletion
const handleDeleteConfirm = async (sale: SalesData) => {
  try {
    // Delete via service
    const success = await SalesDataService.deleteSalesRecord(sale.id)

    if (success) {
      // Remove from local state
      const index = salesData.value.findIndex((s) => s.id === sale.id)
      if (index !== -1) {
        salesData.value.splice(index, 1)
      }

      // Refresh charts
      await refreshCharts()

      alert('Data penjualan berhasil dihapus!')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menghapus data.')
  }
}
```

### **4. Data Refresh & Chart Updates**

```typescript
// Refresh all data
const refreshAll = async () => {
  await Promise.all([loadSalesData(), refreshCharts()])
}

// Refresh charts specifically
const refreshCharts = async () => {
  try {
    const [revenueResult, productsResult] = await Promise.all([
      SalesDataService.fetchRevenueData(),
      SalesDataService.fetchProductsSoldData(),
    ])

    revenueData.value = revenueResult
    productsSoldData.value = productsResult

    // Update chart components
    if (revenueChartRef.value) {
      revenueChartRef.value.updateChartData(revenueResult)
    }
    if (productsSoldChartRef.value) {
      productsSoldChartRef.value.updateChartData(productsResult)
    }
  } catch (error) {
    console.error('Error refreshing charts:', error)
  }
}
```

## Component Communication

### **Parent-Child Data Flow**

```typescript
// Parent passes data to child
<SalesTable
  :initial-data="salesData"
  @add-report="handleAddReport"
  @edit-sale="handleEditSale"
  @delete-sale="handleDeleteSale"
/>

// Child emits events to parent
const emit = defineEmits<{
  addReport: []
  editSale: [sale: SalesData]
  deleteSale: [sale: SalesData]
}>()
```

### **Direct Component Access**

```typescript
// Access component methods directly
const salesTableRef = ref<InstanceType<typeof SalesTable> | null>(null)
const revenueChartRef = ref<InstanceType<typeof RevenueChart> | null>(null)

// Update table data
salesTableRef.value?.updateSalesData(newData)

// Update chart data
revenueChartRef.value?.updateChartData(newData)
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component handles specific functionality
2. **Reusability**: Components can be used in other parts of the application
3. **Optimization**: Each component can be optimized independently
4. **API Integration**: Easy to connect different APIs for different data sources
5. **Maintainability**: Cleaner code structure and easier debugging
6. **Performance**: Parallel data loading and independent updates
7. **Professional Charts**: Chart.js provides industry-standard visualization
8. **Real-time Updates**: Automatic UI updates when data changes
9. **Form Validation**: Comprehensive input validation and error handling
10. **Responsive Design**: Works seamlessly across all device sizes

## Chart.js Integration

### **Dependencies**

The module uses:

- **Chart.js**: Core charting library
- **vue-chartjs**: Vue.js integration for Chart.js

Install with:

```bash
npm install chart.js vue-chartjs
```

### **Chart Features**

- **Bar Charts**: Revenue and products sold visualization
- **Interactive Tooltips**: Hover information with formatted data
- **Responsive Design**: Charts adapt to container size
- **Custom Styling**: Brand color integration (#BAB772)
- **Real-time Updates**: Dynamic chart refresh
- **Professional Appearance**: Grid lines and smooth animations

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live sales data
- **Advanced Filtering**: Date range picker, location multi-select
- **Data Export**: Excel, CSV export options
- **Bulk Operations**: Bulk edit, delete, and import
- **Sales Analytics**: Advanced metrics and KPIs
- **Mobile App**: Native mobile application
- **Offline Support**: PWA capabilities for offline data entry
- **Multi-language**: Internationalization support
- **Advanced Charts**: Line charts, pie charts, heatmaps
- **Report Scheduling**: Automated report generation and delivery
- **Integration**: ERP, accounting software integration
- **AI Insights**: Sales predictions and trend analysis

## Error Handling

### **Service Layer Errors**

```typescript
try {
  const result = await SalesDataService.addSalesRecord(data)
  // Handle success
} catch (error) {
  console.error('Service error:', error)
  // Show user-friendly error message
  alert('Gagal menambahkan laporan. Silakan coba lagi.')
}
```

### **Component Error Boundaries**

```typescript
// Graceful fallbacks for component errors
const handleError = (error: Error) => {
  console.error('Component error:', error)
  // Show error state or fallback UI
}
```

## Performance Optimization

### **Data Loading Strategies**

- **Lazy Loading**: Load data only when needed
- **Pagination**: Handle large datasets efficiently
- **Caching**: Implement data caching for better performance
- **Debouncing**: Optimize search and filter inputs

### **Chart Optimization**

- **Data Sampling**: Reduce data points for large datasets
- **Lazy Rendering**: Render charts only when visible
- **Memory Management**: Proper chart cleanup and disposal

This architecture provides a robust, scalable foundation for sales management with professional data visualization and seamless API integration capabilities.
