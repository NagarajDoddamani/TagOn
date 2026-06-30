import { useState, useEffect } from 'react'

export default function SearchComponent({ 
  value = '', 
  onChange, 
  onSearch, 
  placeholder = 'Search...', 
  className = '' 
}) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(internalValue)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}