import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ContractCard } from "./src/components/ContractCard";
import { InfoCard } from "./src/components/InfoCard";
import { OrderCard } from "./src/components/OrderCard";
import { Section } from "./src/components/Section";
import { SyncPanel } from "./src/components/SyncPanel";
import { approvedQuoteActivation, completionEmailPackage, contracts, executionSteps, fieldCloseoutPackage, fieldSignaturePackage, orders, quality, quoteApprovalBoard, quoteApprovalReminders, quoteApprovalTimeline, quoteExecutionDispatchQueue, quoteExecutionReadiness, tools } from "./src/data/dashboard";
import {
  createApprovedQuoteActivationAckAction,
  createCheckInAction,
  createChecklistAction,
  createCustomerSignatureAction,
  createFieldCompletionEmailAckAction,
  createFieldCustomerSignaturePackageAckAction,
  createFieldExecutionCloseoutAckAction,
  createLocationAction,
  createManualConsultedAction,
  createPartsLoadAckAction,
  createPartUsageAction,
  createPhotoEvidenceAction,
  createQuoteApprovalPresentedAction,
  createQuoteBoardViewedAction,
  createQuoteExecutionDispatchQueueAckAction,
  createQuoteExecutionReadinessAckAction,
  createQuoteReminderPresentedAction,
  createQuoteTimelineViewedAction,
  createSatisfactionSurveyAction,
  createVisitPreparationAckAction,
  createWarrantyPresentedAction,
  OfflineAction,
  syncOfflineQueuePartially,
} from "./src/services/api";
import { clearOfflineQueue, loadOfflineQueueSnapshot, saveOfflineQueue } from "./src/services/offline-storage";
import { visitPreparation } from "./src/data/dashboard";
import { reservedParts } from "./src/data/dashboard";
import { warrantyPackage } from "./src/data/dashboard";
import { postService } from "./src/data/dashboard";
import { manualPackage } from "./src/data/dashboard";
import { quoteApproval } from "./src/data/dashboard";

