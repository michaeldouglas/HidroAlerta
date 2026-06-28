#!/usr/bin/env python3
"""Carrega e normaliza arquivos CSV de turbidez do HidroAlerta."""

from __future__ import annotations

import argparse
import csv
import statistics
from pathlib import Path
from typing import Iterable, Any


EXPECTED_COLUMNS = [
    "leitura",
    "tempo_ms",
    "amostra",
    "adc_medio",
    "adc_menor",
    "adc_maior",
    "tensao_media_v",
]

CONDITION_METADATA = {
    "agua_limpa": {
        "condicao": "agua_limpa",
        "condicao_ordem": 0,
        "quantidade_terra": "0",
        "descricao": "agua limpa",
    },
    "agua_pouca_terra": {
        "condicao": "agua_pouca_terra",
        "condicao_ordem": 1,
        "quantidade_terra": "1/2 colher de cha",
        "descricao": "baixa concentracao de particulas",
    },
    "agua_media_terra": {
        "condicao": "agua_media_terra",
        "condicao_ordem": 2,
        "quantidade_terra": "1 colher de cha",
        "descricao": "concentracao intermediaria de particulas",
    },
    "agua_alta_terra": {
        "condicao": "agua_alta_terra",
        "condicao_ordem": 3,
        "quantidade_terra": "2 colheres de cha",
        "descricao": "alta concentracao de particulas",
    },
}


def _parse_csv_line(line: str) -> list[str]:
    """Interpreta uma linha CSV, incluindo linhas exportadas como um único campo entre aspas."""
    row = next(csv.reader([line]))
    if len(row) == 1 and "," in row[0]:
        row = next(csv.reader([row[0]]))
    return row[: len(EXPECTED_COLUMNS)]


def _read_sensor_records(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            parsed = _parse_csv_line(line)
            if parsed == EXPECTED_COLUMNS:
                continue
            if len(parsed) == len(EXPECTED_COLUMNS):
                record = dict(zip(EXPECTED_COLUMNS, parsed, strict=True))
                record["leitura"] = int(record["leitura"])
                record["tempo_ms"] = int(record["tempo_ms"])
                record["adc_medio"] = int(record["adc_medio"])
                record["adc_menor"] = int(record["adc_menor"])
                record["adc_maior"] = int(record["adc_maior"])
                record["tensao_media_v"] = float(record["tensao_media_v"])
                record["arquivo"] = path.name
                record["pasta_condicao"] = path.parent.name
                record["teste"] = path.stem
                record["tempo_s"] = record["tempo_ms"] / 1000.0
                record["adc_amplitude"] = record["adc_maior"] - record["adc_menor"]
                record.update(CONDITION_METADATA.get(record["amostra"], {}))
                record["condicao"] = record.get("condicao", record["amostra"])
                records.append(record)
    return records


def iter_csv_files(data_dir: Path) -> Iterable[Path]:
    return sorted(
        path
        for path in data_dir.rglob("*.csv")
        if path.is_file() and not path.name.startswith(".")
    )


def read_turbidity_records(data_dir: str | Path) -> list[dict[str, Any]]:
    """Lê todos os arquivos CSV de turbidez em dicionários Python simples."""
    data_path = Path(data_dir)
    records: list[dict[str, Any]] = []
    for path in iter_csv_files(data_path):
        records.extend(_read_sensor_records(path))
    if not records:
        raise FileNotFoundError(
            f"Nenhum arquivo CSV de turbidez legível foi encontrado em {data_path}"
        )
    return records


def load_turbidity_data(data_dir: str | Path) -> pd.DataFrame:
    """Carrega todos os arquivos CSV de turbidez dentro de um diretório Dados."""
    try:
        import pandas as pd
    except ModuleNotFoundError as error:
        raise ModuleNotFoundError(
            "pandas é necessário para load_turbidity_data(). "
            "Instale no ambiente do notebook com: pip install pandas"
        ) from error

    return pd.DataFrame(read_turbidity_records(data_dir))


def summarize_turbidity_data(df: pd.DataFrame) -> pd.DataFrame:
    """Retorna estatísticas descritivas por condição e arquivo."""
    return (
        df.groupby(["condicao_ordem", "condicao", "arquivo"], dropna=False)
        .agg(
            linhas=("leitura", "count"),
            tempo_s_min=("tempo_s", "min"),
            tempo_s_max=("tempo_s", "max"),
            adc_medio_media=("adc_medio", "mean"),
            adc_medio_dp=("adc_medio", "std"),
            tensao_media_v_media=("tensao_media_v", "mean"),
            tensao_media_v_dp=("tensao_media_v", "std"),
            adc_amplitude_media=("adc_amplitude", "mean"),
        )
        .reset_index()
        .sort_values(["condicao_ordem", "arquivo"])
    )


def summarize_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Resume os registros sem exigir pandas."""
    groups: dict[tuple[Any, Any, Any], list[dict[str, Any]]] = {}
    for record in records:
        key = (record.get("condicao_ordem"), record.get("condicao"), record.get("arquivo"))
        groups.setdefault(key, []).append(record)

    summary: list[dict[str, Any]] = []
    for (order, condition, file_name), items in groups.items():
        adc_values = [item["adc_medio"] for item in items]
        voltage_values = [item["tensao_media_v"] for item in items]
        amplitude_values = [item["adc_amplitude"] for item in items]
        summary.append(
            {
                "condicao_ordem": order,
                "condicao": condition,
                "arquivo": file_name,
                "linhas": len(items),
                "tempo_s_min": min(item["tempo_s"] for item in items),
                "tempo_s_max": max(item["tempo_s"] for item in items),
                "adc_medio_media": statistics.fmean(adc_values),
                "adc_medio_dp": statistics.stdev(adc_values)
                if len(adc_values) > 1
                else 0.0,
                "tensao_media_v_media": statistics.fmean(voltage_values),
                "tensao_media_v_dp": statistics.stdev(voltage_values)
                if len(voltage_values) > 1
                else 0.0,
                "adc_amplitude_media": statistics.fmean(amplitude_values),
            }
        )
    return sorted(summary, key=lambda row: (row["condicao_ordem"], row["arquivo"]))


def write_records_csv(path: Path, records: list[dict[str, Any]]) -> None:
    if not records:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(records[0].keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)


def print_summary(summary: list[dict[str, Any]]) -> None:
    for row in summary:
        print(
            f"{row['condicao']} | {row['arquivo']} | "
            f"linhas={row['linhas']} | "
            f"adc_media={row['adc_medio_media']:.2f} | "
            f"tensao_media_v={row['tensao_media_v_media']:.4f} | "
            f"amplitude_media={row['adc_amplitude_media']:.2f}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Carrega e normaliza arquivos CSV de turbidez do HidroAlerta."
    )
    parser.add_argument("data_dir", help="Caminho para o diretório Dados")
    parser.add_argument("--output", help="Caminho opcional para o CSV de saída")
    parser.add_argument("--summary", help="Caminho opcional para o CSV de resumo")
    args = parser.parse_args()

    records = read_turbidity_records(args.data_dir)
    summary = summarize_records(records)

    file_count = len({record["arquivo"] for record in records})
    print(f"Carregadas {len(records)} linhas de {file_count} arquivos.")
    print_summary(summary)

    if args.output:
        output = Path(args.output)
        write_records_csv(output, records)
        print(f"Dados normalizados escritos em {output}")

    if args.summary:
        summary_output = Path(args.summary)
        write_records_csv(summary_output, summary)
        print(f"Resumo escrito em {summary_output}")


if __name__ == "__main__":
    main()
