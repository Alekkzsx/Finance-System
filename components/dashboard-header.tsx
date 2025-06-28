"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, Wifi } from "lucide-react"
import { logout } from "@/app/actions/auth"
import type { User } from "@/lib/db"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [localIP, setLocalIP] = useState<string>("Carregando...")

  useEffect(() => {
    // Tentar obter o IP local do cliente
    const getLocalIP = async () => {
      try {
        // Método usando WebRTC para obter IP local
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        })

        pc.createDataChannel("")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
            if (ipMatch && ipMatch[1] !== "127.0.0.1") {
              setLocalIP(ipMatch[1])
              pc.close()
            }
          }
        }
      } catch (error) {
        // Fallback: mostrar hostname se disponível
        setLocalIP(window.location.hostname || "localhost")
      }
    }

    getLocalIP()
  }, [])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
            <p className="text-gray-600">Bem-vindo, {user.name}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">
                    IP Local: <strong>{localIP}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
