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

  // Generate random shapes for the 'Frequently Bought Vendors' section
  const vendorShapes = useMemo(() => {
    const colors = [
      'bg-yellow-300', 'bg-pink-400', 'bg-purple-400', 'bg-blue-300', 'bg-green-300', 'bg-orange-300',
      'bg-red-300', 'bg-cyan-300', 'bg-teal-400', 'bg-indigo-300', 'bg-fuchsia-300', 'bg-emerald-300',
    ]
    const shapes = []
    const shapeTypes = ['circle', 'square', 'triangle', 'squiggle']
    const count = Math.floor(Math.random() * 5) + 10 // 10-14 shapes (more shapes)
    for (let i = 0; i < count; i++) {
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
      const size = Math.floor(Math.random() * 80) + 60 // 60-140px (larger shapes)
      const top = Math.floor(Math.random() * 80) // 0-80%
      const left = Math.floor(Math.random() * 80) // 0-80%
      const color = colors[Math.floor(Math.random() * colors.length)]
      const rotate = Math.floor(Math.random() * 360)
      const opacity = (Math.random() * 0.2 + 0.25).toFixed(2) // 0.25-0.45
      if (type === 'circle') {
        shapes.push(
          <div
            key={`circle-${i}`}
            className={`absolute z-0 ${color}`}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              transform: `rotate(${rotate}deg)`
            }}
          />
        )
      } else if (type === 'square') {
        shapes.push(
          <div
            key={`square-${i}`}
            className={`absolute z-0 ${color}`}
            style={{
              width: size,
              height: size,
              borderRadius: '0.25rem',
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              transform: `rotate(${rotate}deg)`
            }}
          />
        )
      } else if (type === 'triangle') {
        shapes.push(
          <svg
            key={`triangle-${i}`}
            className="absolute z-0"
            width={size}
            height={size}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              transform: `rotate(${rotate}deg)`
            }}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points={`${size/2},0 ${size},${size} 0,${size}`} className={color} />
          </svg>
        )
      } else if (type === 'squiggle') {
        shapes.push(
          <svg
            key={`squiggle-${i}`}
            className="absolute z-0"
            width={size}
            height={size/2}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              transform: `rotate(${rotate}deg)`
            }}
            viewBox={`0 0 ${size} ${size/2}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={`M0,${size/4} Q${size/4},0 ${size/2},${size/4} T${size},${size/4}`}
              stroke="currentColor"
              strokeWidth={6}
              className={color}
              fill="none"
            />
          </svg>
        )
      }
    }
    return shapes
  }, [])

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
    <div className="min-h-screen w-full pt-12 px-4 pb-6 relative overflow-hidden bg-gradient-to-br from-green-400 via-teal-400 to-blue-500">
      {/* Frequently Bought Vendors & Shopping Summary at the top */}
      <div className="max-w-xl mx-auto w-full">
        {/* Frequently Bought Vendors section with shapes */}
        <h2 className="text-lg font-semibold mb-2 text-center">Frequently Bought Vendors</h2>
        <div className="relative min-h-[220px] mb-6">
          {vendorShapes}
          <div className="relative z-10 flex flex-col gap-3">
            {vendorStats.map((vendor) => (
              <div key={vendor.vendor} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                <span className="font-medium text-gray-800">{vendor.vendor}</span>
                <span className="text-xs text-gray-500 mb-1">Products bought: {vendor.count}</span>
                <span className="text-green-600 font-bold text-sm">Top {vendor.topPercent}% buyer</span>
              </div>
            ))}
          </div>
        </div>
        {/* Shopping Discount Summary section */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
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
      </div>
      {/* Main app content overlays the gradient background */}
      <div className="relative z-10">
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
      </div>
    </div>
  )
}
