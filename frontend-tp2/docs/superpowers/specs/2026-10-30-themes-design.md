# Temas da aplicação
Design aprovado na conversa: seletor Claro / Escuro / Sistema no menu compartilhado; Sistema no primeiro acesso; preferência persistida localmente; todas as telas acompanham a seleção. Preservar o visual escuro e criar uma paleta clara acessível. Sem dependências ou alterações no backend.

## Abordagens
Alternância manual: simples, mas não acompanha o Windows. Claro/Escuro/Sistema: opção escolhida pelo usuário; requer ouvir mudanças do sistema e guardar a preferência.

## Implementação
ThemeService controla um atributo data-theme no HTML. Inicialização antes das rotas e script inicial no head evitam divergências ao abrir. Variáveis CSS semânticas substituem cores de interface fixas; amostras de cores de veículos permanecem literais.
