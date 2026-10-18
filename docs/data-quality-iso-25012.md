# Qualidade de dados — aplicação local de ISO/IEC 25012

Registo técnico de implementação para dimensões de exatidão sintática, completude, consistência e atualidade nos fluxos de pesquisa, perfil de profissional/espaço e criação/edição de evento. Esta implementação é uma melhoria de produto alinhada com essas dimensões; não constitui certificação nem avaliação formal de conformidade ISO.

## Controlos aplicados

- Texto de entrada é normalizado em Unicode NFC, tem controlos removidos, espaços compactados e limites de comprimento aplicados no servidor.
- Email, telefone e website opcionais são validados antes de persistir. Websites aceitam HTTP/HTTPS e recebem HTTPS quando o esquema é omitido.
- Raio de serviço é limitado a 0–500 km; listas de modalidades e comodidades são limitadas/deduplicadas nos fluxos aplicáveis.
- Título do evento requer conteúdo mínimo; números opcionais não aceitam coerções vazias ou texto parcial.
- Datas de evento aceitam só datas ISO ou data/hora local explícita, verificam calendário/horas e mantêm a regra fim posterior ao início.
- Filtros numéricos de pesquisa aceitam apenas números completos no intervalo definido; filtros de data já verificam validade de calendário e ordem.

## Evidência e limites

Os testes unitários em `tests/data-quality-inputs.test.mjs` e `tests/search-filters.test.mjs` cobrem normalização, contactos, datas e valores-limite. As ações de servidor mantêm a validação como autoridade mesmo quando a interface já tem validações HTML.

Este trabalho não migra nem corrige registos existentes, não verifica entregabilidade de email/telefone, não confirma a propriedade de URLs, nem torna gravações multi-tabela transacionais. Endereços e coordenadas continuam sujeitos ao resultado best-effort do geocodificador externo. A aplicação cobre fluxos identificados e não representa inventário exaustivo de cada formulário do produto.
