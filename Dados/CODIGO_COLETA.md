# Código de Coleta

Este arquivo documenta o código usado no ESP32 WiFi DevKit V1 para coletar as leituras do sensor de turbidez e enviá-las pela porta serial em formato CSV.

## Configuração usada

- Sensor de turbidez ligado ao `GPIO34`
- ADC configurado com resolução de 12 bits
- Atenuação `ADC_11db`
- 50 leituras por registro
- 10 ms entre cada leitura interna
- 2 segundos entre cada linha CSV enviada

Para cada condição de água, o valor de `amostra` foi ajustado no código antes da coleta.

## Código

```cpp
/*
  Coleta CSV - Sensor de Turbidez
  ESP32 DevKit V1

  AO  -> GPIO34
  VCC -> 3.3V
  GND -> GND
*/

const int turbidityPin = 34;

unsigned long numeroLeitura = 0;

void setup() {
  Serial.begin(115200);
  delay(2000);

  analogReadResolution(12);
  analogSetPinAttenuation(turbidityPin, ADC_11db);

  Serial.println("leitura,tempo_ms,amostra,adc_medio,adc_menor,adc_maior,tensao_media_v");
}

void loop() {
  long soma = 0;
  int menor = 4095;
  int maior = 0;

  const int amostras = 50;
  const char* amostra = "agua_alta_terra";

  for (int i = 0; i < amostras; i++) {
    int leitura = analogRead(turbidityPin);

    soma += leitura;

    if (leitura < menor) menor = leitura;
    if (leitura > maior) maior = leitura;

    delay(10);
  }

  int adcMedio = soma / amostras;
  float tensao = adcMedio * (3.3 / 4095.0);

  numeroLeitura++;

  Serial.print(numeroLeitura);
  Serial.print(",");
  Serial.print(millis());
  Serial.print(",");
  Serial.print(amostra);
  Serial.print(",");
  Serial.print(adcMedio);
  Serial.print(",");
  Serial.print(menor);
  Serial.print(",");
  Serial.print(maior);
  Serial.print(",");
  Serial.println(tensao, 3);

  delay(2000);
}
```

## Saída esperada

```text
leitura,tempo_ms,amostra,adc_medio,adc_menor,adc_maior,tensao_media_v
1,2523,agua_alta_terra,638,0,2559,0.514
2,5022,agua_alta_terra,684,0,1858,0.551
```
