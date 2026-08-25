# Diagnóstico de compilação iOS

O CodePilot foi enviado ao repositório privado `eryckmoraiis788-bit/codepilot-assistente-programacao` com o fluxo `Build CodePilot IPA`, baseado no padrão do repositório de referência `iOS-App`.

A primeira execução do GitHub Actions, identificada como `32865396426`, falhou antes de iniciar qualquer etapa do fluxo. A API mostrou que o repositório permite GitHub Actions e que o workflow está ativo, mas não disponibilizou o log da execução para o token conectado. A tentativa de visualizar a página da execução no navegador sem uma sessão GitHub autenticada retornou uma página não encontrada.

O próximo diagnóstico depende de abrir a execução autenticada em `https://github.com/eryckmoraiis788-bit/codepilot-assistente-programacao/actions/runs/32865396426` para consultar a mensagem exibida pelo GitHub antes da alocação do executor macOS.

## Regra de cobrança confirmada

A documentação oficial do GitHub confirma que o uso de executores padrão hospedados pelo GitHub é gratuito em repositórios públicos. Isso inclui a categoria padrão de executor macOS usada pelo fluxo de IPA; executores maiores continuam cobrados mesmo em repositórios públicos. Portanto, mudar o repositório do CodePilot para público é uma alternativa tecnicamente adequada ao bloqueio atual, desde que o código e o histórico possam ser publicados sem expor segredos.

Fontes consultadas:

- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/billing/reference/actions-runner-pricing
- https://docs.github.com/en/actions/concepts/billing-and-usage
