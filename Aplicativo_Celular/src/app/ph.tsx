import { SensorDetailScreen } from "@/features/monitoring/components/sensor-detail-screen";

export default function PhScreen() {
  return (
    <SensorDetailScreen
      title="Nível de pH"
      label="pH atual"
      value={7.1}
      decimals={1}
      icon="drop"
      accent="#4DB6E8"
      progress={71}
      status="Ideal"
      description="Água com pH neutro e equilibrado."
      recommendedRange="6,5 – 8,5"
      rangeStart={46}
      rangeWidth={28}
      markerPosition={51}
      primaryLabel="Classificação"
      primaryValue="Neutro"
      secondaryLabel="Variação nas últimas 24h"
      secondaryValue="+0,1"
      insightTitle="Leitura saudável"
      insight="O valor está dentro da faixa recomendada para água potável."
    />
  );
}
