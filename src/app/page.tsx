export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Stage Assessment App
          </h1>
          <p className="text-xl text-gray-600">
            Welkom bij de stage beoordeling applicatie!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            ✅ Applicatie werkt!
          </h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🚀 Status: Actief
              </h3>
              <p className="text-green-700">
                De applicatie is succesvol opgestart en draait correct.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                📋 Volgende stappen:
              </h3>
              <ul className="text-blue-700 space-y-2">
                <li>• ✅ Next.js setup compleet</li>
                <li>• ✅ Tailwind CSS werkend</li>
                <li>• ✅ TypeScript geconfigureerd</li>
                <li>• 🔄 Klaar voor verdere ontwikkeling</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                💡 Test functionaliteit:
              </h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Klik mij om te testen!
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500">
            🎓 Stage Assessment System - Ready to go!
          </p>
        </div>
      </div>
    </div>
  )
}