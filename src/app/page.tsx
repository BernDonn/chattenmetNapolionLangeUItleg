import StageAssessmentApp from '@/components/StageAssessmentApp'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 shadow-lg">
            <span className="text-2xl text-white">📊</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Stage Project Beoordelingssysteem
          </h1>
          
          <p className="text-xl text-gray-600 font-medium mb-6 max-w-3xl mx-auto">
            Upload je projectvoorstel en verantwoordingsverslag voor een geautomatiseerde beoordeling volgens de officiële rubriek.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto border border-blue-200 shadow-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">🎯 Beoordelingscriteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">📋 Projectvoorstel</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Probleemstelling & doelstelling</li>
                  <li>• Onderzoeksvragen</li>
                  <li>• Methodologie & planning</li>
                  <li>• Haalbaarheid & relevantie</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">📝 Verantwoordingsverslag</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Reflectie op proces</li>
                  <li>• Analyse van resultaten</li>
                  <li>• Conclusies & aanbevelingen</li>
                  <li>• Persoonlijke ontwikkeling</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">⭐ Kwaliteitscriteria</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Structuur & opbouw</li>
                  <li>• Taalgebruik & stijl</li>
                  <li>• Bronvermelding & APA</li>
                  <li>• Originaliteit & creativiteit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Assessment Interface */}
        <div className="max-w-6xl mx-auto">
          <StageAssessmentApp />
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-blue-600">
            <span>📊</span>
            <span>Professionele Stage Beoordeling</span>
            <span>📊</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Geautomatiseerde beoordeling • AI-powered analyse • Objectieve waardering
          </p>
        </div>
      </div>
    </div>
  )
}