import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function RgpdPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">RGPD — Regulamento Geral de Proteção de Dados</CardTitle>
          <p className="text-sm text-muted-foreground">Última atualização: 1 de Janeiro de 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <h3>1. Conformidade com o RGPD</h3>
          <p>
            A FIND4SPORT está em conformidade com o Regulamento (UE) 2016/679 do Parlamento Europeu
            e do Conselho, relativo à proteção das pessoas singulares no que diz respeito ao
            tratamento de dados pessoais (RGPD).
          </p>

          <h3>2. Princípios do Tratamento</h3>
          <p>Seguimos os seguintes princípios no tratamento dos seus dados:</p>
          <ul>
            <li><strong>Licitude, lealdade e transparência:</strong> tratamos os seus dados de forma lícita, leal e transparente</li>
            <li><strong>Limitação das finalidades:</strong> recolhemos dados apenas para fins determinados e legítimos</li>
            <li><strong>Minimização:</strong> recolhemos apenas os dados necessários para as finalidades pretendidas</li>
            <li><strong>Exatidão:</strong> mantemos os seus dados exatos e atualizados</li>
            <li><strong>Limitação da conservação:</strong> conservamos os dados apenas pelo período necessário</li>
            <li><strong>Integridade e confidencialidade:</strong> garantimos a segurança dos seus dados</li>
          </ul>

          <h3>3. Encarregado de Proteção de Dados (DPO)</h3>
          <p>
            Designámos um Encarregado de Proteção de Dados que pode ser contactado através de:
            <br />
            Email: <a href="mailto:dpo@find4sport.pt" className="text-primary hover:underline">dpo@find4sport.pt</a>
          </p>

          <h3>4. Transferências Internacionais</h3>
          <p>
            Os seus dados são armazenados em servidores localizados na União Europeia. Quando
            recorrermos a prestadores de serviços fora da UE, garantimos que existem garantias
            adequadas ao abrigo do RGPD.
          </p>

          <h3>5. Avaliação de Impacto</h3>
          <p>
            Realizamos avaliações de impacto sobre a proteção de dados (AIPD) para identificar
            e mitigar riscos associados ao tratamento de dados pessoais.
          </p>

          <h3>6. Notificação de Violações</h3>
          <p>
            Em caso de violação de dados pessoais que represente risco para os seus direitos e
            liberdades, notificaremos a CNPD no prazo de 72 horas e comunicaremos a situação
            aos titulares dos dados afetados.
          </p>

          <h3>7. Exercício de Direitos</h3>
          <p>Para exercer os seus direitos ao abrigo do RGPD, pode:</p>
          <ul>
            <li>Aceder à secção "Definições" na sua conta</li>
            <li>Enviar email para <a href="mailto:info@find4sport.pt" className="text-primary hover:underline">info@find4sport.pt</a></li>
            <li>Contactar o nosso DPO em <a href="mailto:dpo@find4sport.pt" className="text-primary hover:underline">dpo@find4sport.pt</a></li>
          </ul>
          <p>Responderemos ao seu pedido no prazo máximo de 30 dias.</p>

          <h3>8. Reclamações</h3>
          <p>
            Se considerar que o tratamento dos seus dados viola o RGPD, tem direito a apresentar
            reclamação à autoridade de controlo competente:
          </p>
          <p>
            <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>
            <br />
            Av. D. Carlos I, 134 — 1.º
            <br />
            1200-651 Lisboa
            <br />
            <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              www.cnpd.pt
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
      <Footer />
    </>
  )
}
