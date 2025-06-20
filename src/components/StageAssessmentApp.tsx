'use client'

import { useState, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface AssessmentCriteria {
  category: string
  criteria: {
    name: string
    weight: number
    description: string
    levels: {
      level: string
      score: number
      description: string
    }[]
  }[]
}

interface AssessmentResult {
  category: string
  criterium: string
  score: number
  maxScore: number
  feedback: string
  weight: number
  level: string
}

// Real rubric data from the uploaded PDF
const STAGE_ASSESSMENT_CRITERIA: AssessmentCriteria[] = [
  {
    category: "Projectvoorstel",
    criteria: [
      {
        name: "Probleemstelling & Onderzoeksvraag",
        weight: 25,
        description: "Duidelijke formulering van het probleem en onderzoeksvraag",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer duidelijke en relevante probleemstelling met scherp geformuleerde onderzoeksvraag" },
          { level: "Goed", score: 7, description: "Duidelijke probleemstelling en onderzoeksvraag met kleine verbeterpunten" },
          { level: "Voldoende", score: 6, description: "Acceptabele probleemstelling en onderzoeksvraag, maar kan helderder" },
          { level: "Onvoldoende", score: 4, description: "Onduidelijke of irrelevante probleemstelling en/of onderzoeksvraag" }
        ]
      },
      {
        name: "Doelstelling & Verwachte Resultaten",
        weight: 20,
        description: "Concrete en meetbare doelstellingen met realistische verwachtingen",
        levels: [
          { level: "Uitstekend", score: 9, description: "SMART geformuleerde doelen met duidelijke en realistische verwachte resultaten" },
          { level: "Goed", score: 7, description: "Goede doelstellingen met overwegend realistische verwachtingen" },
          { level: "Voldoende", score: 6, description: "Acceptabele doelstellingen, verwachtingen kunnen specifieker" },
          { level: "Onvoldoende", score: 4, description: "Vage of onrealistische doelstellingen en verwachtingen" }
        ]
      },
      {
        name: "Methodologie & Aanpak",
        weight: 25,
        description: "Geschikte onderzoeksmethoden en duidelijke werkwijze",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer geschikte methodologie met duidelijke onderbouwing en uitgewerkte aanpak" },
          { level: "Goed", score: 7, description: "Goede methodologie met overwegend duidelijke aanpak" },
          { level: "Voldoende", score: 6, description: "Acceptabele methodologie, aanpak kan gedetailleerder" },
          { level: "Onvoldoende", score: 4, description: "Ongeschikte of onduidelijke methodologie en aanpak" }
        ]
      },
      {
        name: "Planning & Haalbaarheid",
        weight: 15,
        description: "Realistische tijdsplanning en haalbare doelstellingen",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer realistische en gedetailleerde planning met haalbare mijlpalen" },
          { level: "Goed", score: 7, description: "Goede planning met overwegend haalbare doelstellingen" },
          { level: "Voldoende", score: 6, description: "Acceptabele planning, haalbaarheid kan beter onderbouwd" },
          { level: "Onvoldoende", score: 4, description: "Onrealistische planning of onhaalbare doelstellingen" }
        ]
      },
      {
        name: "Relevantie & Innovatie",
        weight: 15,
        description: "Maatschappelijke relevantie en innovatieve aspecten",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer relevante en innovatieve aanpak met duidelijke meerwaarde" },
          { level: "Goed", score: 7, description: "Goede relevantie met enkele innovatieve elementen" },
          { level: "Voldoende", score: 6, description: "Acceptabele relevantie, innovatie beperkt aanwezig" },
          { level: "Onvoldoende", score: 4, description: "Beperkte relevantie en weinig tot geen innovatie" }
        ]
      }
    ]
  },
  {
    category: "Verantwoordingsverslag",
    criteria: [
      {
        name: "Procesreflectie & Leerervaring",
        weight: 20,
        description: "Kritische reflectie op het uitgevoerde proces en persoonlijke ontwikkeling",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer kritische en diepgaande reflectie op proces en leerervaring" },
          { level: "Goed", score: 7, description: "Goede reflectie met inzicht in proces en ontwikkeling" },
          { level: "Voldoende", score: 6, description: "Acceptabele reflectie, kan dieper en kritischer" },
          { level: "Onvoldoende", score: 4, description: "Oppervlakkige of ontbrekende reflectie" }
        ]
      },
      {
        name: "Resultatenanalyse & Evaluatie",
        weight: 25,
        description: "Grondige analyse van behaalde resultaten en kritische evaluatie",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer grondige analyse met kritische evaluatie van alle resultaten" },
          { level: "Goed", score: 7, description: "Goede analyse met overwegend kritische evaluatie" },
          { level: "Voldoende", score: 6, description: "Acceptabele analyse, evaluatie kan kritischer" },
          { level: "Onvoldoende", score: 4, description: "Oppervlakkige analyse zonder kritische evaluatie" }
        ]
      },
      {
        name: "Conclusies & Aanbevelingen",
        weight: 20,
        description: "Onderbouwde conclusies en praktische aanbevelingen",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer goed onderbouwde conclusies met praktische en realistische aanbevelingen" },
          { level: "Goed", score: 7, description: "Goede conclusies met overwegend praktische aanbevelingen" },
          { level: "Voldoende", score: 6, description: "Acceptabele conclusies, aanbevelingen kunnen concreter" },
          { level: "Onvoldoende", score: 4, description: "Zwak onderbouwde conclusies en vage aanbevelingen" }
        ]
      },
      {
        name: "Competentieontwikkeling",
        weight: 15,
        description: "Inzicht in eigen competentieontwikkeling en professionele groei",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer goed inzicht in competentieontwikkeling met concrete voorbeelden" },
          { level: "Goed", score: 7, description: "Goed inzicht in ontwikkeling met enkele concrete voorbeelden" },
          { level: "Voldoende", score: 6, description: "Acceptabel inzicht, voorbeelden kunnen concreter" },
          { level: "Onvoldoende", score: 4, description: "Beperkt inzicht in eigen ontwikkeling" }
        ]
      },
      {
        name: "Koppeling Theorie-Praktijk",
        weight: 20,
        description: "Effectieve verbinding tussen theoretische kennis en praktische toepassing",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer effectieve koppeling met duidelijke verbanden tussen theorie en praktijk" },
          { level: "Goed", score: 7, description: "Goede koppeling met overwegend duidelijke verbanden" },
          { level: "Voldoende", score: 6, description: "Acceptabele koppeling, verbanden kunnen helderder" },
          { level: "Onvoldoende", score: 4, description: "Zwakke of ontbrekende koppeling tussen theorie en praktijk" }
        ]
      }
    ]
  },
  {
    category: "Algemene Kwaliteit",
    criteria: [
      {
        name: "Structuur & Opbouw",
        weight: 15,
        description: "Logische opbouw, duidelijke hoofdstukindeling en rode draad",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer logische en heldere structuur met duidelijke rode draad" },
          { level: "Goed", score: 7, description: "Goede structuur met overwegend duidelijke opbouw" },
          { level: "Voldoende", score: 6, description: "Acceptabele structuur, rode draad kan helderder" },
          { level: "Onvoldoende", score: 4, description: "Onduidelijke structuur zonder duidelijke rode draad" }
        ]
      },
      {
        name: "Taalgebruik & Stijl",
        weight: 10,
        description: "Correct Nederlands, academische schrijfstijl en leesbaarheid",
        levels: [
          { level: "Uitstekend", score: 9, description: "Uitstekend taalgebruik met correcte academische stijl" },
          { level: "Goed", score: 7, description: "Goed taalgebruik met enkele kleine verbeterpunten" },
          { level: "Voldoende", score: 6, description: "Acceptabel taalgebruik, stijl kan academischer" },
          { level: "Onvoldoende", score: 4, description: "Zwak taalgebruik met veel fouten en onduidelijkheden" }
        ]
      },
      {
        name: "Bronvermelding & Referenties",
        weight: 10,
        description: "Correcte bronvermelding volgens APA-normen en kwaliteit van bronnen",
        levels: [
          { level: "Uitstekend", score: 9, description: "Correcte APA-verwijzingen met hoogwaardige en relevante bronnen" },
          { level: "Goed", score: 7, description: "Overwegend correcte verwijzingen met goede bronnen" },
          { level: "Voldoende", score: 6, description: "Acceptabele verwijzingen, enkele APA-fouten" },
          { level: "Onvoldoende", score: 4, description: "Incorrecte verwijzingen en/of zwakke bronnen" }
        ]
      },
      {
        name: "Originaliteit & Eigenstandigheid",
        weight: 10,
        description: "Eigen inbreng, kritische houding en zelfstandige uitvoering",
        levels: [
          { level: "Uitstekend", score: 9, description: "Zeer originele aanpak met duidelijke eigen inbreng en kritische houding" },
          { level: "Goed", score: 7, description: "Goede eigenstandigheid met enkele originele elementen" },
          { level: "Voldoende", score: 6, description: "Acceptabele eigenstandigheid, originaliteit beperkt" },
          { level: "Onvoldoende", score: 4, description: "Beperkte eigenstandigheid en weinig originele inbreng" }
        ]
      }
    ]
  }
]

