import RestaurantMenu from '@/components/RestaurantMenu'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-6 shadow-lg">
            <span className="text-2xl text-white">🍽️</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Restaurant Menu Visualizer
          </h1>
          
          <p className="text-xl text-gray-600 font-medium mb-6 max-w-3xl mx-auto">
            Upload your restaurant menu and see beautiful pictures for each dish to help you make the perfect choice!
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto border border-orange-200 shadow-lg">
            <h2 className="text-lg font-semibold text-orange-700 mb-4">🍴 How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-orange-50 p-3 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">📋 Upload Menu</h3>
                <p className="text-xs">Upload your restaurant menu as text, PDF, or image</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">🖼️ AI Analysis</h3>
                <p className="text-xs">AI identifies dishes and finds matching food images</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">🍽️ Visual Menu</h3>
                <p className="text-xs">Browse your menu with beautiful dish pictures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Menu Interface */}
        <div className="max-w-6xl mx-auto">
          <RestaurantMenu />
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-orange-600">
            <span>🍽️</span>
            <span>Visual Restaurant Menu</span>
            <span>🍽️</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            AI-powered menu visualization • Beautiful dish images • Easy selection
          </p>
        </div>
      </div>
    </div>
  )
}