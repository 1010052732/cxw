import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { INITIAL_MESSAGES } from '../mock/message'

const LOCALE_KEY = 'dt-locale'
const MSG_KEY = 'dt-messages'

export const LOCALE_OPTIONS = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
]

export const I18N = {
  'zh-CN': {
    platform: '数智分析平台',
    profile: '个人中心',
    logout: '退出登录',
    messages: '消息中心',
    dataScope: '数据范围',
    home: '首页',
  },
  'en-US': {
    platform: 'Intelligence Platform',
    profile: 'Profile',
    logout: 'Sign out',
    messages: 'Messages',
    dataScope: 'Data scope',
    home: 'Home',
  },
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(MSG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return INITIAL_MESSAGES.map((m) => ({ ...m }))
}

const PlatformContext = createContext(null)

export function PlatformProvider({ children }) {
  const [locale, setLocaleState] = useState(() => localStorage.getItem(LOCALE_KEY) || 'zh-CN')
  const [messages, setMessages] = useState(loadMessages)

  const setLocale = useCallback((val) => {
    setLocaleState(val)
    localStorage.setItem(LOCALE_KEY, val)
  }, [])

  const persistMessages = useCallback((next) => {
    setMessages(next)
    localStorage.setItem(MSG_KEY, JSON.stringify(next))
  }, [])

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages])

  const markRead = useCallback(
    (id) => {
      persistMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)))
    },
    [messages, persistMessages],
  )

  const markAllRead = useCallback(() => {
    persistMessages(messages.map((m) => ({ ...m, read: true })))
  }, [messages, persistMessages])

  const removeMessage = useCallback(
    (id) => {
      persistMessages(messages.filter((m) => m.id !== id))
    },
    [messages, persistMessages],
  )

  const t = useCallback((key) => I18N[locale]?.[key] || I18N['zh-CN'][key] || key, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      messages,
      setMessages: persistMessages,
      unreadCount,
      markRead,
      markAllRead,
      removeMessage,
    }),
    [locale, setLocale, t, messages, persistMessages, unreadCount, markRead, markAllRead, removeMessage],
  )

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider')
  return ctx
}
