import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function CookiesPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Política de Cookies</CardTitle>
          <p className="text-sm text-muted-foreground">Última atualização: 1 de Janeiro de 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <h3>1. O que são Cookies?</h3>
          <p>
            Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita
            um site. Permitem que o site se lembre das suas preferências e melhore a sua experiência.
          </p>

          <h3>2. Tipos de Cookies Utilizados</h3>

          <h4>Cookies Essenciais</h4>
          <p>
            Necessários para o funcionamento básico da plataforma. Permitem a autenticação e a
            navegação segura. Não podem ser desativados.
          </p>

          <h4>Cookies de Funcionalidade</h4>
          <p>
            Permitem lembrar as suas preferências, como idioma e localização, para oferecer uma
            experiência personalizada.
          </p>

          <h4>Cookies de Analítica</h4>
          <p>
            Recolhem informações anónimas sobre como os utilizadores interagem com a plataforma,
            ajudando-nos a melhorar o serviço.
          </p>

          <h4>Cookies de Marketing</h4>
          <p>
            Utilizados para apresentar anúncios relevantes e medir a eficácia de campanhas
            publicitárias.
          </p>

          <h3>3. Cookies de Terceiros</h3>
          <p>
            Utilizamos serviços de terceiros como Google Analytics e Stripe que podem definir
            os seus próprios cookies. Consulte as políticas de privacidade desses serviços para
            mais informações.
          </p>

          <h3>4. Gestão de Cookies</h3>
          <p>
            Pode controlar e gerir os cookies através das definições do seu navegador. Note que
            a desativação de cookies essenciais pode afetar o funcionamento da plataforma.
          </p>
          <p>Instruções para os navegadores mais comuns:</p>
          <ul>
            <li><strong>Chrome:</strong> Definições → Privacidade e segurança → Cookies</li>
            <li><strong>Firefox:</strong> Opções → Privacidade e segurança → Cookies</li>
            <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
            <li><strong>Edge:</strong> Definições → Cookies e permissões → Cookies</li>
          </ul>

          <h3>5. Consentimento</h3>
          <p>
            Ao utilizar a plataforma, concorda com a utilização de cookies conforme descrito
            nesta política. Pode retirar o seu consentimento a qualquer momento através das
            definições do navegador.
          </p>

          <h3>6. Contacto</h3>
          <p>
            Para mais informações sobre a nossa política de cookies, contacte-nos através de{' '}
            <a href="mailto:info@find4sport.pt" className="text-primary hover:underline">
              info@find4sport.pt
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
      <Footer />
    </>
  )
}
