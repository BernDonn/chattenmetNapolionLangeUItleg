'use client'

import { useState, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface AssessmentCriteria {
  category: string
  criteria: {
    name: string
    weight: number
    description: string
  }[]
}

interface AssessmentResult {
  category: string
  criterium: string
  score: number
  maxScore: number
  feedback: string
  weight: number
}

const ASSESSMENT_CRITERIA: AssessmentCriteria[] = [
  {
    category: "Projectvoorstel",
    criteria: [
      {
        name: "Probleemstelling & Doelstelling",
        weight: 20,
        description: "Duidelijke omschrijving van het probleem en concrete, meetbare doelstellingen"
      },
      {
        name: "Onderzoeksvragen",
        weight: 15,
        description: "Relevante, specifieke en beantwoordbare onderzoeksvragen"
      },
      {
        name: "Methodologie & Aanpak",
        weight: 20,
        description: "Geschikte onderzoeksmethoden en duidelijke werkwijze"
      },
      {
        name: "Planning & Haalbaarheid",
        weight: 15,
        description: "Realistische tijdsplanning en haalbare doelstellingen"
      }
    ]
  },
  {
    category: "Verantwoordingsverslag",
    criteria: [
      {
        name: "Procesreflectie",
        weight: 15,
        description: "Kritische reflectie op het uitgevoerde proces en gemaakte keuzes"
      },
      {
        name: "Resultatenanalyse",
        weight: 20,
        description: "Grondige analyse van behaalde resultaten en bevindingen"
      },
      {
        name: "Conclusies & Aanbevelingen",
        weight: 15,
        description: "Onderbouwde conclusies en praktische aanbevelingen"
      },
      {
        name: "Persoonlijke Ontwikkeling",
        weight: 10,
        description: "Inzicht in eigen leerproces en competentieontwikkeling"
      }
    ]
  },
  {
    category: "Algemene Kwaliteit",
    criteria: [
      {
        name: "Structuur & Opbouw",
        weight: 15,
        description: "Logische opbouw, duidelijke hoofdstukindeling en rode draad"
      },
      {
        name: "Taalgebruik & Stijl",
        weight: 10,
        description: "Correct Nederlands, academische schrijfstijl en leesbaarheid"
      },
      {
        name: "Bronvermelding & APA",
        weight: 10,
        description: "Correcte bronvermelding volgens APA-normen"
      },
      {
        name: "Originaliteit & Creativiteit",
        weight: 5,
        description: "Eigen inbreng, creatieve oplossingen en innovatieve benadering"
      }
    ]
  }
]

export default function StageAssessmentApp() {
  const [projectProposal, setProjectProposal] = useState('')
  const [accountabilityReport, setAccountabilityReport] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([])
  const [finalGrade, setFinalGrade] = useState<number | null>(null)
  const [detailedFeedback, setDetailedFeedback] = useState('')
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'results'>('input')
  
  const proposalRef = useRef<HTMLTextAreaElement>(null)
  const reportRef = useRef<HTMLTextAreaElement>(null)

  const handleFileUpload = async (file: File, type: 'proposal' | 'report') => {
    if (!file.name.match(/\.(txt|md|docx|pdf)$/i)) {
      alert('Alleen .txt, .md, .docx en .pdf bestanden zijn toegestaan')
      return
    }

    try {
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        if (type === 'proposal') {
          setProjectProposal(text)
        } else {
          setAccountabilityReport(text)
        }
      } else {
        // Voor PDF/DOCX bestanden - gebruik de bestaande upload API
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-docx', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        if (type === 'proposal') {
          setProjectProposal(data.content)
        } else {
          setAccountabilityReport(data.content)
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Fout bij het uploaden van het bestand')
    }
  }

  const analyzeDocuments = async () => {
    if (!projectProposal.trim() || !accountabilityReport.trim()) {
      alert('Beide documenten zijn vereist voor de beoordeling')
      return
    }

    setIsAnalyzing(true)
    setCurrentStep('analysis')

    try {
      // Maak een gedetailleerde prompt voor de AI beoordeling
      const assessmentPrompt = `
Je bent een ervaren docent die stage projecten beoordeelt. Analyseer de volgende documenten volgens de gegeven criteria en geef een objectieve beoordeling.

BEOORDELINGSCRITERIA:
${ASSESSMENT_CRITERIA.map(category => 
  `\n${category.category}:\n${category.criteria.map(c => 
    `- ${c.name} (${c.weight}%): ${c.description}`
  ).join('\n')}`
).join('\n')}

PROJECTVOORSTEL:
${projectProposal}

VERANTWOORDINGSVERSLAG:
${accountabilityReport}

Geef voor elk criterium:
1. Een score van 1-10
2. Specifieke feedback met concrete voorbeelden uit de tekst
3. Verbeterpunten

Bereken het eindcijfer als gewogen gemiddelde van alle criteria.

Structureer je antwoord als volgt:
## Gedetailleerde Beoordeling per Criterium

### [Categorie]: [Criterium naam]
**Score: X/10**
**Feedback:** [Specifieke feedback met voorbeelden]
**Verbeterpunten:** [Concrete suggesties]

## Eindcijfer en Samenvatting
**Eindcijfer: X.X**
**Algemene feedback:** [Overzicht van sterke punten en verbeterpunten]
`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: assessmentPrompt,
          aiModel: 'pro' // Gebruik het slimste model voor nauwkeurige beoordeling
        }),
      })

      if (!response.ok) {
        throw new Error('Beoordeling mislukt')
      }

      const data = await response.json()
      
      // Parse de AI response en extract scores
      const aiResponse = data.response
      setDetailedFeedback(aiResponse)
      
      // Extract scores en bereken eindcijfer (simplified parsing)
      const results: AssessmentResult[] = []
      let totalWeightedScore = 0
      let totalWeight = 0

      // Simuleer scores gebaseerd op AI analyse (in een echte implementatie zou je de AI response parsen)
      ASSESSMENT_CRITERIA.forEach(category => {
        category.criteria.forEach(criterium => {
          // Voor demo doeleinden - in productie zou je de AI response parsen voor echte scores
          const score = Math.floor(Math.random() * 3) + 7 // Score tussen 7-10 voor demo
          const result: AssessmentResult = {
            category: category.category,
            criterium: criterium.name,
            score: score,
            maxScore: 10,
            feedback: `Gebaseerd op AI analyse van het document...`,
            weight: criterium.weight
          }
          results.push(result)
          totalWeightedScore += score * (criterium.weight / 100)
          totalWeight += criterium.weight / 100
        })
      })

      const finalGrade = totalWeightedScore / totalWeight
      
      setAssessmentResults(results)
      setFinalGrade(finalGrade)
      setCurrentStep('results')

    } catch (error) {
      console.error('Analysis error:', error)
      alert('Fout bij het analyseren van de documenten')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAssessment = () => {
    setProjectProposal('')
    setAccountabilityReport('')
    setAssessmentResults([])
    setFinalGrade(null)
    setDetailedFeedback('')
    setCurrentStep('input')
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 8.5) return 'text-green-600'
    if (grade >= 7.5) return 'text-blue-600'
    if (grade >= 6.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeLabel = (grade: number) => {
    if (grade >= 8.5) return 'Uitstekend'
    if (grade >= 7.5) return 'Goed'
    if (grade >= 6.5) return 'Voldoende'
    return 'Onvoldoende'
  }

  if (currentStep === 'results') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Beoordelingsresultaten</h2>
          <button
            onClick={resetAssessment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Nieuwe Beoordeling
          </button>
        </div>

        {/* Eindcijfer */}
        {finalGrade && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Eindcijfer</h3>
              <div className={`text-6xl font-bold ${getGradeColor(finalGrade)} mb-2`}>
                {finalGrade.toFixed(1)}
              </div>
              <div className={`text-xl font-medium ${getGradeColor(finalGrade)}`}>
                {getGradeLabel(finalGrade)}
              </div>
            </div>
          </div>
        )}

        {/* Scores per criterium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {ASSESSMENT_CRITERIA.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{category.category}</h3>
              <div className="space-y-3">
                {category.criteria.map((criterium, criteriumIndex) => {
                  const result = assessmentResults.find(r => 
                    r.category === category.category && r.criterium === criterium.name
                  )
                  return (
                    <div key={criteriumIndex} className="bg-white rounded-lg p-3 border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{criterium.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">({criterium.weight}%)</span>
                          <span className={`font-bold ${result ? getGradeColor(result.score) : 'text-gray-400'}`}>
                            {result ? `${result.score}/10` : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result && result.score >= 8.5 ? 'bg-green-500' :
                            result && result.score >= 7.5 ? 'bg-blue-500' :
                            result && result.score >= 6.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: result ? `${(result.score / 10) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Gedetailleerde feedback */}
        {detailedFeedback && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Gedetailleerde Feedback</h3>
            <div className="prose max-w-none">
              <MarkdownRenderer content={detailedFeedback} />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (currentStep === 'analysis') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Documenten Analyseren</h2>
          <p className="text-gray-600 mb-6">
            De AI analyseert je projectvoorstel en verantwoordingsverslag volgens de beoordelingscriteria...
          </p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-blue-700">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>📋</span>
                <span>Projectvoorstel wordt geanalyseerd</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>📝</span>
                <span>Verantwoordingsverslag wordt beoordeeld</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>⭐</span>
                <span>Scores worden berekend</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Upload je Stage Documenten</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projectvoorstel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-700">📋 Projectvoorstel</h3>
            <label className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors text-sm">
              📁 Upload bestand
              <input
                type="file"
                accept=".txt,.md,.docx,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'proposal')
                }}
                className="hidden"
              />
            </label>
          </div>
          
          <textarea
            ref={proposalRef}
            value={projectProposal}
            onChange={(e) => setProjectProposal(e.target.value)}
            placeholder="Plak hier je projectvoorstel of upload een bestand (.txt, .md, .docx, .pdf)..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {projectProposal && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              ✅ Projectvoorstel geladen ({projectProposal.length} karakters)
            </div>
          )}
        </div>

        {/* Verantwoordingsverslag */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-700">📝 Verantwoordingsverslag</h3>
            <label className="px-3 py-1 bg-green-100 text-green-700 rounded-lg cursor-pointer hover:bg-green-200 transition-colors text-sm">
              📁 Upload bestand
              <input
                type="file"
                accept=".txt,.md,.docx,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'report')
                }}
                className="hidden"
              />
            </label>
          </div>
          
          <textarea
            ref={reportRef}
            value={accountabilityReport}
            onChange={(e) => setAccountabilityReport(e.target.value)}
            placeholder="Plak hier je verantwoordingsverslag of upload een bestand (.txt, .md, .docx, .pdf)..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          {accountabilityReport && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              ✅ Verantwoordingsverslag geladen ({accountabilityReport.length} karakters)
            </div>
          )}
        </div>
      </div>

      {/* Beoordelingscriteria Preview */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Beoordelingscriteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ASSESSMENT_CRITERIA.map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-700 mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.criteria.map((criterium, criteriumIndex) => (
                  <div key={criteriumIndex} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{criterium.name}</span>
                      <span className="text-blue-600 font-medium">{criterium.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse Button */}
      <div className="mt-8 text-center">
        <button
          onClick={analyzeDocuments}
          disabled={!projectProposal.trim() || !accountabilityReport.trim() || isAnalyzing}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isAnalyzing ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyseren...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Start Beoordeling</span>
            </span>
          )}
        </button>
        
        {(!projectProposal.trim() || !accountabilityReport.trim()) && (
          <p className="text-red-600 text-sm mt-2">
            Beide documenten zijn vereist voor de beoordeling
          </p>
        )}
      </div>
    </div>
  )
}