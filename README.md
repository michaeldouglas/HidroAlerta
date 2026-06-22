# HidroAlerta

Aplicativo multiplataforma para monitoramento inteligente da qualidade e da disponibilidade da água. O projeto reúne leituras de sensores, histórico, alertas, relatórios em PDF e uma interface conversacional para ajudar o usuário a interpretar os dados.

## Recursos

- Painel com qualidade geral, nível da caixa, pH, turbidez e temperatura.
- Telas detalhadas com faixa recomendada, status e informações contextuais.
- Histórico por indicador, períodos selecionáveis e estatísticas de mínimo, média e máximo.
- Relatórios em PDF com compartilhamento no Android/iOS e impressão no navegador.
- Alertas filtráveis, histórico de ocorrências e marcação de leitura.
- HidroIA com chat animado, perguntas sugeridas e atalhos contextuais em todo o app.
- Gravação, envio e reprodução de mensagens de voz.
- Configurações de unidades, notificações, usuários, rede, backup e dados.
- Estado real da conexão atual com tipo de rede e endereço IP.
- Interface responsiva para Android, iOS e web.

> [!IMPORTANT]
> As leituras atuais e as respostas da HidroIA são dados demonstrativos locais. Uma IA real, transcrição de voz e dados de sensores em produção exigem integração com um backend. Nunca coloque chaves privadas de API diretamente no aplicativo.

## Tecnologias

- Expo SDK 56
- React 19 e React Native 0.85
- Expo Router
- TypeScript em modo estrito
- React Native Reanimated
- React Native SVG
- Expo Audio, Network, Print, Sharing e File System
- Expo Symbols

## Pré-requisitos

- Node.js compatível com o Expo SDK 56
- npm
- Expo Go para testes rápidos
- Android Studio para emulador ou build nativo Android
- macOS com Xcode para build nativo iOS, ou EAS Build

## Instalação

```bash
npm install
npm start
```

Atalhos disponíveis no terminal do Expo permitem abrir Android, iOS ou web. Também é possível executar diretamente:

```bash
npm run android
npm run ios
npm run web
```

Para reiniciar o Metro removendo o cache:

```bash
npm run start:clear
```

## Expo Go e builds nativos

O Expo Go é suficiente para validar grande parte da interface, áudio e navegação. Entretanto, desde o SDK 52 ele não reproduz fielmente o ícone e o splash screen configurados pelo aplicativo.

Para testar a experiência nativa real no Android:

```bash
npx expo run:android
```

Depois de alterar ícone, splash ou plugins nativos, reconstrua e reinstale o aplicativo. Em alguns aparelhos também é necessário desinstalar a versão anterior para limpar o ícone armazenado pelo launcher.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm start` | Inicia o Metro Bundler |
| `npm run start:clear` | Inicia o Metro limpando o cache |
| `npm run android` | Abre o projeto no Android |
| `npm run ios` | Abre o projeto no iOS |
| `npm run web` | Abre a versão web |
| `npm run lint` | Executa o ESLint recomendado pelo Expo |
| `npm run typecheck` | Valida o TypeScript sem gerar arquivos |
| `npm run check` | Executa lint e TypeScript |
| `npm run generate:brand` | Regenera ícones e splash a partir do HydroBot SVG |

## Organização do projeto

```text
src/
├── app/                         # Rotas finas do Expo Router
├── features/
│   ├── about/                   # Informações institucionais
│   ├── alerts/                  # Alertas e histórico de ocorrências
│   ├── assistant/               # HidroIA, áudio e ações contextuais
│   ├── history/                 # Gráficos, períodos e PDF
│   ├── home/                    # Painel principal
│   ├── monitoring/              # Nível, pH, turbidez e temperatura
│   └── settings/                # Configurações e preferências
└── shared/
    ├── components/              # Navegação, ícones e HydroBot
    ├── constants/               # Cores compartilhadas
    ├── contexts/                # Atualização e acesso às telas
    └── hooks/                   # Hooks reutilizáveis

assets/
├── branding/hydrobot.svg        # Fonte vetorial da identidade
└── images/                      # Assets gerados para as plataformas
```

As rotas em `src/app` devem permanecer pequenas. A implementação de cada tela pertence ao domínio correspondente dentro de `src/features`.

## HidroIA

A HidroIA pode ser aberta pela navegação inferior ou por botões contextuais presentes em:

- qualidade da água;
- nível da caixa;
- pH, turbidez e temperatura;
- histórico;
- alertas.

Esses botões enviam automaticamente ao chat uma pergunta com o contexto da tela. Atualmente as respostas são produzidas localmente com regras demonstrativas.

Para uma integração real, use um backend para:

1. receber a pergunta e o contexto das leituras;
2. autenticar com o provedor de IA sem expor chaves no app;
3. consultar dados dos sensores e histórico;
4. retornar a resposta ao aplicativo;
5. opcionalmente transcrever mensagens de voz antes de enviá-las ao agente.

## Áudio

O aplicativo solicita permissão de microfone apenas quando o usuário inicia uma gravação. As mensagens são armazenadas na área de documentos do app e podem ser reproduzidas no chat.

No Android Emulator, confirme o volume de mídia e habilite o uso do microfone do computador. Para validar captura e reprodução com fidelidade, prefira um aparelho físico.

## Relatórios PDF

- Android/iOS: o PDF é salvo no cache autorizado do aplicativo e aberto na folha de compartilhamento.
- Web: o relatório é aberto em uma janela de impressão; escolha **Salvar como PDF**.
- O navegador precisa permitir a abertura da janela do relatório.

## Rede

O módulo `expo-network` informa tipo de conexão, disponibilidade de internet e endereço IP. Por restrições dos sistemas operacionais, o app não lista redes próximas nem exibe o nome/SSID da rede usando apenas a API padrão do Expo.

## Identidade visual

O ícone e o splash são gerados a partir de `assets/branding/hydrobot.svg`.

Após editar o SVG, execute:

```bash
npm run generate:brand
```

O comando atualiza o ícone principal, foreground adaptativo do Android, ícone monocromático, favicon e splash.

## Validação

Antes de entregar alterações:

```bash
npm run check
npx expo export --platform all
```

## Aviso sobre qualidade da água

O HidroAlerta auxilia no acompanhamento de indicadores físicos e químicos, mas não substitui análises laboratoriais ou microbiológicas. A classificação apresentada no aplicativo não deve ser usada isoladamente como certificação de potabilidade.
