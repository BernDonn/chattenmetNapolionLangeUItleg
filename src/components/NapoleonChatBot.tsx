'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import ResponseActions from './ResponseActions'

interface ChatMessage {
  id: string
  role: 'user' | 'napoleon'
  content: string
  timestamp: Date
}

export default function NapoleonChatBot() {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Napoleon's personality prompt
  const napoleonPrompt = `Je bent Napoleon Bonaparte, de Franse keizer (1769-1821). Je spreekt in de eerste persoon als Napoleon zelf. 

BELANGRIJKE INSTRUCTIES:
- Spreek altijd in het Nederlands
- Gebruik "ik", "mij", "mijn" (niet "hij" of "Napoleon")
- Blijf in karakter als de historische Napoleon
- Wees trots, charismatisch en zelfverzekerd zoals Napoleon was
- Verwijs naar je echte historische ervaringen en gebeurtenissen
- Gebruik soms Franse uitdrukkingen zoals "Mon Dieu!", "Sacré bleu!", "Mes amis"
- Toon je militaire genialiteit en politieke visie
- Wees educatief maar boeiend voor HAVO 5 leerlingen

ONDERWERPEN DIE JE GOED KENT:
- Je jeugd op Corsica en militaire opleiding
- Franse Revolutie en je opkomst
- Je veldslagen en militaire strategieën
- Je tijd als Consul en later Keizer
- Code Napoleon en je hervormingen
- Je relaties (Joséphine, Marie-Louise)
- Continentaal Stelsel tegen Engeland
- Russische campagne van 1812
- Ballingschap op Elba en de Honderd Dagen
- Waterloo en Sint-Helena
- Je nalatenschap en invloed op Europa

Antwoord altijd vanuit Napoleon's perspectief met zijn trots, ambitie en historische kennis.`;

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'napoleon',
      content: `**Bonjour mes amis!** 👑

Ik ben **Napoleon Bonaparte**, Keizer der Fransen! Het is mij een eer om met jullie, jonge geleerden, te spreken over mijn leven en de geschiedenis van Europa.

Ik heb continenten veroverd, wetten geschreven die nog steeds bestaan, en de loop van de geschiedenis veranderd. Van mijn geboorte op Corsica tot mijn ballingschap op Sint-Helena - vraag mij alles wat je wilt weten!

*Wat zou je graag willen bespreken? Mijn veldslagen? Mijn liefdes? De Franse Revolutie? Of misschien hoe ik van een eenvoudige artillerieofficier keizer werd?*

**Vive la France!** 🇫🇷`,
      timestamp: new Date()
    }
    setChatHistory([welcomeMessage])
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, streamingResponse])

  const sendMessage = async () => {
    if (!message.trim() || isLoading || isStreaming) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)
    setStreamingResponse('')

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const fullPrompt = `${napoleonPrompt}

GESPREKGESCHIEDENIS:
${chatHistory.map(msg => `${msg.role === 'user' ? 'Leerling' : 'Napoleon'}: ${msg.content}`).join('\n')}

NIEUWE VRAAG VAN LEERLING: ${userMessage.content}

Antwoord als Napoleon Bonaparte in het Nederlands:`

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: fullPrompt,
          aiModel: 'smart' // Use Gemini 2.5 Flash for good balance
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setIsLoading(false)
      setIsStreaming(true)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentResponse = ''

      if (!reader) {
        throw new Error('No readable stream available')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.message || 'Streaming error')
              }
              
              if (data.done) {
                // Stream completed
                const napoleonMessage: ChatMessage = {
                  id: `napoleon-${Date.now()}`,
                  role: 'napoleon',
                  content: currentResponse,
                  timestamp: new Date()
                }
                setChatHistory(prev => [...prev, napoleonMessage])
                setStreamingResponse('')
                setIsStreaming(false)
                return
              }
              
              if (data.token) {
                currentResponse += data.token
                setStreamingResponse(currentResponse)
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError)
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error)
      
      if (error.name !== 'AbortError') {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'napoleon',
          content: `*Mon Dieu!* Er is een probleem opgetreden. Zelfs een keizer heeft soms technische moeilijkheden! Probeer het nog eens, mes amis.`,
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setChatHistory([])
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-new',
      role: 'napoleon',
      content: `**Me voilà!** Ik ben terug! 👑

Laten we opnieuw beginnen, mes amis. Wat wil je weten over mijn leven als keizer, mijn veldslagen, of de geschiedenis van Frankrijk?`,
      timestamp: new Date()
    }
    setChatHistory([welcomeMessage])
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-4 border-b border-blue-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Napoleon Bonaparte</h3>
              <p className="text-blue-200 text-sm">Keizer der Fransen • 1769-1821</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            title="Nieuw gesprek"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/20 to-indigo-50/20"
      >
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/90 text-gray-800 border border-yellow-200'
              }`}
            >
              {msg.role === 'napoleon' && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">👑</span>
                  <span className="font-semibold text-blue-800">Napoleon</span>
                </div>
              )}
              
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <div>
                  <MarkdownRenderer content={msg.content} className="text-sm" />
                  <ResponseActions 
                    content={msg.content}
                    isMarkdown={true}
                    isStreaming={false}
                    className="mt-2"
                  />
                </div>
              )}
              
              <div className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Response */}
        {isStreaming && streamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white/90 text-gray-800 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">👑</span>
                <span className="font-semibold text-blue-800">Napoleon</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <MarkdownRenderer content={streamingResponse} className="text-sm" />
              <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-text-bottom"></span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white/90 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👑</span>
                <span className="font-semibold text-blue-800">Napoleon</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">De keizer denkt na...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-r from-blue-800/50 to-indigo-800/50 border-t border-blue-400/30">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stel Napoleon een vraag over zijn leven, veldslagen, of de geschiedenis..."
              className="w-full p-3 border border-blue-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/90"
              rows={2}
              disabled={isLoading || isStreaming}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={isLoading || isStreaming || !message.trim()}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading || isStreaming ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Wacht...</span>
              </>
            ) : (
              <>
                <span>⚔️</span>
                <span>Verstuur</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-blue-200">
          💡 Tip: Vraag naar specifieke veldslagen, zijn jeugd, politieke hervormingen, of zijn tijd in ballingschap!
        </div>
      </div>
    </div>
  )
}