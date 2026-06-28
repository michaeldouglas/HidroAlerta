import { SensorDetailScreen } from "@/features/monitoring/components/sensor-detail-screen";

export default function TurbidityScreen() {
  return (
    <SensorDetailScreen
      title="Turbidez da Água"
      label="turbidez atual"
      value={1.3}
      decimals={1}
      unit="NTU"
      icon="turbidity"
      accent="#62D878"
      progress={87}
      status="Boa"
      description="Água clara, com baixa presença de partículas."
      recommendedRange="0 – 5 NTU"
      rangeStart={0}
      rangeWidth={50}
      markerPosition={13}
      primaryLabel="Transparência"
      primaryValue="Alta"
      secondaryLabel="Limite configurado"
      secondaryValue="5,0 NTU"
      insightTitle="Baixa concentração"
      insight="A leitura indica pouca matéria suspensa e boa transparência."
    />
  );
}