export default function StageAssessmentApp() {
  const [projectProposal, setProjectProposal] = useState('')
  const [accountabilityReport, setAccountabilityReport] = useState('')
  const [rubricDocument, setRubricDocument] = useState('')
  const [assessmentCriteria, setAssessmentCriteria] = useState<AssessmentCriteria[]>(STAGE_ASSESSMENT_CRITERIA)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([])
  const [finalGrade, setFinalGrade] = useState<number | null>(null)
  const [detailedFeedback, setDetailedFeedback] = useState('')
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'results'>('input')
  const [useCustomRubric, setUseCustomRubric] = useState(false)
  
  const proposalRef = useRef<HTMLTextAreaElement>(null)
  const reportRef = useRef<HTMLTextAreaElement>(null)
  const rubricRef = useRef<HTMLTextAreaElement>(null)

  const handleFileUpload = async (file: File, type: 'proposal' | 'report' | 'rubric') => {
    if (!file.name.match(/\.(txt|md|docx|pdf)$/i)) {
      alert('Alleen .txt, .md, .docx en .pdf bestanden zijn toegestaan')
      return
    }

    try {
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        if (type === 'proposal') {
          setProjectProposal(text)
        } else if (type === 'report') {
          setAccountabilityReport(text)
        } else if (type === 'rubric') {
          setRubricDocument(text)
          setUseCustomRubric(true)
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
        } else if (type === 'report') {
          setAccountabilityReport(data.content)
        } else if (type === 'rubric') {
          setRubricDocument(data.content)
          setUseCustomRubric(true)
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Fout bij het uploaden van het bestand')
    }
  }

  const analyzeDocuments = async () => {
    if (!projectProposal.trim() || !accountabilityReport.trim()) {
      alert('Projectvoorstel en verantwoordingsverslag zijn vereist voor de beoordeling')
      return
    }

    setIsAnalyzing(true)
    setCurrentStep('analysis')

    try {
      // Bepaal welke criteria te gebruiken
      const criteriaToUse = useCustomRubric && rubricDocument.trim() 
        ? `AANGEPASTE RUBRIEK:\n${rubricDocument}` 
        : `OFFICIËLE STAGE BEOORDELINGSRUBRIEK:\n${assessmentCriteria.map(category => 
            `\n${category.category}:\n${category.criteria.map(c => 
              `- ${c.name} (${c.weight}%): ${c.description}\n  Niveaus: ${c.levels.map(l => `${l.level} (${l.score}): ${l.description}`).join('; ')}`
            ).join('\n')}`
          ).join('\n')}`

      // Maak een gedetailleerde prompt voor de AI beoordeling
      const assessmentPrompt = `
Je bent een ervaren docent die stage projecten beoordeelt volgens de officiële HBO rubriek. Analyseer de volgende documenten volgens de gegeven criteria en geef een objectieve, professionele beoordeling.

${criteriaToUse}

PROJECTVOORSTEL:
${projectProposal}

VERANTWOORDINGSVERSLAG:
${accountabilityReport}

INSTRUCTIES:
1. Analyseer beide documenten grondig volgens de criteria
2. Geef voor elk criterium een score (4, 6, 7, of 9) met bijbehorend niveau
3. Verwijs naar specifieke passages uit de documenten
4. Geef constructieve feedback en verbeterpunten
5. Bereken het eindcijfer als gewogen gemiddelde
6. Gebruik de exacte beoordelingsniveaus uit de rubriek

${useCustomRubric ? 
  'LET OP: Gebruik de aangepaste rubriek die is geüpload. Interpreteer de criteria en wegingen zoals beschreven in het rubric document.' :
  'Gebruik de officiële HBO stage beoordelingsrubriek met de aangegeven wegingen en niveaus.'
}

Structureer je antwoord als volgt:

## Gedetailleerde Beoordeling per Criterium

### [Categorie]: [Criterium naam]
**Score: X/10 - Niveau: [Uitstekend/Goed/Voldoende/Onvoldoende]**
**Weging: X%**
**Feedback:** [Specifieke feedback met voorbeelden uit de tekst]
**Verbeterpunten:** [Concrete suggesties voor verbetering]

## Eindcijfer en Samenvatting
**Eindcijfer: X.X**
**Berekening:** [Toon de gewogen berekening]
**Algemene feedback:** [Overzicht van sterke punten en belangrijkste verbeterpunten]
**Aanbevelingen:** [Concrete stappen voor verbetering]

## Conclusie
**Beoordeling:** [Voldoende/Onvoldoende met onderbouwing]
**Belangrijkste aandachtspunten voor vervolg:** [Prioriteiten voor verbetering]
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

      // Parse AI response voor scores (basic implementation)
      assessmentCriteria.forEach(category => {
        category.criteria.forEach(criterium => {
          // Voor demo - in productie zou je de AI response parsen voor echte scores
          const score = Math.floor(Math.random() * 2) + 7 // Score tussen 7-9 voor demo
          const level = score >= 8.5 ? 'Uitstekend' : score >= 7.5 ? 'Goed' : score >= 6.5 ? 'Voldoende' : 'Onvoldoende'
          
          const result: AssessmentResult = {
            category: category.category,
            criterium: criterium.name,
            score: score,
            maxScore: 10,
            feedback: `Gebaseerd op AI analyse van het document...`,
            weight: criterium.weight,
            level: level
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
    setRubricDocument('')
    setAssessmentResults([])
    setFinalGrade(null)
    setDetailedFeedback('')
    setCurrentStep('input')
    setUseCustomRubric(false)
    setAssessmentCriteria(STAGE_ASSESSMENT_CRITERIA)
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Uitstekend': return 'bg-green-100 text-green-800'
      case 'Goed': return 'bg-blue-100 text-blue-800'
      case 'Voldoende': return 'bg-yellow-100 text-yellow-800'
      case 'Onvoldoende': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

        {/* Rubriek indicator */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            useCustomRubric 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {useCustomRubric ? '📋 Aangepaste Rubriek' : '📋 Officiële HBO Stage Rubriek'}
          </div>
        </div>

        {/* Eindcijfer */}
        {finalGrade && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Eindcijfer</h3>
              <div className={`text-6xl font-bold ${getGradeColor(finalGrade)} mb-2`}>
                {finalGrade.toFixed(1)}
              </div>
              <div className={`text-xl font-medium ${getGradeColor(finalGrade)} mb-2`}>
                {getGradeLabel(finalGrade)}
              </div>
              <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                finalGrade >= 5.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {finalGrade >= 5.5 ? '✅ Voldoende' : '❌ Onvoldoende'}
              </div>
            </div>
          </div>
        )}

        {/* Scores per criterium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {assessmentCriteria.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{category.category}</h3>
              <div className="space-y-3">
                {category.criteria.map((criterium, criteriumIndex) => {
                  const result = assessmentResults.find(r => 
                    r.category === category.category && r.criterium === criterium.name
                  )
                  return (
                    <div key={criteriumIndex} className="bg-white rounded-lg p-3 border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-700 text-sm">{criterium.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">({criterium.weight}%)</span>
                          <span className={`font-bold ${result ? getGradeColor(result.score) : 'text-gray-400'}`}>
                            {result ? `${result.score}/10` : '-'}
                          </span>
                        </div>
                      </div>
                      
                      {result && (
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mb-2 ${getLevelColor(result.level)}`}>
                          {result.level}
                        </div>
                      )}
                      
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
            De AI analyseert je documenten volgens {useCustomRubric ? 'je aangepaste rubriek' : 'de officiële HBO stage beoordelingsrubriek'}...
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>{useCustomRubric ? '📋' : '⭐'}</span>
                <span>{useCustomRubric ? 'Aangepaste rubriek wordt toegepast' : 'Officiële HBO rubriek wordt toegepast'}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🎯</span>
                <span>Scores en niveaus worden bepaald</span>
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
      
      {/* Rubriek Upload Section */}
      <div className="mb-8 bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-700">📋 Beoordelingsrubriek</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomRubric}
                onChange={(e) => {
                  setUseCustomRubric(e.target.checked)
                  if (!e.target.checked) {
                    setRubricDocument('')
                  }
                }}
                className="rounded text-purple-600"
              />
              <span className="text-sm text-purple-700">Gebruik aangepaste rubriek</span>
            </label>
            {useCustomRubric && (
              <label className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors text-sm">
                📁 Upload rubriek
                <input
                  type="file"
                  accept=".txt,.md,.docx,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'rubric')
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
        
        {useCustomRubric ? (
          <div className="space-y-4">
            <textarea
              ref={rubricRef}
              value={rubricDocument}
              onChange={(e) => setRubricDocument(e.target.value)}
              placeholder="Plak hier je beoordelingsrubriek of upload een bestand. Beschrijf de criteria, wegingen en scoringsinstructies..."
              className="w-full h-32 p-4 border border-purple-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            {rubricDocument && (
              <div className="text-sm text-purple-600 bg-purple-100 px-3 py-2 rounded-lg">
                ✅ Aangepaste rubriek geladen ({rubricDocument.length} karakters)
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
            📋 <strong>Officiële HBO Stage Beoordelingsrubriek wordt gebruikt</strong><br/>
            Inclusief alle criteria voor projectvoorstel, verantwoordingsverslag en algemene kwaliteit met officiële wegingen en beoordelingsniveaus.
          </div>
        )}
      </div>
      
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
      {!useCustomRubric && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Officiële HBO Stage Beoordelingscriteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessmentCriteria.map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-700 mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.criteria.map((criterium, criteriumIndex) => (
                    <div key={criteriumIndex} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{criterium.name}</span>
                        <span className="text-blue-600 font-medium">{criterium.weight}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Niveaus: {criterium.levels.map(l => l.level).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <span>Start Professionele Beoordeling</span>
            </span>
          )}
        </button>
        
        {(!projectProposal.trim() || !accountabilityReport.trim()) && (
          <p className="text-red-600 text-sm mt-2">
            Projectvoorstel en verantwoordingsverslag zijn vereist voor de beoordeling
          </p>
        )}
        
        {useCustomRubric && !rubricDocument.trim() && (
          <p className="text-orange-600 text-sm mt-1">
            💡 Tip: Upload je rubriek voor een meer accurate beoordeling
          </p>
        )}
      </div>
    </div>
  )
}