import pandas as pd
import os
import json

class ETLSensor:
    def __init__(self):
        pass

    def list_all_files(self, directory: str) -> list:
        """
        Lista todos os arquivos em um diretório recursivamente.

        Args:
            directory (str): O caminho para o diretório.
        """
        all_files = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                all_files.append(os.path.join(root, file))
        
        print(f"Total de arquivos encontrados: {len(all_files)}")
        return all_files
    
    def creat_schema_file(self, schema_name:str):

        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_name = 'metadados.json'
        json_file_path = os.path.join(current_dir, json_file_name)
        with open(json_file_path, 'r') as json_file:
            schema = json.load(json_file)
        
        try:
            schema_file = schema.get(schema_name).get("schema")
            print(f"Schema '{schema_name}' encontrado no arquivo JSON.")
        except KeyError:
            print(f"Schema '{schema_name}' não encontrado no arquivo JSON.")
            return None
        
        print(schema_file)
        

    
ETL = ETLSensor()
ETL.creat_schema_file("turbidez")
# path = "/HidroAlerta/Dados"
# arquivos = ETL.list_all_files(path)
# for arquivo in arquivos:
#     print(arquivo)