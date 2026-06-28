---
name: hidroalerta-data-analysis
description: Analise o conjunto de dados dos experimentos de turbidez do HidroAlerta em arquivos CSV e notebooks Jupyter. Use quando o Codex for solicitado a explorar, limpar, resumir, visualizar, comparar estatisticamente, modelar ou preparar análises em notebook para os experimentos do sensor de turbidez em Dados/ coletados com ESP32, incluindo leituras de ADC/tensão, testes repetidos, condições relativas de turbidez, metodologia, incerteza e calibração futura para NTU.
---

# hidroalerta-data-analysis

Use esta skill ao atuar como cientista de dados para o conjunto de dados de turbidez do HidroAlerta.

O conjunto de dados fica em `Dados/` e contém leituras CSV de um sensor de turbidez conectado a um ESP32 WiFi DevKit V1. O objetivo é analisar o comportamento relativo do sensor, não valores calibrados em NTU.

## Fluxo de trabalho

1. Localize a raiz do repositório e a pasta `Dados/`.
2. Leia `Dados/README.md` para entender a organização atual dos arquivos.
3. Leia `references/dataset.md` para consultar o esquema, o mapeamento das condições e as regras de interpretação.
4. Para perguntas científicas ou metodológicas, leia `references/methodology.md`.
5. Para trabalhos em notebooks Jupyter, leia `references/notebook-workflow.md`.
6. Prefira usar `scripts/prepare_turbidity_data.py` para carregar e normalizar os CSVs antes da análise.

## Regras dos dados

- Trate `agua_limpa` como a condição de controle.
- Trate `agua_pouca_terra`, `agua_media_terra` e `agua_alta_terra` como condições de turbidez relativa crescente.
- Não afirme que os valores estão calibrados em NTU.
- Interprete ADC e tensão como respostas elétricas relativas do sensor.
- Preserve os testes repetidos; não calcule médias entre arquivos de teste antes de verificar a repetibilidade.
- Mantenha a incerteza experimental visível: sedimentação, bolhas, mistura, ruído do ADC, variação de alimentação, temperatura e posição do sensor podem afetar as leituras.

## Análises recomendadas

Comece por:

- contagem de linhas por condição e arquivo de teste;
- valores ausentes e validação do esquema;
- estatísticas descritivas de `adc_medio`, `tensao_media_v`, `adc_menor` e `adc_maior`;
- gráficos de série temporal por condição e teste;
- boxplots ou violin plots por condição;
- comparação de repetibilidade entre o teste 1 e o teste 2;
- análise de dispersão usando `adc_maior - adc_menor`;
- comparação de tendência em relação às condições experimentais ordenadas.

Use testes estatísticos somente depois de inspecionar distribuições e repetibilidade. Formule conclusões como evidência experimental, não como certificação.

## Uso rápido do script

A partir da raiz do repositório:

```bash
python .codex/skills/hidroalerta-data-analysis/scripts/prepare_turbidity_data.py Dados --output Dados/turbidez_normalizado.csv
```

Em um notebook:

```python
from pathlib import Path
import sys

repo = Path.cwd()
skill_scripts = repo / ".codex" / "skills" / "hidroalerta-data-analysis" / "scripts"
sys.path.append(str(skill_scripts))

from prepare_turbidity_data import load_turbidity_data, summarize_turbidity_data

df = load_turbidity_data(repo / "Dados")
summary = summarize_turbidity_data(df)
df.head(), summary
```

## Orientações de saída

Ao produzir notebooks ou relatórios de análise:

- inclua uma seção curta de metodologia;
- mostre a estrutura do conjunto de dados e as condições;
- documente que os dados não são calibrados em NTU;
- inclua gráficos com unidades e rótulos de eixo claros;
- separe achados exploratórios de conclusões;
- declare as limitações antes de sugerir calibração ou uso em produção.
