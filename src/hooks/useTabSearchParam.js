import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Tab 与 URL ?tab= 双向同步 */
export function useTabSearchParam(validTabs, defaultTab, paramName = 'tab') {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    const tab = searchParams.get(paramName)
    if (validTabs.includes(tab)) setActiveTab(tab)
  }, [searchParams, validTabs, paramName])

  const changeTab = useCallback(
    (tab) => {
      if (!validTabs.includes(tab)) return
      setActiveTab(tab)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set(paramName, tab)
        return next
      })
    },
    [validTabs, paramName, setSearchParams],
  )

  return [activeTab, changeTab]
}
