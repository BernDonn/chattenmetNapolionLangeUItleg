import StageAssessmentDashboard from '@/components/StageAssessmentDashboard'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-6 shadow-lg">
            <span className="text-2xl text-white">📊</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Stage Project Beoordelingssysteem
          </h1>
          
          <p className="text-xl text-gray-600 font-medium mb-6 max-w-3xl mx-auto">
            Professionele tool voor het beoordelen van stage projectvoorstellen en verantwoordingsverslagen volgens officiële rubrieken.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto border border-indigo-200 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-700 mb-4">🎯 Hoe het werkt</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">📋 Upload Rubriek</h3>
                <p className="text-xs">Upload de beoordelingscriteria die voor alle studenten gelden</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">📄 Upload Documenten</h3>
                <p className="text-xs">Upload projectvoorstel en/of verantwoordingsverslag per student</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">🤖 AI Beoordeling</h3>
                <p className="text-xs">Krijg automatische cijfers en gedetailleerde feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="max-w-7xl mx-auto">
          <StageAssessmentDashboard />
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-indigo-600">
            <span>📊</span>
            <span>Stage Beoordeling AI</span>
            <span>📊</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Automatische beoordeling • Consistente cijfers • Gedetailleerde feedback
          </p>
        </div>
      </div>
    </div>
  )
}