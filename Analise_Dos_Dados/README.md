# Analise dos Dados

Projeto Python para analisar os dados coletados pelo HidroAlerta.

## Requisitos

- Python 3.14 ou superior
- `pip` ou `uv`

As dependencias do projeto estao declaradas no arquivo `pyproject.toml`.

## Instalacao com pip

Entre na pasta do projeto:

```powershell
cd Analise_Dos_Dados
```

Crie e ative um ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Atualize o `pip` e instale o projeto:

```powershell
python -m pip install --upgrade pip
pip install -e .
```

Para executar o script principal:

```powershell
python main.py
```

Para abrir o Jupyter:

```powershell
jupyter notebook
```

## Instalacao com uv

Se ainda nao tiver o `uv`, instale com:

```powershell
pip install uv
```

Entre na pasta do projeto:

```powershell
cd Analise_Dos_Dados
```

Sincronize o ambiente a partir do `pyproject.toml` e do `uv.lock`:

```powershell
uv sync
```

Para executar o script principal:

```powershell
uv run python main.py
```

Para abrir o Jupyter:

```powershell
uv run jupyter notebook
```

## Estrutura

- `pyproject.toml`: metadados e dependencias do projeto.
- `uv.lock`: versoes travadas das dependencias usadas pelo `uv`.
- `main.py`: ponto de entrada inicial do projeto.

## Observacoes

- A pasta `.venv/` nao deve ser enviada para o Git.
- Arquivos gerados pela analise, como graficos, relatorios e tabelas exportadas, devem ficar em pastas como `outputs/` ou `figuras/`.
