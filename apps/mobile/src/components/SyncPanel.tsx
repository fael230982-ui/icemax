import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  buildFieldCommandChecklist,
  getBlockedCriticalPendingActionsForServiceOrder,
  getCriticalPendingActionsForServiceOrder,
  maxOfflineRetryCount,
  sortOfflineQueueForSync,
  summarizeOfflineQueue,
  type OfflineAction,
} from "../services/api";

type SyncPanelProps = {
  pendingActions: OfflineAction[];
  status: string;
  activeServiceOrderId: string;
  onAddCheckIn: () => void;
  onAddExecutionPack: () => void;
  onAddVisitPreparation: () => void;
  onAddPartsLoad: () => void;
  onAddWarranty: () => void;
  onAddSurvey: () => void;
  onAddManual: () => void;
  onAddQuoteApproval: () => void;
  onAddQuoteActivation: () => void;
  onAddQuoteTimeline: () => void;
  onAddQuoteBoard: () => void;
  onAddQuoteReminder: () => void;
  onAddQuoteExecutionReadiness: () => void;
  onAddQuoteExecutionDispatchQueue: () => void;
  onAddFieldCloseout: () => void;
  onAddFieldSignature: () => void;
  onAddCompletionEmail: () => void;
  onAddFieldCommand: () => void;
  onRequestManagerReview: () => void;
  onSync: () => void;
};

export function SyncPanel({ pendingActions, status, activeServiceOrderId, onAddCheckIn, onAddExecutionPack, onAddVisitPreparation, onAddPartsLoad, onAddWarranty, onAddSurvey, onAddManual, onAddQuoteApproval, onAddQuoteActivation, onAddQuoteTimeline, onAddQuoteBoard, onAddQuoteReminder, onAddQuoteExecutionReadiness, onAddQuoteExecutionDispatchQueue, onAddFieldCloseout, onAddFieldSignature, onAddCompletionEmail, onAddFieldCommand, onRequestManagerReview, onSync }: SyncPanelProps) {
  const summary = summarizeOfflineQueue(pendingActions);
  const sortedActions = sortOfflineQueueForSync(pendingActions);
  const commandChecklist = buildFieldCommandChecklist(pendingActions);
  const activeCriticalActions = getCriticalPendingActionsForServiceOrder(pendingActions, activeServiceOrderId);
  const blockedCriticalActions = getBlockedCriticalPendingActionsForServiceOrder(pendingActions, activeServiceOrderId);

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>Sincronizacao offline</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      {activeCriticalActions.length ? (
        <View style={styles.criticalBox}>
          <Text style={styles.criticalTitle}>Pendencias criticas da OS {activeServiceOrderId}</Text>
          <Text style={styles.criticalDetail}>
            {activeCriticalActions.length} item trava a troca de missao ate sincronizar ou revisar.
          </Text>
          {activeCriticalActions.map((action) => (
            <Text key={action.id} style={styles.criticalItem}>
              {action.label} - tentativa {action.retryCount ?? 0}
            </Text>
          ))}
          <TouchableOpacity style={[styles.button, styles.criticalButton]} onPress={onSync}>
            <Text style={styles.buttonText}>Sincronizar criticas</Text>
          </TouchableOpacity>
          {blockedCriticalActions.length ? (
            <TouchableOpacity style={[styles.button, styles.reviewButton]} onPress={onRequestManagerReview}>
              <Text style={[styles.buttonText, styles.reviewButtonText]}>Solicitar revisao</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onAddCheckIn}>
          <Text style={styles.buttonText}>Check-in offline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddExecutionPack}>
          <Text style={styles.buttonText}>Pacote OS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddVisitPreparation}>
          <Text style={styles.buttonText}>Preparo visita</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddPartsLoad}>
          <Text style={styles.buttonText}>Pecas carregadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddWarranty}>
          <Text style={styles.buttonText}>Garantia apresentada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddSurvey}>
          <Text style={styles.buttonText}>Pesquisa cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddManual}>
          <Text style={styles.buttonText}>Manual consultado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteApproval}>
          <Text style={styles.buttonText}>Orcamento apresentado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteActivation}>
          <Text style={styles.buttonText}>Orcamento liberado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteTimeline}>
          <Text style={styles.buttonText}>Timeline orcamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteBoard}>
          <Text style={styles.buttonText}>Board orcamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteReminder}>
          <Text style={styles.buttonText}>Lembrete orcamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteExecutionReadiness}>
          <Text style={styles.buttonText}>Prontidao orcamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddQuoteExecutionDispatchQueue}>
          <Text style={styles.buttonText}>Fila despacho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddFieldCloseout}>
          <Text style={styles.buttonText}>Fechamento campo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddFieldSignature}>
          <Text style={styles.buttonText}>Assinatura campo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddCompletionEmail}>
          <Text style={styles.buttonText}>E-mail conclusao</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddFieldCommand}>
          <Text style={styles.buttonText}>Comando campo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onSync}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summary}>
        <Text style={styles.count}>{summary.total} acoes pendentes</Text>
        <Text style={styles.meta}>Criticas: {summary.byPriority.critical ?? 0}</Text>
        <Text style={styles.meta}>Altas: {summary.byPriority.high ?? 0}</Text>
        <Text style={styles.meta}>Reenvio: {summary.retrying}</Text>
        <Text style={styles.meta}>Bloqueadas: {summary.blocked}</Text>
      </View>
      <View style={styles.command}>
        {commandChecklist.map((item) => (
          <View key={item.key} style={styles.commandRow}>
            <Text style={styles.commandLabel}>{item.label}</Text>
            <Text style={styles.commandDetail}>{item.status} - {item.detail}</Text>
          </View>
        ))}
      </View>
      {sortedActions.map((action) => (
        <Text key={action.id} style={styles.pending}>
          {action.label} - {action.priority ?? "normal"} - tentativa {action.retryCount ?? 0}
          {(action.retryCount ?? 0) >= maxOfflineRetryCount ? " - revisar" : ""}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderColor: "#DCE7F0",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  title: {
    color: "#102033",
    fontSize: 16,
    fontWeight: "800",
  },
  status: {
    color: "#5D6B7A",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#0B7CEB",
    paddingHorizontal: 14,
  },
  secondary: {
    borderColor: "#DCE7F0",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  secondaryText: {
    color: "#102033",
  },
  criticalBox: {
    gap: 7,
    borderColor: "#F4B4B4",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    padding: 12,
  },
  criticalTitle: {
    color: "#7F1D1D",
    fontWeight: "900",
  },
  criticalDetail: {
    color: "#7F1D1D",
    fontWeight: "700",
  },
  criticalItem: {
    color: "#102033",
    fontWeight: "800",
  },
  criticalButton: {
    alignSelf: "flex-start",
    backgroundColor: "#B42318",
  },
  reviewButton: {
    alignSelf: "flex-start",
    borderColor: "#F4B4B4",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  reviewButtonText: {
    color: "#7F1D1D",
  },
  pending: {
    color: "#102033",
    fontWeight: "700",
  },
  count: {
    color: "#0B7CEB",
    fontWeight: "800",
  },
  meta: {
    color: "#5D6B7A",
    fontWeight: "700",
  },
  command: {
    gap: 8,
    borderColor: "#E8EEF4",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  commandRow: {
    gap: 2,
  },
  commandLabel: {
    color: "#102033",
    fontWeight: "800",
  },
  commandDetail: {
    color: "#5D6B7A",
    fontWeight: "600",
  },
});
