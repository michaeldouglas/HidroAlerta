# Simulador HidroAlerta

Simulador visual da caixa d'água monitorada pelo sensor de turbidez.

## Como executar

A partir da raiz do projeto:

```powershell
python -m http.server 8765
```

Abra no navegador:

```text
http://127.0.0.1:8765/Simulador/index.html
```

O simulador carrega os CSVs reais da pasta `Dados/`, então precisa ser aberto por servidor local.
