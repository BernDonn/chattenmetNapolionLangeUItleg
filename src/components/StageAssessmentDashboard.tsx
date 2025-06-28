'use client'

import { useState, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import ResponseActions from './ResponseActions'

interface UploadedFile {
  id: string
  name: string
  type: 'rubric' | 'proposal' | 'report'
  content: string
  size: number
  uploadedAt: Date
  studentName?: string
}

interface AssessmentResult {
  id: string
  studentName: string
  documentType: 'proposal' | 'report'
  overallGrade: number
  criteriaGrades: Array<{
    criterion: string
    grade: number
    feedback: string
    maxPoints: number
  }>
  generalFeedback: string
  strengths: string[]
  improvements: string[]
  timestamp: Date
}

export default function StageAssessmentDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results'>('upload')
  const [error, setError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedDocumentType, setSelectedDocumentType] = useState<'proposal' | 'report'>('proposal')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList, type: 'rubric' | 'proposal' | 'report') => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (!file.name.match(/\.(pdf|docx|txt|md)$/i)) {
        setError('Ondersteunde formaten: PDF, DOCX, TXT, MD')
        continue
      }

      try {
        let content = ''
        
        if (file.name.match(/\.(txt|md)$/i)) {
          content = await file.text()
        } else {
          // Voor PDF/DOCX bestanden - gebruik de upload API
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
          content = data.content
        }

        const uploadedFile: UploadedFile = {
          id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type,
          content,
          size: file.size,
          uploadedAt: new Date(),
          studentName: type !== 'rubric' ? selectedStudent : undefined
        }

        setUploadedFiles(prev => [...prev, uploadedFile])
        setError('')
      } catch (error) {
        console.error('Upload error:', error)
        setError('Fout bij uploaden van bestand')
      }
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const getRubricFile = () => uploadedFiles.find(f => f.type === 'rubric')
  const getStudentFiles = () => uploadedFiles.filter(f => f.type !== 'rubric')

  const assessDocument = async () => {
    const rubric = getRubricFile()
    const studentFiles = getStudentFiles()

    if (!rubric) {
      setError('Upload eerst een rubriek')
      return
    }

    if (studentFiles.length === 0) {
      setError('Upload eerst student documenten')
      return
    }

    setIsProcessing(true)
    setCurrentStep('processing')
    setError('')

    try {
      for (const studentFile of studentFiles) {
        const prompt = `
Je bent een ervaren docent die stage projecten beoordeelt. Je krijgt een rubriek en een student document om te beoordelen.

RUBRIEK:
${rubric.content}

STUDENT DOCUMENT (${studentFile.type === 'proposal' ? 'Projectvoorstel' : 'Verantwoordingsverslag'}):
Naam: ${studentFile.studentName || 'Onbekend'}
${studentFile.content}

INSTRUCTIES:
1. Beoordeel het document volgens de rubriek
2. Geef per criterium een cijfer en specifieke feedback
3. Bereken het totaalcijfer
4. Geef constructieve feedback

Geef je beoordeling in dit JSON formaat:
{
  "overallGrade": 7.5,
  "criteriaGrades": [
    {
      "criterion": "Probleemstelling",
      "grade": 8.0,
      "feedback": "Duidelijke en relevante probleemstelling...",
      "maxPoints": 10
    }
  ],
  "generalFeedback": "Algemene feedback over het document...",
  "strengths": ["Sterke punt 1", "Sterke punt 2"],
  "improvements": ["Verbeterpunt 1", "Verbeterpunt 2"]
}
`

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            aiModel: 'smart'
          }),
        })

        if (!response.ok) {
          throw new Error('Beoordeling mislukt')
        }

        const data = await response.json()
        
        try {
          // Extract JSON from response
          let jsonText = data.response.trim()
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
          
          const jsonStart = jsonText.indexOf('{')
          const jsonEnd = jsonText.lastIndexOf('}') + 1
          
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            jsonText = jsonText.substring(jsonStart, jsonEnd)
          }
          
          const assessment = JSON.parse(jsonText)
          
          const result: AssessmentResult = {
            id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentName: studentFile.studentName || 'Onbekend',
            documentType: studentFile.type as 'proposal' | 'report',
            overallGrade: assessment.overallGrade,
            criteriaGrades: assessment.criteriaGrades,
            generalFeedback: assessment.generalFeedback,
            strengths: assessment.strengths || [],
            improvements: assessment.improvements || [],
            timestamp: new Date()
          }
          
          setAssessmentResults(prev => [...prev, result])
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          setError('Kon beoordeling niet verwerken')
        }
      }
      
      setCurrentStep('results')
    } catch (error) {
      console.error('Assessment error:', error)
      setError('Fout bij beoordeling')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetDashboard = () => {
    setUploadedFiles([])
    setAssessmentResults([])
    setCurrentStep('upload')
    setError('')
    setSelectedStudent('')
  }

  if (currentStep === 'results' && assessmentResults.length > 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Beoordelingsresultaten</h2>
              <p className="text-gray-600">{assessmentResults.length} document(en) beoordeeld</p>
            </div>
            <button
              onClick={resetDashboard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🔄 Nieuwe Beoordeling
            </button>
          </div>
        </div>

        {/* Results */}
        {assessmentResults.map((result) => (
          <div key={result.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Student Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{result.studentName}</h3>
                  <p className="text-indigo-200">
                    {result.documentType === 'proposal' ? 'Projectvoorstel' : 'Verantwoordingsverslag'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.overallGrade.toFixed(1)}</div>
                  <div className="text-indigo-200">Eindcijfer</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Criteria Scores */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Beoordeling per Criterium</h4>
                <div className="grid gap-4">
                  {result.criteriaGrades.map((criteria, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">{criteria.criterion}</h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-indigo-600">
                            {criteria.grade.toFixed(1)}
                          </span>
                          <span className="text-gray-500">/ {criteria.maxPoints}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{criteria.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Feedback */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">💬 Algemene Feedback</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <MarkdownRenderer content={result.generalFeedback} className="text-gray-700" />
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-3">✅ Sterke Punten</h4>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-orange-800 mb-3">🔧 Verbeterpunten</h4>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <ResponseActions 
                  content={`# Beoordeling: ${result.studentName}

## Eindcijfer: ${result.overallGrade.toFixed(1)}

## Beoordeling per Criterium
${result.criteriaGrades.map(c => `### ${c.criterion}: ${c.grade.toFixed(1)}/${c.maxPoints}
${c.feedback}`).join('\n\n')}

## Algemene Feedback
${result.generalFeedback}

## Sterke Punten
${result.strengths.map(s => `- ${s}`).join('\n')}

## Verbeterpunten
${result.improvements.map(i => `- ${i}`).join('\n')}`}
                  isMarkdown={true}
                  isStreaming={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (currentStep === 'processing') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 Documenten worden beoordeeld</h2>
          <p className="text-gray-600 mb-6">
            AI analyseert de documenten volgens de rubriek en genereert cijfers en feedback...
          </p>
          <div className="bg-indigo-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-indigo-700">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>📋</span>
                <span>Rubriek criteria analyseren</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>📄</span>
                <span>Student documenten beoordelen</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>🔢</span>
                <span>Cijfers berekenen</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>💬</span>
                <span>Feedback genereren</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Upload Rubriek */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Stap 1: Upload Beoordelingsrubriek</h2>
        <p className="text-gray-600 mb-4">
          Upload de rubriek met beoordelingscriteria die voor alle studenten geldt.
        </p>
        
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">Sleep rubriek hier naartoe</p>
              <p className="text-sm text-gray-500 mt-1">of klik om bestand te selecteren</p>
            </div>
            
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'rubric')}
              className="hidden"
              id="rubric-input"
            />
            
            <label
              htmlFor="rubric-input"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              📋 Rubriek Selecteren
            </label>
          </div>
        </div>

        {getRubricFile() && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">{getRubricFile()!.name}</p>
                <p className="text-sm text-green-600">
                  Rubriek geüpload • {(getRubricFile()!.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Upload Student Documents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Stap 2: Upload Student Documenten</h2>
        
        {/* Student Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Studentnaam
          </label>
          <input
            type="text"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            placeholder="Voer studentnaam in..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Document Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="proposal"
                checked={selectedDocumentType === 'proposal'}
                onChange={(e) => setSelectedDocumentType(e.target.value as 'proposal' | 'report')}
                className="mr-2"
              />
              <span>Projectvoorstel</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="report"
                checked={selectedDocumentType === 'report'}
                onChange={(e) => setSelectedDocumentType(e.target.value as 'proposal' | 'report')}
                className="mr-2"
              />
              <span>Verantwoordingsverslag</span>
            </label>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">Sleep student document hier naartoe</p>
              <p className="text-sm text-gray-500 mt-1">Projectvoorstel of Verantwoordingsverslag</p>
            </div>
            
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => e.target.files && selectedStudent && handleFileUpload(e.target.files, selectedDocumentType)}
              className="hidden"
              id="document-input"
              disabled={!selectedStudent}
            />
            
            <label
              htmlFor="document-input"
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                selectedStudent 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📄 Document Selecteren
            </label>
            
            {!selectedStudent && (
              <p className="text-xs text-red-600">Voer eerst een studentnaam in</p>
            )}
          </div>
        </div>

        {/* Uploaded Student Files */}
        {getStudentFiles().length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Geüploade Documenten:</h3>
            <div className="space-y-3">
              {getStudentFiles().map((file) => (
                <div key={file.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">
                          {file.type === 'proposal' ? '📋' : '📊'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {file.studentName} - {file.type === 'proposal' ? 'Projectvoorstel' : 'Verantwoordingsverslag'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {file.name} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-800">Fout</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Button */}
      <div className="text-center">
        <button
          onClick={assessDocument}
          disabled={!getRubricFile() || getStudentFiles().length === 0 || isProcessing}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isProcessing ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Beoordelen...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>🤖</span>
              <span>Start Automatische Beoordeling</span>
            </span>
          )}
        </button>
        
        {(!getRubricFile() || getStudentFiles().length === 0) && (
          <p className="text-red-600 text-sm mt-2">
            Upload eerst een rubriek en minimaal één student document
          </p>
        )}
      </div>
    </div>
  )
}