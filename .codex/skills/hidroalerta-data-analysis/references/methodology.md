# Referência metodológica

## Objetivo experimental

Os experimentos caracterizam a resposta elétrica de um sensor de turbidez OEM sob concentrações relativas crescentes de partículas suspensas na água.

O objetivo é avaliar:

- estabilidade das leituras;
- repetibilidade entre testes independentes;
- sensibilidade do sensor;
- comportamento da tensão entre níveis relativos de turbidez.

## Hardware

- ESP32 WiFi DevKit V1
- Módulo sensor de turbidez com saída analógica
- Sensor `AO` / `OUT` conectado ao `GPIO34` / `ADC1` do ESP32
- Sensor alimentado em 3,3 V
- ADC do ESP32 configurado com resolução de 12 bits e atenuação `ADC_11db`

## Princípio físico

A turbidez é uma propriedade óptica relacionada a partículas suspensas que reduzem a transparência da água. As partículas absorvem e espalham a luz incidente, alterando a intensidade luminosa que chega ao fotodetector do sensor. Isso altera a tensão de saída analógica do módulo, que o ESP32 converte em valores de ADC.

## Desenho experimental

Quatro condições:

1. controle com água limpa;
2. baixa concentração de partículas: 1/2 colher de chá de terra peneirada;
3. média concentração de partículas: 1 colher de chá de terra peneirada;
4. alta concentração de partículas: 2 colheres de chá de terra peneirada.

Foram coletados dois experimentos independentes por condição para avaliar a repetibilidade.

## Condições controladas

Os itens a seguir foram mantidos constantes tanto quanto possível:

- mesmo recipiente, aproximadamente 1 litro;
- mesmo volume de água;
- sensor fixado por flange;
- sensor totalmente submerso;
- mesma posição do sensor;
- alimentação em 3,3 V;
- aquisição analógica no GPIO34;
- mesmo procedimento de amostragem;
- estabilização da água antes da coleta;
- aproximadamente 5 minutos por experimento.

A variável independente é a quantidade relativa de terra peneirada adicionada à água.

As variáveis dependentes incluem `adc_medio`, `tensao_media_v`, `adc_menor` e `adc_maior`.

## Aquisição

Cada linha CSV resume um ciclo de aquisição:

- 50 leituras de ADC;
- 10 ms entre leituras internas;
- cálculo de média, mínimo e máximo;
- ADC médio convertido para tensão;
- linha emitida pela serial.

Os valores médios reduzem o ruído aleatório do ADC. Os valores de mínimo/máximo ajudam a inspecionar dispersão, bolhas, movimento da água ou interferência elétrica.

## Limitações

Estes são experimentos relativos preliminares. Eles não são medições calibradas em NTU porque não foram usados padrões certificados de turbidez nem turbidímetro de referência.

Fontes de incerteza:

- sedimentação;
- bolhas na superfície óptica;
- homogeneização imperfeita da mistura;
- ruído do ADC;
- variação de alimentação;
- temperatura da água;
- pequenas mudanças na posição do sensor.
