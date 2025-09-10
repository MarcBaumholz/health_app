import { useState, useRef, useEffect } from 'react'
import { Button } from '@components/ui'

// Common emoji shortcuts mapping
const EMOJI_SHORTCUTS: Record<string, string> = {
  ':waterdrop:': '💧',
  ':water:': '💧',
  ':droplet:': '💧',
  ':coffee:': '☕️',
  ':coffee_break:': '☕️',
  ':break:': '☕️',
  ':pause:': '⏸️',
  ':eye:': '👀',
  ':eyes:': '👀',
  ':vision:': '👀',
  ':exercise:': '🏋️',
  ':workout:': '💪',
  ':fitness:': '🏃',
  ':chair:': '🪑',
  ':posture:': '🪑',
  ':standing:': '🧍',
  ':stand:': '🧍',
  ':walk:': '🚶',
  ':walking:': '🚶',
  ':stretch:': '🤸',
  ':stretching:': '🤸',
  ':meditation:': '🧘',
  ':breathe:': '🫁',
  ':breathing:': '🫁',
  ':sleep:': '😴',
  ':rest:': '😴',
  ':food:': '🍎',
  ':eat:': '🍎',
  ':apple:': '🍎',
  ':healthy:': '🥗',
  ':salad:': '🥗',
  ':water_glass:': '🥤',
  ':drink:': '🥤',
  ':book:': '📚',
  ':read:': '📚',
  ':reading:': '📚',
  ':music:': '🎵',
  ':listen:': '🎵',
  ':phone:': '📞',
  ':call:': '📞',
  ':message:': '💬',
  ':chat:': '💬',
  ':work:': '💼',
  ':office:': '💼',
  ':computer:': '💻',
  ':laptop:': '💻',
  ':screen:': '🖥️',
  ':monitor:': '🖥️',
  ':sun:': '☀️',
  ':sunlight:': '☀️',
  ':moon:': '🌙',
  ':night:': '🌙',
  ':star:': '⭐',
  ':stars:': '⭐',
  ':heart:': '❤️',
  ':love:': '❤️',
  ':thumbs_up:': '👍',
  ':good:': '👍',
  ':great:': '👍',
  ':fire:': '🔥',
  ':hot:': '🔥',
  ':ice:': '🧊',
  ':cold:': '🧊',
  ':check:': '✅',
  ':done:': '✅',
  ':complete:': '✅',
  ':cross:': '❌',
  ':no:': '❌',
  ':warning:': '⚠️',
  ':alert:': '⚠️',
  ':info:': 'ℹ️',
  ':question:': '❓',
  ':help:': '❓',
  ':lightbulb:': '💡',
  ':idea:': '💡',
  ':rocket:': '🚀',
  ':launch:': '🚀',
  ':target:': '🎯',
  ':goal:': '🎯',
  ':trophy:': '🏆',
  ':win:': '🏆',
  ':medal:': '🏅',
  ':award:': '🏅',
  ':clock:': '🕐',
  ':time:': '🕐',
  ':timer:': '⏰',
  ':alarm:': '⏰',
  ':calendar:': '📅',
  ':date:': '📅',
  ':schedule:': '📅',
  ':note:': '📝',
  ':write:': '📝',
  ':writing:': '📝',
  ':pencil:': '✏️',
  ':pen:': '✏️',
  ':paper:': '📄',
  ':document:': '📄',
  ':folder:': '📁',
  ':file:': '📁',
  ':trash:': '🗑️',
  ':delete:': '🗑️',
  ':recycle:': '♻️',
  ':refresh:': '🔄',
  ':repeat:': '🔄',
  ':plus:': '➕',
  ':add:': '➕',
  ':minus:': '➖',
  ':remove:': '➖',
  ':equal:': '🟰',
  ':equals:': '🟰',
  ':arrow_up:': '⬆️',
  ':up:': '⬆️',
  ':arrow_down:': '⬇️',
  ':down:': '⬇️',
  ':arrow_left:': '⬅️',
  ':left:': '⬅️',
  ':arrow_right:': '➡️',
  ':right:': '➡️',
  ':up_arrow:': '⬆️',
  ':down_arrow:': '⬇️',
  ':left_arrow:': '⬅️',
  ':right_arrow:': '➡️',
}

