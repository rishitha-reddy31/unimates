import React, { createContext, useState, useEffect, useContext } from 'react'; 
 
export const ThemeContext = createContext(); 
 
export const ThemeProvider = ({ children }) => { 
  const [isDark, setIsDark] = useState(() => { 
    const savedTheme = localStorage.getItem('theme'); 
    if (savedTheme) { 
      return savedTheme === 'dark'; 
    } 
    return window.matchMedia('(prefers-color-scheme: dark)').matches; 
  }); 
 
  useEffect(() => { 
    if (isDark) { 
      document.documentElement.classList.add('dark'); 
      localStorage.setItem('theme', 'dark'); 
    } else { 
      document.documentElement.classList.remove('dark'); 
      localStorage.setItem('theme', 'light'); 
    } 
  }, [isDark]); 
 
  const toggleTheme = () => { 
    setIsDark(prev => !prev); 
  }; 
 
  const value = { 
    isDark, 
    toggleTheme, 
  }; 
 
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>; 
}; 
 
export const useTheme = () => { 
  const context = useContext(ThemeContext); 
  if (!context) { 
    throw new Error('useTheme must be used within ThemeProvider'); 
  } 
  return context; 
}; 
