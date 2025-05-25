'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue(lightValue, darkValue) {
  const { theme } = useTheme()
  const [value, setValue] = useState(lightValue)

  useEffect(() => {
    setValue(theme === 'dark' ? darkValue : lightValue)
  }, [theme, lightValue, darkValue])

  return value
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

export function ColorModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8" /> // Placeholder with same size
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? <LuSun /> : <LuMoon />}
    </button>
  )
}

export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <Span
      color='fg'
      display='contents'
      className='chakra-theme light'
      colorPalette='gray'
      colorScheme='light'
      ref={ref}
      {...props}
    />
  )
})

export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <Span
      color='fg'
      display='contents'
      className='chakra-theme dark'
      colorPalette='gray'
      colorScheme='dark'
      ref={ref}
      {...props}
    />
  )
})