// All emojis in one flat list for easy scrolling
const ALL_EMOJIS = [
  // Aktivitäten
  '💧', '☕️', '👀', '🏋️', '🧍', '🚶', '🤸', '🧘', '🫁', '😴', '⏸️', '🏃', '💪', '🤾', '🏊', '🚴', '🏄', '🧗', '🤺', '🏇',
  // Essen & Trinken
  '🍎', '🥗', '🥤', '🍽️', '🥛', '🧊', '🍵', '🍌', '🥕', '🥒', '🍅', '🥑', '🥜', '🍇', '🍓', '🍊', '🍋', '🍑', '🥭', '🍍',
  // Arbeit & Technik
  '💻', '🖥️', '📱', '⌨️', '🖱️', '📞', '💼', '📊', '📈', '📉', '📋', '📌', '📎', '🗂️', '📑', '📖', '📝', '✏️', '📄', '📁',
  // Gesundheit
  '❤️', '🫀', '🫁', '🧠', '🦷', '👁️', '👂', '🤲', '🦵', '🦶', '🦴', '🩸', '🩹', '💊', '💉', '🩺', '🧬', '🦠', '🧪', '🔬',
  // Natur & Wetter
  '☀️', '🌙', '⭐', '🌧️', '❄️', '🌈', '🌱', '🌿', '🌳', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌾', '🍀', '🌲', '🌵', '🌴',
  // Emotionen
  '😊', '😢', '😴', '🤔', '😮', '😍', '🥳', '😤', '😌', '😎', '😋', '🤗', '😇', '🤩', '🥰', '😘', '😗', '😙', '😚', '😛',
  // Symbole
  '✅', '❌', '⚠️', 'ℹ️', '❓', '💡', '🎯', '🏆', '🏅', '⭐', '🔥', '💯', '💎', '💍', '💎', '🔮', '🎲', '🎯', '🎪', '🎨',
  // Zeit & Kalender
  '🕐', '⏰', '📅', '⏱️', '⏲️', '🕰️', '📆', '🗓️', '⏳', '⌛', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚',
  // Aktionen
  '➕', '➖', '🔄', '♻️', '🗑️', '⬆️', '⬇️', '⬅️', '➡️', '🎯', '🔍', '🔎', '🔐', '🔓', '🔒', '🔑', '🗝️', '🔧', '🔨', '⚒️',
  // Zusätzliche beliebte Emojis
  '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍪', '🍩', '🍭', '🍬', '🍫', '🍯', '🧈', '🧀', '🥚', '🍳', '🥓', '🥞'
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  placeholder?: string
}

export function EmojiPicker({ value, onChange, placeholder = "Emoji auswählen" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Handle emoji shortcuts
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setSearchTerm(inputValue)
    
    // Check for emoji shortcuts
    if (inputValue.includes(':')) {
      const shortcutMatch = inputValue.match(/:([^:]+):/)
      if (shortcutMatch) {
        const shortcut = `:${shortcutMatch[1]}:`
        const emoji = EMOJI_SHORTCUTS[shortcut.toLowerCase()]
        if (emoji) {
          onChange(emoji)
          setSearchTerm('')
          return
        }
      }
    }
    
    onChange(inputValue)
  }

  // Handle emoji selection - immediate save
  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter emojis based on search term
  const getFilteredEmojis = () => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      // Search in shortcuts first
      const shortcutMatches = Object.entries(EMOJI_SHORTCUTS)
        .filter(([shortcut, emoji]) => 
          shortcut.toLowerCase().includes(searchLower)
        )
        .map(([shortcut, emoji]) => ({ shortcut, emoji }))
      
      // Search in emoji list
      const emojiMatches = ALL_EMOJIS
        .filter(emoji => emoji.includes(searchTerm))
        .map(emoji => ({ emoji }))
      
      return [...shortcutMatches, ...emojiMatches]
    }
    return ALL_EMOJIS.map(emoji => ({ emoji }))
  }

  const filteredEmojis = getFilteredEmojis()

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm || value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
              {value}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          {isOpen ? '✕' : '😀'}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Emojis suchen oder :shortcut: eingeben"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Emoji Grid - Simple scrollable list */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-10 gap-1">
              {filteredEmojis.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(item.emoji)}
                  className="p-2 text-lg hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:scale-110 active:scale-95"
                  title={item.shortcut ? `${item.emoji} (${item.shortcut})` : item.emoji}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
            
            {filteredEmojis.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">🔍</div>
                <div>Keine Emojis gefunden</div>
                <div className="text-sm text-gray-400 mt-1">Versuche einen anderen Suchbegriff</div>
              </div>
            )}
          </div>

          {/* Shortcuts Help */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <div className="font-medium mb-2">Beliebte Shortcuts:</div>
            <div className="flex flex-wrap gap-1">
              {[':waterdrop:', ':coffee:', ':eye:', ':exercise:', ':chair:', ':standing:'].map(shortcut => (
                <button
                  key={shortcut}
                  onClick={() => {
                    const emoji = EMOJI_SHORTCUTS[shortcut]
                    if (emoji) {
                      handleEmojiSelect(emoji)
                    }
                  }}
                  className="px-2 py-1 bg-white rounded text-xs hover:bg-blue-100 transition-colors"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
