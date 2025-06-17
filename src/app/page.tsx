import NapoleonChatBot from '@/components/NapoleonChatBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">👑</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Chat met Napoleon Bonaparte
          </h1>
          
          <p className="text-xl text-blue-200 font-medium mb-6 max-w-2xl mx-auto">
            Praat direct met de Franse keizer! Stel vragen over zijn leven, veldslagen, politiek en de tijd waarin hij leefde (1769-1821).
          </p>

          <div className="bg-blue-800/50 backdrop-blur-sm rounded-lg p-4 max-w-3xl mx-auto border border-blue-600">
            <h2 className="text-lg font-semibold text-yellow-300 mb-3">📚 Voor HAVO 5 Geschiedenis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
              <div>
                <h3 className="font-medium text-yellow-200 mb-2">🎯 Onderwerpen om te bespreken:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Franse Revolutie en opkomst</li>
                  <li>• Napoleontische oorlogen</li>
                  <li>• Code Napoleon (wetgeving)</li>
                  <li>• Continentaal Stelsel</li>
                  <li>• Slag bij Waterloo</li>
                  <li>• Ballingschap op Elba en Sint-Helena</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-yellow-200 mb-2">💡 Voorbeeldvragen:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• "Hoe werd je keizer van Frankrijk?"</li>
                  <li>• "Waarom viel je Rusland binnen?"</li>
                  <li>• "Wat was je grootste overwinning?"</li>
                  <li>• "Hoe zag je dagelijks leven eruit?"</li>
                  <li>• "Wat vind je van de moderne tijd?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <NapoleonChatBot />
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-blue-300">
            <span>⚔️</span>
            <span>Vive l'Empereur!</span>
            <span>⚔️</span>
          </div>
          <p className="text-blue-400 text-sm mt-2">
            Educatieve Napoleon AI • HAVO 5 Geschiedenis • Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  )
}