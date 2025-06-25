import {usePopularProducts, ProductCard, useOrders} from '@shopify/shop-minis-react'
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
  const {orders, loading: ordersLoading, error: ordersError} = useOrders()

  // --- Calculate purchase and discount summary from real orders ---
  const purchaseSummary = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalBought: 0,
        totalSaved: 0,
        products: []
      }
    }
    let totalBought = 0
    let totalSaved = 0
    const discountedProducts: {
      name: string
      originalPrice: number
      discountedPrice: number
      saved: number
    }[] = []
    orders.forEach(order => {
      order.lineItems.forEach(item => {
        const product = item.product
        if (!product) return
        const quantity = item.quantity || 1
        const price = Number(product.price?.amount || 0)
        const compareAt = Number(product.compareAtPrice?.amount || price)
        totalBought += quantity
        if (compareAt > price) {
          const saved = (compareAt - price) * quantity
          totalSaved += saved
          discountedProducts.push({
            name: product.title,
            originalPrice: compareAt,
            discountedPrice: price,
            saved: +(saved.toFixed(2))
          })
        }
      })
    })
    return {
      totalBought,
      totalSaved: +(totalSaved.toFixed(2)),
      products: discountedProducts
    }
  }, [orders])

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
      {/* --- Purchase & Discount Summary Section --- */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-green-700 mb-1">Your Shopping Summary</h2>
        {ordersLoading ? (
          <span className="text-gray-500 text-sm">Loading...</span>
        ) : ordersError ? (
          <span className="text-red-500 text-sm">Failed to load orders</span>
        ) : (
          <>
            <div className="flex flex-row gap-6 mb-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-800">{purchaseSummary.totalBought}</span>
                <span className="text-xs text-gray-500">Products Bought</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-800">${purchaseSummary.totalSaved.toFixed(2)}</span>
                <span className="text-xs text-gray-500">Saved with Discounts</span>
              </div>
            </div>
            <div className="w-full">
              <h3 className="text-sm font-medium text-green-600 mb-2">Discounted Products</h3>
              {purchaseSummary.products.length === 0 ? (
                <span className="text-xs text-gray-400">No discounted products found in your orders.</span>
              ) : (
                <ul className="flex flex-col gap-2">
                  {purchaseSummary.products.map((p) => (
                    <li key={p.name + p.originalPrice + p.discountedPrice} className="flex flex-row justify-between items-center bg-white rounded shadow-sm px-3 py-2 border border-gray-100">
                      <span className="text-gray-700 text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-gray-400 line-through mr-2">${p.originalPrice.toFixed(2)}</span>
                      <span className="text-green-700 font-semibold text-sm">${p.discountedPrice.toFixed(2)}</span>
                      <span className="ml-2 text-green-500 text-xs font-bold">- ${p.saved}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
      {/* --- End Purchase & Discount Summary Section --- */}
    </div>
  )
}
