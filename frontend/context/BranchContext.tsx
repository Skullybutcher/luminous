// context/BranchContext.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface Branch {
  id: string
  name: string
  status: "open" | "closing" | "closed"
}

interface BranchContextType {
  activeBranch: Branch | null
  setActiveBranch: (b: Branch) => void
  branches: Branch[]
  loading: boolean
  error: string | null
}

const BranchContext = createContext<BranchContextType>({} as BranchContextType)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchBranches = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/branches")
        if (!res.ok) {
          throw new Error("Failed to load branches")
        }
        const payload = await res.json()
        if (!active) return

        const normalized = (payload.data ?? []).map((branch: any) => ({
          id: String(branch._id ?? branch.id),
          name: branch.name,
          status: branch.status ?? "open",
        }))

        setBranches(normalized)

        const savedId = localStorage.getItem("activeBranchId")
        const preferred = savedId
          ? normalized.find((branch) => branch.id === savedId)
          : normalized[0]
        if (preferred) {
          setActiveBranchState(preferred)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load branches")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchBranches()
    return () => {
      active = false
    }
  }, [])

  const setActiveBranch = (b: Branch) => {
    setActiveBranchState(b)
    localStorage.setItem("activeBranchId", b.id)
  }

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch, branches, loading, error }}>
      {children}
    </BranchContext.Provider>
  )
}

export const useBranch = () => useContext(BranchContext)
