'use client'

import { useState, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface MenuItem {
  name: string
  description: string
  price: string
  category: string
  imageUrl: string
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

export default function RestaurantMenu() {
  const [menuText, setMenuText] = useState('')
  const [menuData, setMenuData] = useState<MenuCategory[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<'input' | 'processing' | 'display'>('input')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample food images from Pexels (these are real URLs that work)
  const getFoodImage = (dishName: string): string => {
    const foodImages = {
      // Appetizers
      'bruschetta': 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=400',
      'salad': 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
      'soup': 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400',
      'wings': 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400',
      'nachos': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      
      // Main courses
      'pasta': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
      'pizza': 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
      'burger': 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
      'steak': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400',
      'chicken': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=400',
      'fish': 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
      'salmon': 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
      'rice': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
      'curry': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
      'tacos': 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400',
      'sandwich': 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
      
      // Desserts
      'cake': 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
      'ice cream': 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?auto=compress&cs=tinysrgb&w=400',
      'chocolate': 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=400',
      'pie': 'https://images.pexels.com/photos/264939/pexels-photo-264939.jpeg?auto=compress&cs=tinysrgb&w=400',
      'tiramisu': 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
      
      // Drinks
      'coffee': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      'wine': 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=400',
      'beer': 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400',
      'cocktail': 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400',
      'juice': 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
      
      // Default fallback
      'default': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
    }

    // Find matching image based on dish name keywords
    const dishLower = dishName.toLowerCase()
    for (const [keyword, imageUrl] of Object.entries(foodImages)) {
      if (dishLower.includes(keyword)) {
        return imageUrl
      }
    }
    
    return foodImages.default
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(txt|md|pdf|jpg|jpeg|png)$/i)) {
      setError('Ondersteunde formaten: .txt, .md, .pdf, .jpg, .jpeg, .png')
      return
    }

    try {
      if (file.name.match(/\.(txt|md)$/i)) {
        const text = await file.text()
        setMenuText(text)
      } else if (file.name.match(/\.(pdf)$/i)) {
        // For PDF files - use the upload API
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
        setMenuText(data.content)
      } else {
        setError('Voor afbeeldingen: gebruik tekst of PDF upload voor nu')
        return
      }
    } catch (error) {
      console.error('File upload error:', error)
      setError('Fout bij het uploaden van het bestand')
    }
  }

  const processMenu = async () => {
    if (!menuText.trim()) {
      setError('Voer eerst een menu in of upload een bestand')
      return
    }

    setIsProcessing(true)
    setCurrentStep('processing')
    setError('')

    try {
      const prompt = `
Analyseer de volgende restaurantmenu tekst en converteer deze naar een gestructureerd JSON formaat.

MENU TEKST:
${menuText}

Maak een JSON object met de volgende structuur:
{
  "categories": [
    {
      "name": "Categorie naam (bijv. Voorgerechten, Hoofdgerechten, Desserts)",
      "items": [
        {
          "name": "Gerecht naam",
          "description": "Beschrijving van het gerecht",
          "price": "Prijs (bijv. €12.50)",
          "category": "Categorie naam"
        }
      ]
    }
  ]
}

INSTRUCTIES:
- Identificeer alle gerechten en hun prijzen
- Groepeer gerechten in logische categorieën
- Als er geen expliciete categorieën zijn, maak ze aan (Voorgerechten, Hoofdgerechten, Desserts, Dranken)
- Als er geen prijs staat, gebruik "Prijs op aanvraag"
- Als er geen beschrijving is, maak een korte beschrijving op basis van de naam
- Zorg dat de JSON geldig is
- Geef ALLEEN de JSON terug, geen extra tekst

JSON:
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
        throw new Error('Menu verwerking mislukt')
      }

      const data = await response.json()
      
      try {
        // Extract JSON from the response
        let jsonText = data.response.trim()
        
        // Remove any markdown code blocks
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        // Find JSON object
        const jsonStart = jsonText.indexOf('{')
        const jsonEnd = jsonText.lastIndexOf('}') + 1
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonText = jsonText.substring(jsonStart, jsonEnd)
        }
        
        const menuJson = JSON.parse(jsonText)
        
        // Add images to each menu item
        const categoriesWithImages = menuJson.categories.map((category: any) => ({
          ...category,
          items: category.items.map((item: any) => ({
            ...item,
            imageUrl: getFoodImage(item.name)
          }))
        }))
        
        setMenuData(categoriesWithImages)
        setCurrentStep('display')
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        setError('Kon het menu niet verwerken. Probeer een duidelijker menu formaat.')
      }
    } catch (error) {
      console.error('Menu processing error:', error)
      setError('Fout bij het verwerken van het menu')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetMenu = () => {
    setMenuText('')
    setMenuData([])
    setCurrentStep('input')
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (currentStep === 'display' && menuData.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🍽️ Visual Restaurant Menu</h2>
              <p className="text-orange-100">Klik op een gerecht om meer details te zien</p>
            </div>
            <button
              onClick={resetMenu}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              📋 Nieuw Menu
            </button>
          </div>
        </div>

        <div className="p-6">
          {menuData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-orange-200 pb-2">
                {category.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to default image if image fails to load
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                        {item.price}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (currentStep === 'processing') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🍽️ Menu wordt verwerkt</h2>
          <p className="text-gray-600 mb-6">
            AI analyseert je menu en zoekt passende afbeeldingen voor elk gerecht...
          </p>
          <div className="bg-orange-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-orange-700">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>📋</span>
                <span>Menu items identificeren</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>🏷️</span>
                <span>Categorieën organiseren</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>🖼️</span>
                <span>Passende afbeeldingen zoeken</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✨</span>
                <span>Visual menu samenstellen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Upload je Restaurant Menu</h2>
      
      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                Sleep je menu hier naartoe
              </p>
              <p className="text-sm text-gray-500 mt-1">
                of klik om een bestand te selecteren
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="hidden"
              id="file-input"
            />
            
            <label
              htmlFor="file-input"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
            >
              📁 Bestand Selecteren
            </label>
            
            <p className="text-xs text-gray-400">
              Ondersteunde formaten: .txt, .md, .pdf, .jpg, .jpeg, .png (max 10MB)
            </p>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-orange-700">📝 Of plak je menu tekst</h3>
          </div>
          
          <textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder="Plak hier je restaurant menu...

Bijvoorbeeld:
VOORGERECHTEN
Bruschetta - €8.50
Verse tomaten, basilicum en mozzarella op geroosterd brood

HOOFDGERECHTEN  
Spaghetti Carbonara - €14.50
Klassieke pasta met spek, ei en parmezaan

DESSERTS
Tiramisu - €6.50
Huisgemaakt met mascarpone en koffie"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          
          {menuText && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              ✅ Menu tekst geladen ({menuText.length} karakters)
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

        {/* Process Button */}
        <div className="text-center">
          <button
            onClick={processMenu}
            disabled={!menuText.trim() || isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verwerken...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🖼️</span>
                <span>Maak Visual Menu</span>
              </span>
            )}
          </button>
          
          {!menuText.trim() && (
            <p className="text-red-600 text-sm mt-2">
              Upload een menu bestand of plak menu tekst om te beginnen
            </p>
          )}
        </div>

        {/* Example Menu */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-gray-700 mb-2">💡 Voorbeeld menu formaat:</h4>
          <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border">
            VOORGERECHTEN<br/>
            Bruschetta - €8.50<br/>
            Verse tomaten met basilicum<br/>
            <br/>
            HOOFDGERECHTEN<br/>
            Pizza Margherita - €12.00<br/>
            Klassieke pizza met mozzarella<br/>
            <br/>
            DESSERTS<br/>
            Tiramisu - €6.50<br/>
            Huisgemaakt Italiaans dessert
          </div>
        </div>
      </div>
    </div>
  )
}