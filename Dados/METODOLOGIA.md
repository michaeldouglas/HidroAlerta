# Metodologia dos Testes de Turbidez

Este documento descreve a metodologia usada para coletar os dados experimentais da pasta `Dados`. A intenção é explicar não apenas o que foi medido, mas por que o experimento foi estruturado dessa forma.

## Objetivo

O objetivo dos testes foi avaliar a resposta elétrica do sensor de turbidez em diferentes condições relativas de partículas suspensas na água.

Nesta fase foram avaliados:

- estabilidade das leituras;
- repetibilidade entre experimentos;
- sensibilidade do sensor;
- comportamento da tensão em diferentes níveis de turbidez.

Os resultados servem como base para futuras etapas de calibração, modelagem matemática e integração das leituras ao HidroAlerta.

## Hardware utilizado

- ESP32 WiFi DevKit V1
- Módulo Sensor de Turbidez Partículas Suspensas na Água
- Saída analógica do sensor ligada ao GPIO34 do ESP32
- Alimentação do sensor em 3.3V

Ligação usada:

| Sensor de turbidez | ESP32 DevKit V1 |
| --- | --- |
| `AO` / `OUT` | `GPIO34` |
| `VCC` | `3.3V` |
| `GND` | `GND` |

## Sensor

O sensor de turbidez utilizado é um módulo óptico com emissor de luz e fotodetector. Ele detecta alterações na transparência da água por meio da transmitância e do espalhamento da luz.

Especificações informadas para o módulo usado:

| Item | Valor |
| --- | --- |
| Modelo | Sensor de Turbidez |
| Marca | OEM |
| Tensão de operação | 3.3V a 5V |
| Saída | Analógica |
| Faixa de medição | 0 a 1000 NTU |
| Pinagem | VCC, OUT, GND |
| Tamanho do sensor | 35 mm x 30 mm x 33 mm |
| Tamanho do módulo | 31 mm x 11 mm x 37 mm |
| Peso | 30 g |

## Princípio físico da medição

A turbidez é uma propriedade óptica da água relacionada à presença de partículas suspensas que reduzem sua transparência. Essas partículas promovem absorção e espalhamento da luz incidente, diminuindo a quantidade de luz que alcança o elemento fotossensível do sensor.

Como consequência, ocorre uma alteração na tensão analógica disponibilizada pelo módulo. Neste experimento, essa tensão foi convertida pelo ADC de 12 bits do ESP32 e registrada para análise posterior.

## Hipótese experimental

Assume-se que o aumento da concentração de partículas suspensas altera a resposta óptica do sensor e provoca modificações mensuráveis na tensão analógica de saída.

Dessa forma, espera-se observar diferenças consistentes entre as leituras obtidas para os diferentes níveis de turbidez relativa.

## Preparo das amostras

A terra usada nos testes foi coletada em um terreno e peneirada antes de ser misturada à água. As condições experimentais foram:

- água limpa, sem adição de terra;
- água com 1/2 colher de chá de terra;
- água com 1 colher de chá de terra;
- água com 2 colheres de chá de terra.

Essas amostras simulam diferentes níveis de partículas suspensas. Elas não representam calibração oficial em NTU, mas servem como base prática para comparar leituras relativas entre condições.

## Delineamento experimental

O estudo foi conduzido com quatro condições experimentais:

- água limpa, usada como controle;
- água com baixa concentração de partículas;
- água com concentração intermediária de partículas;
- água com alta concentração de partículas.

Para cada condição foram realizados dois experimentos independentes. Essa repetição permite avaliar a consistência do comportamento observado e reduz a chance de interpretar flutuações aleatórias como tendência real.

## Variáveis experimentais

A variável independente foi a quantidade relativa de terra peneirada adicionada à água.

As variáveis dependentes observadas foram:

- valor médio do ADC;
- tensão média;
- menor valor ADC do ciclo;
- maior valor ADC do ciclo.

