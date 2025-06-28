import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Shield, Users, Smartphone } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Controle Financeiro
            <span className="text-blue-600"> Pessoal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerencie suas receitas e despesas de forma simples e segura. Acesse de qualquer dispositivo na sua rede
            local.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/register">Começar Agora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Controle Total</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Acompanhe todas suas receitas e despesas em um só lugar
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Seus dados ficam protegidos e isolados por usuário
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Multi-usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Suporte para múltiplos usuários simultâneos</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Responsivo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Acesse de qualquer dispositivo na sua rede</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">✅ Gestão Completa</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cadastro de receitas e despesas</li>
                  <li>• Edição e exclusão de transações</li>
                  <li>• Resumo financeiro automático</li>
                  <li>• Cálculo de saldo em tempo real</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">🔒 Segurança</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Login seguro com criptografia</li>
                  <li>• Dados isolados por usuário</li>
                  <li>• Sessões protegidas</li>
                  <li>• Acesso em rede local</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
