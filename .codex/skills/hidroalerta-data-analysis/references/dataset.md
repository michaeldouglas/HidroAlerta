# Referência do conjunto de dados de turbidez do HidroAlerta

## Localização

Raiz do conjunto de dados: `Dados/`

Estrutura esperada:

```text
Dados/
├── agua_limpa/
├── 1_2_colher_de_cha/
├── 1_colher_de_cha/
└── 2_colheres_de_cha/
```

Cada condição atualmente tem dois arquivos CSV de testes independentes.

## Mapeamento das condições

| Pasta | Valor de `amostra` | Condição relativa | Quantidade |
| --- | --- | --- | --- |
| `agua_limpa` | `agua_limpa` | Controle / água limpa | 0 |
| `1_2_colher_de_cha` | `agua_pouca_terra` | Baixa concentração de partículas | 1/2 colher de chá de terra peneirada |
| `1_colher_de_cha` | `agua_media_terra` | Média concentração de partículas | 1 colher de chá de terra peneirada |
| `2_colheres_de_cha` | `agua_alta_terra` | Alta concentração de partículas | 2 colheres de chá de terra peneirada |

Use uma coluna de condição ordenada ao gerar gráficos ou modelos:

```text
agua_limpa < agua_pouca_terra < agua_media_terra < agua_alta_terra
```

## Colunas CSV

| Coluna | Significado |
| --- | --- |
| `leitura` | Número sequencial da leitura. |
| `tempo_ms` | Tempo decorrido da coleta em milissegundos. |
| `amostra` | Rótulo da condição experimental. |
| `adc_medio` | Valor médio de ADC em 50 leituras brutas. |
| `adc_menor` | Menor valor de ADC no ciclo de 50 leituras. |
| `adc_maior` | Maior valor de ADC no ciclo de 50 leituras. |
| `tensao_media_v` | Tensão calculada a partir de `adc_medio`. |

Colunas derivadas úteis:

- `tempo_s = tempo_ms / 1000`
- `adc_amplitude = adc_maior - adc_menor`
- `condicao_ordem = 0, 1, 2, 3`
- `arquivo` / `teste` from filename
- `pasta_condicao` from parent folder

## Regras de interpretação

- Analise os dados como experimentos de turbidez relativa.
- Não converta para NTU a menos que dados de calibração sejam fornecidos.
- Preserve a identidade do arquivo/teste para verificações de repetibilidade.
- Trate a tensão como uma representação da saída do sensor independente da plataforma.
- Use `adc_amplitude` para discutir dispersão ou instabilidade de curto prazo dentro de cada ciclo de aquisição.
