# ETLSensor - Captura e Ingestão de Dados de Sensores IoT via MQTT

## Descrição

O **ETLSensor** é uma biblioteca desenvolvida em Python com o objetivo de realizar a etapa de **extração** de dados provenientes de dispositivos IoT que utilizam o protocolo **MQTT (Message Queuing Telemetry Transport)**.

O projeto foi concebido como parte de uma pesquisa de mestrado voltada ao monitoramento de sensores ambientais, permitindo a captura contínua das mensagens publicadas por dispositivos embarcados, como o ESP32, e seu armazenamento em formato CSV para posterior processamento, análise e integração com pipelines de dados.

Além da captura das mensagens MQTT, a biblioteca oferece funcionalidades auxiliares para:

* Listagem recursiva de arquivos;
* Gerenciamento de schemas de dados por meio de um arquivo JSON;
* Persistência das mensagens recebidas em arquivos CSV;
* Estrutura preparada para futuras etapas de transformação e carga (ETL).

---

# Objetivos

Este projeto possui como principais objetivos:

* Capturar dados publicados por sensores IoT utilizando o protocolo MQTT;
* Registrar automaticamente todas as mensagens recebidas;
* Organizar os dados em formato tabular (CSV);
* Facilitar a integração com pipelines de processamento de dados;
* Possibilitar experimentos relacionados à aquisição de dados em tempo real.

---

# Arquitetura

```
                +----------------+
                | Sensor ESP32   |
                +--------+-------+
                         |
                    Publicação MQTT
                         |
                         ▼
               +---------------------+
               | Broker MQTT         |
               | (HiveMQ, Mosquitto) |
               +----------+----------+
                          |
                     Subscribe
                          |
                          ▼
                 +------------------+
                 | ETLSensor        |
                 +------------------+
                 | Captura mensagens|
                 | Timestamp        |
                 | Persistência CSV |
                 +------------------+
                          |
                          ▼
                     Arquivo CSV
```

---

# Estrutura do Projeto

```
.
├── etl_sensor.py
├── schema.json
├── data/
│   └── sensores.csv
├── README.md
└── requirements.txt
```

---

# Dependências

O projeto utiliza as seguintes bibliotecas:

* pandas
* paho-mqtt

Instalação:

```bash
pip install pandas paho-mqtt
```

---

# Classe ETLSensor

A biblioteca disponibiliza a classe `ETLSensor`, responsável pela comunicação com o broker MQTT e pelas operações auxiliares.

## Métodos disponíveis

### list_all_files()

Lista todos os arquivos existentes em um diretório de forma recursiva.

```python
etl = ETLSensor()

arquivos = etl.list_all_files("./dados")
```

---

### create_schema_file()

Realiza a leitura do arquivo `schema.json` e retorna o schema correspondente ao sensor informado.

Exemplo de utilização:

```python
schema = etl.create_schema_file("turbidez")
```

Exemplo do arquivo `schema.json`:

```json
{
    "turbidez": {
        "descricao": "Sensor de turbidez",
        "schema": {
            "leitura": "int64",
            "tempo_ms": "int64",
            "data_hora": "timestamp",
            "amostra": "string",
            "adc_medio": "int64",
            "adc_menor": "int64",
            "adc_maior": "int64",
            "tensao_media_v": "float64"
        }
    }
}
```

---

### read_mqtt_topic()

Conecta-se a um broker MQTT, realiza a inscrição (*subscribe*) em um tópico específico e registra todas as mensagens recebidas em um arquivo CSV.

Exemplo:

```python
from etl_sensor import ETLSensor

etl = ETLSensor()

etl.read_mqtt_topic(
    topic="iot/agua/turbidez",
    output_file="data/turbidez.csv"
)
```

---

# Funcionamento

Ao iniciar a execução, o sistema:

1. Conecta ao broker MQTT.
2. Realiza o subscribe no tópico informado.
3. Aguarda mensagens continuamente.
4. Recebe os dados publicados pelo sensor.
5. Registra a data e hora da captura.
6. Armazena as mensagens em um arquivo CSV.

Formato do arquivo gerado:

| data_captura        | topic             | payload                    |
| ------------------- | ----------------- | -------------------------- |
| 2026-06-29 15:20:10 | iot/agua/turbidez | {"adc":1840,"tensao":1.48} |
| 2026-06-29 15:20:12 | iot/agua/turbidez | {"adc":1842,"tensao":1.49} |

---

# Exemplo de Integração com ESP32

O ESP32 publica mensagens em um tópico MQTT.

Exemplo de payload:

```json
{
    "leitura": 15,
    "tempo_ms": 15423,
    "data_hora": "2026-06-29 15:20:10",
    "amostra": "agua_alta_terra",
    "adc_medio": 1842,
    "adc_menor": 1838,
    "adc_maior": 1845,
    "tensao_media_v": 1.485
}
```

Essas mensagens são capturadas automaticamente pela biblioteca e persistidas para posterior processamento.

---

# Aplicações

A biblioteca pode ser utilizada em diferentes cenários envolvendo sensores IoT, tais como:

* Monitoramento da qualidade da água;
* Monitoramento ambiental;
* Agricultura de precisão;
* Automação residencial;
* Cidades inteligentes;
* Sistemas de monitoramento em tempo real.

---

# Possíveis Extensões

A arquitetura foi desenvolvida de forma modular, permitindo a implementação futura de funcionalidades como:

* Persistência em bancos de dados relacionais e NoSQL;
* Integração com Apache Kafka;
* Processamento em tempo real utilizando Apache Spark Structured Streaming;
* Armazenamento em Data Lake;
* Publicação em serviços de nuvem (AWS, Azure e Google Cloud);
* Visualização em dashboards analíticos.

---

# Contexto Acadêmico

Este projeto integra um estudo voltado à construção de uma arquitetura para aquisição, armazenamento e processamento de dados provenientes de sensores IoT aplicados ao monitoramento da qualidade da água. A biblioteca representa a etapa de extração dos dados, fornecendo uma base para pesquisas envolvendo Internet das Coisas (IoT), Engenharia de Dados e processamento de fluxos contínuos (*streaming*), permitindo a integração com soluções analíticas e sistemas inteligentes de apoio à decisão.

---

# Licença

Este projeto foi desenvolvido para fins acadêmicos e de pesquisa.
