# Fluxo de trabalho para notebook Jupyter

Use este fluxo ao criar ou editar um notebook para o conjunto de dados de turbidez do HidroAlerta.

## Seções sugeridas para o notebook

1. Título e objetivo
2. Conjunto de dados e contexto experimental
3. Carregamento e validação
4. Notas de limpeza/normalização dos dados
5. Estatísticas descritivas
6. Séries temporais por condição e teste
7. Comparações de distribuição por condição
8. Repetibilidade entre arquivos de teste
9. Análise de dispersão usando `adc_amplitude`
10. Achados, limitações e próximos passos

## Stack Python recomendada

```python
from pathlib import Path
import sys

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
```

Use `prepare_turbidity_data.py` dos scripts da skill quando disponível.

## Orientações para gráficos

- Use `tempo_s` nos eixos x de séries temporais.
- Plote `adc_medio` e `tensao_media_v` separadamente.
- Use cor/estilo para `teste` ao verificar repetibilidade.
- Mantenha a ordem das condições explícita:

```python
condition_order = [
    "agua_limpa",
    "agua_pouca_terra",
    "agua_media_terra",
    "agua_alta_terra",
]
```

## Análises derivadas úteis

- `adc_amplitude = adc_maior - adc_menor`
- coeficiente de variação por condição/teste
- média e desvio padrão por condição
- comparação entre o teste 1 e o teste 2
- tendência em relação a `condicao_ordem`

## Linguagem para conclusões

Prefira:

- "a resposta do sensor mudou nas condições testadas";
- "o conjunto de dados sugere diferenças relativas";
- "a repetibilidade parece mais forte/fraca com base em...";
- "a calibração é necessária antes da estimativa em NTU."

Evite:

- "a água tem X NTU";
- "isso comprova potabilidade";
- "o sensor está calibrado";
- "o modelo está pronto para produção."
