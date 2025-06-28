"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { User, Lock, Palette, LogOut } from "lucide-react"
import { updateUserName, updateUserPassword, logoutUser } from "@/app/actions/user"
import { useTheme } from "next-themes"
import type { User as UserType } from "@/lib/db"

interface SettingsContentProps {
  user: UserType
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [nameError, setNameError] = useState<string>("")
  const [nameSuccess, setNameSuccess] = useState<string>("")
  const [nameLoading, setNameLoading] = useState(false)

  const [passwordError, setPasswordError] = useState<string>("")
  const [passwordSuccess, setPasswordSuccess] = useState<string>("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const { theme, setTheme } = useTheme()

  async function handleNameSubmit(formData: FormData) {
    setNameLoading(true)
    setNameError("")
    setNameSuccess("")

    const result = await updateUserName(formData)

    if (result?.error) {
      setNameError(result.error)
    } else if (result?.success) {
      setNameSuccess(result.message || "Nome atualizado com sucesso!")
    }

    setNameLoading(false)
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    const result = await updateUserPassword(formData)

    if (result?.error) {
      setPasswordError(result.error)
    } else if (result?.success) {
      setPasswordSuccess(result.message || "Senha atualizada com sucesso!")
      // Reset form
      const form = document.getElementById("password-form") as HTMLFormElement
      form?.reset()
    }

    setPasswordLoading(false)
  }

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
      await logoutUser()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados pessoais</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Informações do usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
            </div>

            <form action={handleNameSubmit} className="space-y-4">
              {nameError && (
                <Alert variant="destructive">
                  <AlertDescription>{nameError}</AlertDescription>
                </Alert>
              )}

              {nameSuccess && (
                <Alert>
                  <AlertDescription>{nameSuccess}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={user.name} required disabled={nameLoading} />
              </div>

              <Button type="submit" disabled={nameLoading}>
                {nameLoading ? "Salvando..." : "Salvar Nome"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={6}
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  required
                  disabled={passwordLoading}
                />
              </div>

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferências de tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Tema Escuro</Label>
                <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </div>
          </CardContent>
        </Card>

        {/* Sair do sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" />
              Sair do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão abaixo para fazer logout e retornar à tela de login.
            </p>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
