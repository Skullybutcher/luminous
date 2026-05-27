// context/BranchContext.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface Branch {
  id: number
  name: string
  status: "open" | "closing" | "closed"
}

interface BranchContextType {
  activeBranch: Branch
  setActiveBranch: (b: Branch) => void
  branches: Branch[]
}

const branches: Branch[] = [
  { id: 1, name: "Banjara Hills", status: "open" },
  { id: 2, name: "Jubilee Hills", status: "open" },
  { id: 3, name: "Madhapur", status: "closing" },
]

const BranchContext = createContext<BranchContextType>({} as BranchContextType)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [activeBranch, setActiveBranchState] = useState<Branch>(branches[0])

  useEffect(() => {
    const saved = localStorage.getItem("activeBranch")
    if (saved) {
      try {
        setActiveBranchState(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const setActiveBranch = (b: Branch) => {
    setActiveBranchState(b)
    localStorage.setItem("activeBranch", JSON.stringify(b))
  }

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch, branches }}>
      {children}
    </BranchContext.Provider>
  )
}

export const useBranch = () => useContext(BranchContext)
