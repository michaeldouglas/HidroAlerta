import { SensorDetailScreen } from "@/features/monitoring/components/sensor-detail-screen";

export default function TemperatureScreen() {
  return (
    <SensorDetailScreen
      title="Temperatura da Água"
      label="temperatura atual"
      labelFontSize={10}
      value={24.1}
      decimals={1}
      unit="°C"
      icon="temperature"
      accent="#36D6CC"
      progress={69}
      status="Ideal"
      description="Temperatura estável e dentro da faixa esperada."
      recommendedRange="20 – 30 °C"
      rangeStart={40}
      rangeWidth={40}
      markerPosition={56}
      primaryLabel="Sensação térmica"
      primaryValue="Agradável"
      secondaryLabel="Variação nas últimas 24h"
      secondaryValue="−0,4 °C"
      insightTitle="Condição estável"
      insight="Sem mudanças bruscas que possam afetar os demais indicadores."
    />
  );
}
