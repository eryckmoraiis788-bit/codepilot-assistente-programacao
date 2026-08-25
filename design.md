# Design do CodePilot

## Objetivo do produto

O **CodePilot** será um assistente de programação orientado ao uso em iPhone. Ele permitirá que a pessoa descreva uma necessidade, cole um trecho de código ou envie uma mensagem de erro e receba uma resposta estruturada: explicação clara, código sugerido ou corrigido, motivos da alteração e passos práticos para testar a solução. O MVP oferecerá suporte amplo a linguagens comuns por meio de seleção de linguagem e contexto, sem prometer execução local de projetos complexos no dispositivo.

## Princípios de interface

A experiência prioriza orientação vertical em proporção 9:16, leitura confortável, uso com uma mão e padrões nativos do iOS. A ação principal fica no rodapé, ao alcance do polegar; as opções secundárias ficam em menus e folhas modais. As telas usam áreas seguras, tipografia com bom contraste, alvos de toque de pelo menos 44 pt e feedback discreto por estado de carregamento e vibração leve.

## Lista de telas

| Tela | Conteúdo principal | Funções |
| --- | --- | --- |
| **Início** | Saudação, ações rápidas e exemplos de pedidos. | Iniciar geração, correção, explicação ou revisão de código. |
| **Assistente** | Histórico da conversa, seletor de linguagem, seletor de tarefa e área de mensagem/código. | Enviar solicitações, colar código, mudar linguagem e receber respostas da IA. |
| **Resultado de código** | Resposta organizada em resumo, diagnóstico, código sugerido e próximos passos. | Copiar trechos, abrir código completo, iniciar uma continuação da conversa. |
| **Histórico** | Lista cronológica das sessões salvas localmente. | Reabrir, renomear ou excluir sessões. |
| **Configurações** | Preferências de tema, linguagem padrão, nível de explicação e avisos de privacidade. | Ajustar o comportamento da experiência e limpar dados locais. |

## Conteúdo e comportamento do assistente

O campo principal aceita linguagem natural, código e erros de compilação ou execução. Antes do envio, a pessoa seleciona uma linguagem (por exemplo, Python, JavaScript, TypeScript, Java, C#, C/C++, PHP, Go, Rust, Swift, Kotlin, SQL, HTML e CSS) e uma intenção: **Criar**, **Corrigir erro**, **Explicar**, **Revisar** ou **Criar testes**. A IA receberá instruções para não inventar a execução de código e para apresentar limitações, requisitos e riscos de forma explícita.

Para correção de erros, a resposta deve separar o diagnóstico, a causa provável, o código corrigido, os testes recomendados e as etapas para validar. Para geração, deve indicar arquivos, dependências e comandos necessários quando forem relevantes. Para revisão, deve destacar legibilidade, falhas aparentes, desempenho e segurança proporcionalmente ao contexto fornecido.

## Fluxos principais

| Fluxo | Etapas |
| --- | --- |
| **Gerar código** | Início → “Criar código” → escolher linguagem → descrever solução → enviar → ler resultado → copiar código ou continuar. |
| **Corrigir erro** | Início → “Corrigir erro” → colar código e mensagem de erro → escolher linguagem → enviar → analisar diagnóstico → copiar correção. |
| **Explicar trecho** | Assistente → escolher “Explicar” → colar trecho → enviar → ler explicação por blocos → continuar a conversa. |
| **Retomar uma sessão** | Histórico → tocar na sessão → revisar mensagens → enviar uma nova pergunta. |
| **Ajustar preferências** | Configurações → escolher linguagem padrão, densidade de explicação e tema → salvar localmente. |

## Cores e identidade visual

| Elemento | Cor | Uso |
| --- | --- | --- |
| **Azul-orbita** | `#2368FF` | Ação principal, ícones ativos e foco. |
| **Índigo-profundo** | `#172A63` | Marca, texto de destaque e cabeçalhos no tema claro. |
| **Névoa** | `#F5F7FC` | Plano de fundo claro e agrupamentos discretos. |
| **Grafite** | `#111827` | Texto principal e código no tema claro. |
| **Superfície-noite** | `#111827` | Fundo escuro e cartões de código. |
| **Ciano-sinal** | `#22D3EE` | Realce de informações e detalhes técnicos. |
| **Verde-validação** | `#16A34A` | Sucesso e itens validados. |
| **Âmbar-alerta** | `#D97706` | Avisos e limitações. |
| **Vermelho-erro** | `#DC2626` | Erros que exigem atenção. |

## Ícone da marca

O ícone aprovado para o CodePilot usa fundo índigo profundo, dois colchetes angulares em ciano e uma centelha branca ao centro. A composição comunica programação e assistência inteligente sem depender de texto, preservando legibilidade em tamanhos reduzidos de lançador do iPhone.

## Modelo de dados inicial

As conversas serão preservadas somente no dispositivo no MVP. Uma sessão possui identificador, título, data de atualização, linguagem selecionada, intenção selecionada e mensagens. Cada mensagem possui papel (pessoa ou assistente), conteúdo, data e, opcionalmente, blocos de código com linguagem associada. Preferências incluem linguagem padrão, tema, profundidade de explicação e confirmação para limpar o histórico.

## Limites do MVP

O aplicativo oferecerá assistência baseada em IA e suporte para múltiplas linguagens, mas não fará compilação nem executará código arbitrário no iPhone. As respostas devem ser revisadas e testadas pelo usuário antes de uso em produção. Integração com arquivos de projetos, sincronização entre dispositivos e conta de usuário ficam como evolução posterior, caso sejam necessários.
