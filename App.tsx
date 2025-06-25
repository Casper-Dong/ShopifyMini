import {usePopularProducts, ProductCard} from '@shopify/shop-minis-react'
import {useMemo} from 'react'

// Mock function to get vendor from product (since SDK type is unknown)
function getVendor(product: any) {
  // Try to use product.vendor if it exists, otherwise mock with a fallback
  return product.vendor || 'Mock Vendor ' + (product.id % 3 + 1)
}

interface VendorStat {
  vendor: string
  count: number
  topPercent: number
}

export function App() {
  const {products} = usePopularProducts()

  // Group products by vendor and assign a random top % buyer value
  const vendorStats: VendorStat[] = useMemo(() => {
    if (!Array.isArray(products)) return []
    const vendorMap: Record<string, number> = {}
    products.forEach((product: any) => {
      const vendor = getVendor(product)
      if (!vendorMap[vendor]) vendorMap[vendor] = 0
      vendorMap[vendor]++
    })
    // Convert to array and assign random top %
    return Object.entries(vendorMap).map(([vendor, count]) => ({
      vendor,
      count: count as number,
      topPercent: Math.floor(Math.random() * 100) + 1 // 1-100%
    }))
  }, [products])

  return (
    <div className="pt-12 px-4 pb-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Welcome to Shop Minis!
      </h1>
      <p className="text-xs text-blue-600 mb-4 text-center bg-blue-50 py-2 px-4 rounded border border-blue-200">
        🛠️ Edit <b>src/App.tsx</b> to change this screen and come back to see
        your edits!
      </p>
      <p className="text-base text-gray-600 mb-6 text-center">
        These are the popular products today
      </p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {products?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <h2 className="text-lg font-semibold mb-2 text-center">Frequently Bought Vendors</h2>
      <div className="flex flex-col gap-3">
        {vendorStats.map((vendor) => (
          <div key={vendor.vendor} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
            <span className="font-medium text-gray-800">{vendor.vendor}</span>
            <span className="text-xs text-gray-500 mb-1">Products bought: {vendor.count}</span>
            <span className="text-green-600 font-bold text-sm">Top {vendor.topPercent}% buyer</span>
          </div>
        ))}
      </div>
    </div>
  )
}