export default function App() {
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [syncStatus, setSyncStatus] = useState("Sem pendencias.");
  const [queueLoaded, setQueueLoaded] = useState(false);

  useEffect(() => {
    void loadOfflineQueueSnapshot()
      .then((snapshot) => {
        setPendingActions(snapshot.actions);
        setSyncStatus(
          snapshot.discarded
            ? `${snapshot.actions.length} pendencias restauradas. ${snapshot.discarded} antigas foram descartadas.`
            : snapshot.actions.length ? "Fila offline restaurada do aparelho." : "Sem pendencias.",
        );
      })
      .catch(() => setSyncStatus("Nao foi possivel restaurar a fila offline."))
      .finally(() => setQueueLoaded(true));
  }, []);

  useEffect(() => {
    if (queueLoaded) {
      void saveOfflineQueue(pendingActions);
    }
  }, [pendingActions, queueLoaded]);

  function addCheckIn() {
    const action = createCheckInAction("1048");
    const location = createLocationAction("tech-001", "1048");
    setPendingActions((current) => [location, action, ...current]);
    setSyncStatus("Acao salva para envio quando houver conexao.");
  }

  function addExecutionPack() {
    const serviceOrderId = "1048";
    const actions = [
      createLocationAction("tech-001", serviceOrderId),
      createCheckInAction(serviceOrderId),
      createChecklistAction(serviceOrderId, "checklist-001", "Limpeza dos filtros concluida."),
      createPhotoEvidenceAction(serviceOrderId, "before"),
      createPhotoEvidenceAction(serviceOrderId, "after"),
      createPartUsageAction(serviceOrderId, "part-001", 1),
      createCustomerSignatureAction(serviceOrderId, "Cliente Decisor"),
    ];

    setPendingActions((current) => [...actions, ...current]);
    setSyncStatus("Pacote completo de execucao salvo offline.");
  }

  function addVisitPreparationAck() {
    const action = createVisitPreparationAckAction("1048", "tech-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Confirmacao de preparo da visita salva offline.");
  }

  function addPartsLoadAck() {
    const action = createPartsLoadAckAction("1048", "tech-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Confirmacao de pecas carregadas salva offline.");
  }

  function addWarrantyPresented() {
    const action = createWarrantyPresentedAction("1048", "customer-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Garantia apresentada ao cliente salva offline.");
  }

  function addSatisfactionSurvey() {
    const action = createSatisfactionSurveyAction("1048", "customer-001", 9);
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Pesquisa de satisfacao salva offline.");
  }

  function addManualConsulted() {
    const action = createManualConsultedAction("1048", "manual-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Consulta ao manual tecnico salva offline.");
  }

  function addQuoteApprovalPresented() {
    const action = createQuoteApprovalPresentedAction("1048", "quote-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Apresentacao do orcamento salva offline.");
  }

  function addApprovedQuoteActivationAck() {
    const action = createApprovedQuoteActivationAckAction("1049", "quote-002");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Liberacao do orcamento aprovado salva offline.");
  }

  function addQuoteTimelineViewed() {
    const action = createQuoteTimelineViewedAction("1049", "quote-002");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Consulta da timeline do orcamento salva offline.");
  }

  function addQuoteBoardViewed() {
    const action = createQuoteBoardViewedAction("1049");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Consulta do board de orcamentos salva offline.");
  }

  function addQuoteReminderPresented() {
    const action = createQuoteReminderPresentedAction("1048", "quote-001");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Lembrete do orcamento salvo offline.");
  }

  function addQuoteExecutionReadinessAck() {
    const action = createQuoteExecutionReadinessAckAction("1049", "quote-002");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Prontidao do orcamento salva offline.");
  }

  function addQuoteExecutionDispatchQueueAck() {
    const action = createQuoteExecutionDispatchQueueAckAction("1049", "quote-002");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Fila de despacho do orcamento salva offline.");
  }

  function addFieldExecutionCloseoutAck() {
    const action = createFieldExecutionCloseoutAckAction("1049", "quote-002");
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Fechamento tecnico salvo offline.");
  }

  function addFieldCustomerSignatureAck() {
    const actions = [
      createFieldCustomerSignaturePackageAckAction("1049", "quote-002", "Cliente Decisor"),
      createCustomerSignatureAction("1049", "Cliente Decisor"),
    ];
    setPendingActions((current) => [...actions, ...current]);
    setSyncStatus("Assinatura e termos salvos offline.");
  }

  function addFieldCompletionEmailAck() {
    const action = createFieldCompletionEmailAckAction("1049", "quote-002", false);
    setPendingActions((current) => [action, ...current]);
    setSyncStatus("Pacote de e-mail final salvo offline.");
  }

  async function syncPending() {
    if (!pendingActions.length) {
      setSyncStatus("Nada para sincronizar.");
      return;
    }

    const result = await syncOfflineQueuePartially(pendingActions);

    if (result.ok) {
      setPendingActions([]);
      await clearOfflineQueue();
      setSyncStatus(`${result.synced} acoes enviadas para a API.`);
      return;
    }

    setPendingActions(result.remaining);
    setSyncStatus(
      `${result.synced} acoes enviadas. ${result.remaining.length} pendentes. Falha em ${result.failedLabel}: ${result.errorMessage}`,
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ICEMAX Tecnico</Text>
          <Text style={styles.title}>Operacao de campo</Text>
        </View>

        <Section title="Ordens de servico">
          {orders.map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
        </Section>

        <Section title="Modo offline">
          <SyncPanel
            pendingActions={pendingActions}
            status={syncStatus}
            onAddCheckIn={addCheckIn}
            onAddExecutionPack={addExecutionPack}
            onAddVisitPreparation={addVisitPreparationAck}
            onAddPartsLoad={addPartsLoadAck}
            onAddWarranty={addWarrantyPresented}
            onAddSurvey={addSatisfactionSurvey}
            onAddManual={addManualConsulted}
            onAddQuoteApproval={addQuoteApprovalPresented}
            onAddQuoteActivation={addApprovedQuoteActivationAck}
            onAddQuoteTimeline={addQuoteTimelineViewed}
            onAddQuoteBoard={addQuoteBoardViewed}
            onAddQuoteReminder={addQuoteReminderPresented}
            onAddQuoteExecutionReadiness={addQuoteExecutionReadinessAck}
            onAddQuoteExecutionDispatchQueue={addQuoteExecutionDispatchQueueAck}
            onAddFieldCloseout={addFieldExecutionCloseoutAck}
            onAddFieldSignature={addFieldCustomerSignatureAck}
            onAddCompletionEmail={addFieldCompletionEmailAck}
            onSync={syncPending}
          />
        </Section>

        <Section title="Preparo da visita">
          <View style={styles.grid}>
            {visitPreparation.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Manual tecnico">
          <View style={styles.grid}>
            {manualPackage.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Orcamento">
          <View style={styles.grid}>
            {quoteApproval.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Orcamento liberado">
          <View style={styles.grid}>
            {approvedQuoteActivation.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Timeline do orcamento">
          <View style={styles.grid}>
            {quoteApprovalTimeline.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Board de orcamentos">
          <View style={styles.grid}>
            {quoteApprovalBoard.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Lembretes de orcamento">
          <View style={styles.grid}>
            {quoteApprovalReminders.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Prontidao do orcamento">
          <View style={styles.grid}>
            {quoteExecutionReadiness.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Fila de despacho">
          <View style={styles.grid}>
            {quoteExecutionDispatchQueue.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Fechamento de campo">
          <View style={styles.grid}>
            {fieldCloseoutPackage.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Assinatura do cliente">
          <View style={styles.grid}>
            {fieldSignaturePackage.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="E-mail de conclusao">
          <View style={styles.grid}>
            {completionEmailPackage.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Pecas reservadas">
          <View style={styles.grid}>
            {reservedParts.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Garantia da OS">
          <View style={styles.grid}>
            {warrantyPackage.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Pos-atendimento">
          <View style={styles.grid}>
            {postService.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.detail} />
            ))}
          </View>
        </Section>

        <Section title="Ferramentas">
          <View style={styles.grid}>
            {tools.map((tool) => (
              <InfoCard key={tool.title} title={tool.title} detail={tool.detail} />
            ))}
          </View>
        </Section>

        <Section title="Execucao da OS">
          <View style={styles.grid}>
            {executionSteps.map((step) => (
              <InfoCard key={step.title} title={step.title} detail={step.detail} />
            ))}
          </View>
        </Section>

        <Section title="Contratos proximos">
          {contracts.map((contract) => (
            <ContractCard key={contract.customer} {...contract} />
          ))}
        </Section>

        <Section title="Qualidade">
          <View style={styles.grid}>
            {quality.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.value} />
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },
  container: {
    padding: 20,
    gap: 18,
  },
  header: {
    paddingVertical: 18,
  },
  eyebrow: {
    color: "#0B7CEB",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#102033",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
