# Dashboard Component Architecture

## Overview

The dashboard has been refactored to use a component-based architecture for better optimization and API integration. Each component is responsible for its own data management and can be optimized independently.

## Component Structure

### 1. **LocationCard** (`_components/LocationCard.vue`)

- **Purpose**: Displays individual location performance data
- **Props**: `location` (LocationData interface)
- **Features**:
  - Revenue and products sold display
  - Currency formatting
  - Responsive design

### 2. **GrafikCard** (`_components/GrafikCard.vue`) - **Now with Chart.js!**

- **Purpose**: Sales chart with date range selection using Chart.js
- **Props**: `initialData` (SalesData array)
- **Events**: `dateChange` (emits DateRange)
- **Features**:
  - **Chart.js Integration**: Professional bar chart visualization
  - Interactive date pickers
  - **Dynamic Chart Rendering**: Real-time chart updates
  - **Responsive Design**: Chart adapts to container size
  - **Custom Styling**: Uses your brand color (#BAB772)
  - **Tooltips**: Hover information with formatted currency
  - **Grid Lines**: Clean, professional appearance
  - Exposed methods for data updates

### 3. **UlasanCard** (`_components/UlasanCard.vue`)

- **Purpose**: Product reviews display
- **Props**: `initialData` (ProductReview array)
- **Events**: `detailsClick` (emits ProductReview)
- **Features**:
  - Star rating system
  - Product details
  - Sold count display
  - Exposed methods for data updates

## Chart.js Features

### **Chart Configuration**

- **Type**: Bar chart with rounded corners
- **Colors**: Brand color (#BAB772) with hover effects
- **Responsiveness**: Automatically adapts to container size
- **Interactions**: Hover tooltips with formatted currency
- **Grid**: Clean grid lines for better readability

### **Chart Methods**

```typescript
// Update chart data
updateChartData(data: SalesData[])

// Refresh chart display
refreshChart()

// Get current date range
getDateRange()
```

### **Chart Styling**

- **Background**: Light gray (#f9fafb) with padding
- **Bars**: Rounded corners with brand colors
- **Hover Effects**: Smooth color transitions
- **Typography**: Consistent with dashboard design

## Data Structure

### **LocationData Interface**

```typescript
interface LocationData {
  id: number
  name: string
  dailyRevenue: number
  productsSold: number
}
```

### **SalesData Interface**

```typescript
interface SalesData {
  day: string
  sales: number
}
```

### **ProductReview Interface**

```typescript
interface ProductReview {
  id: number
  productName: string
  rating: number
  soldCount: string
}
```

### **DateRange Interface**

```typescript
interface DateRange {
  from: string
  to: string
}
```

## API Integration

### **DashboardDataService Class**

The service class provides methods for API integration:

```typescript
// Fetch location performance data
static async fetchLocationData(): Promise<LocationData[]>

// Fetch sales chart data with date range
static async fetchSalesChartData(dateRange: DateRange): Promise<SalesData[]>

// Fetch product reviews
static async fetchProductReviews(): Promise<ProductReview[]>

// Update location data
static async updateLocationData(locationId: number, data: Partial<LocationData>): Promise<LocationData>

// Get dashboard summary
static async getDashboardSummary(): Promise<{totalRevenue: number, totalProducts: number, averageRating: number}>
```

### **API Endpoints to Implement**

```typescript
// Replace these in DashboardDataService
GET /api/locations/performance
GET /api/sales/chart?from={date}&to={date}
GET /api/products/reviews
PUT /api/locations/{id}
GET /api/dashboard/summary
```

## Usage Examples

### **Loading Data**

```typescript
// Load all dashboard data
await loadDashboardData()

// Refresh specific sections
await refreshLocationData()
await refreshSalesData()
await refreshReviewsData()
```

### **Component Communication**

```typescript
// Date change from GrafikCard
const handleDateChange = async (dateRange: DateRange) => {
  const newData = await DashboardDataService.fetchSalesChartData(dateRange)
  // Update chart data
}

// Details click from UlasanCard
const handleDetailsClick = (review: ProductReview) => {
  // Navigate to product details
  router.push(`/admin/dashboard/products/${review.id}`)
}
```

### **Direct Component Access**

```typescript
// Access component methods directly
const grafikCardRef = ref<InstanceType<typeof GrafikCard> | null>(null)

// Update chart data
grafikCardRef.value?.updateChartData(newData)

// Get current date range
const dateRange = grafikCardRef.value?.getDateRange()

// Refresh chart display
grafikCardRef.value?.refreshChart()
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component handles its own logic
2. **Reusability**: Components can be used in other parts of the application
3. **Optimization**: Each component can be optimized independently
4. **API Integration**: Easy to connect different APIs for different data sources
5. **Maintainability**: Cleaner code structure and easier debugging
6. **Performance**: Parallel data loading and independent updates
7. **Professional Charts**: Chart.js provides industry-standard charting capabilities

## Chart.js Dependencies

The dashboard now uses:

- **Chart.js**: Core charting library
- **vue-chartjs**: Vue.js integration for Chart.js

Install with:

```bash
npm install chart.js vue-chartjs
```

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Caching**: Implement data caching for better performance
- **Error Boundaries**: Better error handling and fallbacks
- **Loading States**: Individual loading states for each component
- **Pagination**: For large datasets in reviews
- **Filtering**: Advanced filtering and search capabilities
- **Chart Types**: Add line charts, pie charts, or area charts
- **Export**: Chart export functionality (PNG, PDF)
- **Animations**: Enhanced chart animations and transitions
