import pandas as pd
import os
import json
import paho.mqtt.client as mqtt
from datetime import datetime


class ETLSensor:
    def __init__(self):
        pass

    def list_all_files(self, directory: str) -> list:
        all_files = []

        for root, dirs, files in os.walk(directory):
            for file in files:
                all_files.append(os.path.join(root, file))

        print(f"Total de arquivos encontrados: {len(all_files)}")
        return all_files

    def create_schema_file(self, schema_name: str):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "schema.json")

        with open(json_file_path, "r", encoding="utf-8") as json_file:
            schema = json.load(json_file)

        if schema_name not in schema:
            print(f"Schema '{schema_name}' não encontrado no arquivo JSON.")
            return None

        schema_file = schema[schema_name].get("schema")

        print(f"Schema '{schema_name}' encontrado no arquivo JSON.")
        print(schema_file)

        return schema_file

    def read_mqtt_topic(
        self,
        topic: str,
        output_file: str,
        host: str = "broker.hivemq.com",
        port: int = 1883,
        client_id: str = "python_sensor_reader",
        keepalive: int = 60
    ):
        """
        Conecta em um tópico MQTT e salva as mensagens recebidas em um arquivo CSV.

        Args:
            topic (str): Tópico MQTT para escutar.
            output_file (str): Caminho do arquivo CSV de saída.
            host (str): Broker MQTT.
            port (int): Porta MQTT.
            client_id (str): Identificador do cliente.
            keepalive (int): Tempo de keepalive da conexão.
        """

        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        file_exists = os.path.exists(output_file)

        if not file_exists:
            with open(output_file, "w", encoding="utf-8") as file:
                file.write("data_captura,topic,payload\n")

        def on_connect(client, userdata, flags, reason_code, properties=None):
            if reason_code == 0:
                print("Conectado ao broker MQTT.")
                print(f"Inscrevendo no tópico: {topic}")
                client.subscribe(topic)
            else:
                print(f"Falha ao conectar. Código: {reason_code}")

        def on_message(client, userdata, msg):
            payload = msg.payload.decode("utf-8")
            data_captura = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            print(f"{data_captura} | {msg.topic} | {payload}")

            payload = payload.replace("\n", " ").replace("\r", " ")
            payload = payload.replace('"', '""')

            with open(output_file, "a", encoding="utf-8") as file:
                file.write(f'"{data_captura}","{msg.topic}","{payload}"\n')

        client = mqtt.Client(
            client_id=client_id,
            protocol=mqtt.MQTTv311
        )

        client.on_connect = on_connect
        client.on_message = on_message

        print(f"Conectando em {host}:{port}...")
        client.connect(host, port, keepalive)

        print("Aguardando mensagens. Pressione CTRL+C para parar.")

        try:
            client.loop_forever()
        except KeyboardInterrupt:
            print("Encerrando leitura MQTT...")
            client.disconnect()

    
ETL = ETLSensor()
ETL.create_schema_file("turbidez")
# path = "/HidroAlerta/Dados"
# arquivos = ETL.list_all_files(path)
# for arquivo in arquivos:
#     print(arquivo)