As demais condições foram mantidas constantes ao longo dos ensaios.

## Condições controladas

Para reduzir a influência de variáveis externas, todos os experimentos seguiram as mesmas condições gerais:

- recipiente único com aproximadamente 1 litro de água;
- mesmo volume de água;
- sensor fixado por flange;
- sensor totalmente submerso;
- mesma posição do sensor durante todos os testes;
- alimentação do sensor em 3.3V;
- leitura analógica pelo `GPIO34` / `ADC1`;
- mesmo intervalo de aquisição;
- estabilização da água antes da coleta;
- duração aproximada de 5 minutos por experimento.

A única variável alterada entre os ensaios foi a quantidade de terra peneirada adicionada à água.

## Aquisição dos dados

Em cada ciclo de aquisição, o ESP32 executou:

1. 50 leituras do ADC;
2. intervalo de 10 ms entre leituras;
3. cálculo da média;
4. cálculo do menor valor;
5. cálculo do maior valor;
6. conversão do valor médio para tensão;
7. envio da linha CSV pela porta serial.

## Por que usar média de 50 leituras?

Conversores analógico-digitais apresentam pequenas oscilações causadas por ruído eletrônico, variações de alimentação e resolução finita do ADC.

Para reduzir esse efeito, cada registro armazenado no CSV corresponde à média de 50 leituras consecutivas. A média reduz a variabilidade causada por ruídos aleatórios e produz estimativas mais estáveis da tensão fornecida pelo sensor.

## Por que registrar mínimo e máximo?

Além do valor médio, foram registrados os valores mínimo e máximo observados durante cada ciclo de aquisição.

Esses parâmetros ajudam a avaliar a dispersão das leituras e podem indicar instabilidades momentâneas, como movimentação da água, bolhas de ar ou interferências elétricas.

## Por que registrar tensão?

A tensão analógica foi armazenada junto com os valores do ADC porque representa a grandeza elétrica efetivamente produzida pelo sensor.

Essa informação facilita futuras calibrações em outras plataformas, já que a tensão pode ser comparada independentemente da resolução específica do ADC usado.

## Interpretação dos dados

Os dados devem ser interpretados como uma caracterização experimental preliminar do sensor. Valores maiores ou menores de tensão indicam mudanças na resposta elétrica do sensor em função da quantidade relativa de partículas suspensas.

Nesta etapa ainda não há conversão direta para NTU.

## Fontes de incerteza experimental

Alguns fatores podem influenciar as medições:

- sedimentação gradual das partículas;
- formação de bolhas sobre a superfície óptica do sensor;
- pequenas variações na homogeneização da mistura;
- ruído do conversor analógico-digital;
- variações na alimentação elétrica;
- temperatura da água durante os ensaios;
- pequenas mudanças na posição do sensor.

Embora essas influências não tenham sido eliminadas completamente, as condições do experimento foram mantidas constantes para reduzir seu impacto.

## Limitações

Este estudo caracteriza apenas o comportamento relativo do sensor sob diferentes concentrações de partículas suspensas.

Como não foram utilizadas soluções padrão certificadas de turbidez nem turbidímetro de referência, não é possível estabelecer uma relação quantitativa entre os valores obtidos e unidades de NTU. Assim, os resultados devem ser interpretados como uma caracterização experimental preliminar do sensor.

## Trabalhos futuros

Os dados coletados podem apoiar próximas etapas do projeto, como:

- ajuste de curvas de regressão;
- calibração com padrões conhecidos de turbidez;
- comparação com turbidímetros comerciais;
- estimativa de valores em NTU;
- integração das leituras reais ao dashboard do HidroAlerta;
- combinação com sensores de pH, temperatura e TDS.

## Considerações finais

Este conjunto de dados representa a etapa de caracterização experimental do sensor de turbidez usado no HidroAlerta. O foco é compreender o comportamento do sensor em condições controladas antes de avançar para calibração quantitativa e uso operacional.
