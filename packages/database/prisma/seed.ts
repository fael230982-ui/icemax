import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-icemax" },
    update: {},
    create: {
      id: "tenant-icemax",
      name: "ICEMAX Ar Condicionado",
      legalName: "ICEMAX Ar Condicionado",
      primaryColor: "#0B7CEB",
      secondaryColor: "#28D8FF",
      supportEmail: "adm.rcsolutions@gmail.com",
      reportEmail: "adm.rcsolutions@gmail.com",
    },
  });
  const devPasswordHash = await argon2.hash("icemax-dev-123");

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "adm.rcsolutions@gmail.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "RAFAEL DA SILVA BEZEERA",
      email: "adm.rcsolutions@gmail.com",
      passwordHash: devPasswordHash,
      role: "owner",
    },
  });

  const technician = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "tecnico@icemax.local" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Tecnico ICEMAX",
      email: "tecnico@icemax.local",
      passwordHash: devPasswordHash,
      role: "technician",
    },
  });

  const customer = await prisma.customer.upsert({
    where: { id: "customer-icemax-climasul" },
    update: {
      name: "ClimaSul Hotel",
      email: "cliente@climasul.local",
      phone: "+5500000000000",
    },
    create: {
      id: "customer-icemax-climasul",
      tenantId: tenant.id,
      name: "ClimaSul Hotel",
      email: "cliente@climasul.local",
      phone: "+5500000000000",
    },
  });

  const address = await prisma.customerAddress.upsert({
    where: { id: "address-icemax-climasul-matriz" },
    update: {
      label: "Matriz",
      street: "Av. Central",
      number: "1180",
      district: "Centro",
      city: "Curitiba",
      state: "PR",
      zipCode: "80000-000",
    },
    create: {
      id: "address-icemax-climasul-matriz",
      tenantId: tenant.id,
      customerId: customer.id,
      label: "Matriz",
      street: "Av. Central",
      number: "1180",
      district: "Centro",
      city: "Curitiba",
      state: "PR",
      zipCode: "80000-000",
    },
  });

  const equipment = await prisma.equipment.upsert({
    where: { id: "equipment-icemax-carrier-60k" },
    update: {
      customerId: customer.id,
      addressId: address.id,
      type: "split_piso_teto",
      brand: "Carrier",
      model: "Piso Teto 60.000",
      serialNumber: "DEV-ICM-0001",
      capacityBtu: 60000,
      installationLocation: "Recepcao",
    },
    create: {
      id: "equipment-icemax-carrier-60k",
      tenantId: tenant.id,
      customerId: customer.id,
      addressId: address.id,
      type: "split_piso_teto",
      brand: "Carrier",
      model: "Piso Teto 60.000",
      serialNumber: "DEV-ICM-0001",
      capacityBtu: 60000,
      installationLocation: "Recepcao",
    },
  });

  const order = await prisma.serviceOrder.upsert({
    where: { id: "order-icemax-dev-001" },
    update: {
      customerId: customer.id,
      equipmentId: equipment.id,
      addressId: address.id,
      assignedTechnicianId: technician.id,
      openedByUserId: admin.id,
      title: "Equipamento sem refrigeracao",
      description: "Cliente relata baixa eficiencia de refrigeracao.",
      priority: "emergency",
      status: "scheduled",
      scheduledStart: new Date("2026-05-12T11:00:00.000Z"),
      scheduledEnd: new Date("2026-05-12T13:00:00.000Z"),
    },
    create: {
      id: "order-icemax-dev-001",
      tenantId: tenant.id,
      customerId: customer.id,
      equipmentId: equipment.id,
      addressId: address.id,
      assignedTechnicianId: technician.id,
      openedByUserId: admin.id,
      title: "Equipamento sem refrigeracao",
      description: "Cliente relata baixa eficiencia de refrigeracao.",
      priority: "emergency",
      status: "scheduled",
      scheduledStart: new Date("2026-05-12T11:00:00.000Z"),
      scheduledEnd: new Date("2026-05-12T13:00:00.000Z"),
    },
  });

  const contract = await prisma.serviceContract.upsert({
    where: { id: "contract-icemax-trimestral" },
    update: {
      customerId: customer.id,
      addressId: address.id,
      name: "Contrato preventivo trimestral",
      recurrenceMonths: 3,
      startDate: new Date("2026-05-12T00:00:00.000Z"),
      includesPreventive: true,
      includesCleaning: true,
    },
    create: {
      id: "contract-icemax-trimestral",
      tenantId: tenant.id,
      customerId: customer.id,
      addressId: address.id,
      name: "Contrato preventivo trimestral",
      recurrenceMonths: 3,
      startDate: new Date("2026-05-12T00:00:00.000Z"),
      includesPreventive: true,
      includesCleaning: true,
    },
  });

  await prisma.serviceContractEquipment.upsert({
    where: {
      contractId_equipmentId: {
        contractId: contract.id,
        equipmentId: equipment.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      contractId: contract.id,
      equipmentId: equipment.id,
    },
  });

  await prisma.serviceContractVisit.upsert({
    where: { id: "visit-icemax-trimestral-001" },
    update: {
      serviceOrderId: order.id,
      expectedDate: new Date("2026-05-12T00:00:00.000Z"),
      status: "scheduled",
    },
    create: {
      id: "visit-icemax-trimestral-001",
      tenantId: tenant.id,
      contractId: contract.id,
      serviceOrderId: order.id,
      expectedDate: new Date("2026-05-12T00:00:00.000Z"),
      status: "scheduled",
    },
  });

  const capacitor = await prisma.part.upsert({
    where: { id: "part-icemax-cap-45" },
    update: {
      sku: "CAP-45",
      name: "Capacitor 45uF",
      unit: "un",
      costPrice: 32,
      salePrice: 85,
      minimumStock: 6,
    },
    create: {
      id: "part-icemax-cap-45",
      tenantId: tenant.id,
      sku: "CAP-45",
      name: "Capacitor 45uF",
      unit: "un",
      costPrice: 32,
      salePrice: 85,
      minimumStock: 6,
    },
  });

  const warehouse = await prisma.stockLocation.upsert({
    where: { id: "stock-location-icemax-warehouse" },
    update: {
      name: "Almoxarifado principal",
      type: "warehouse",
      active: true,
    },
    create: {
      id: "stock-location-icemax-warehouse",
      tenantId: tenant.id,
      name: "Almoxarifado principal",
      type: "warehouse",
    },
  });

  await prisma.stockItem.upsert({
    where: {
      partId_locationId: {
        partId: capacitor.id,
        locationId: warehouse.id,
      },
    },
    update: {
      quantity: 4,
    },
    create: {
      tenantId: tenant.id,
      partId: capacitor.id,
      locationId: warehouse.id,
      quantity: 4,
    },
  });

  const checklist = await prisma.checklistTemplate.upsert({
    where: { id: "checklist-icemax-preventiva-split" },
    update: {
      name: "Preventiva split",
      serviceType: "preventive",
      active: true,
    },
    create: {
      id: "checklist-icemax-preventiva-split",
      tenantId: tenant.id,
      name: "Preventiva split",
      serviceType: "preventive",
    },
  });

  await Promise.all([
    prisma.checklistItem.upsert({
      where: { id: "checklist-item-icemax-filtros" },
      update: { label: "Limpeza dos filtros", required: true, inputType: "checkbox", sortOrder: 1 },
      create: {
        id: "checklist-item-icemax-filtros",
        tenantId: tenant.id,
        templateId: checklist.id,
        label: "Limpeza dos filtros",
        required: true,
        sortOrder: 1,
      },
    }),
    prisma.checklistItem.upsert({
      where: { id: "checklist-item-icemax-dreno" },
      update: { label: "Verificacao do dreno", required: true, inputType: "checkbox", sortOrder: 2 },
      create: {
        id: "checklist-item-icemax-dreno",
        tenantId: tenant.id,
        templateId: checklist.id,
        label: "Verificacao do dreno",
        required: true,
        sortOrder: 2,
      },
    }),
    prisma.checklistItem.upsert({
      where: { id: "checklist-item-icemax-temperatura" },
      update: { label: "Medicao de temperatura", required: true, inputType: "number", sortOrder: 3 },
      create: {
        id: "checklist-item-icemax-temperatura",
        tenantId: tenant.id,
        templateId: checklist.id,
        label: "Medicao de temperatura",
        required: true,
        inputType: "number",
        sortOrder: 3,
      },
    }),
    prisma.checklistItem.upsert({
      where: { id: "checklist-item-icemax-fotos" },
      update: { label: "Fotos antes e depois", required: true, inputType: "photo", sortOrder: 4 },
      create: {
        id: "checklist-item-icemax-fotos",
        tenantId: tenant.id,
        templateId: checklist.id,
        label: "Fotos antes e depois",
        required: true,
        inputType: "photo",
        sortOrder: 4,
      },
    }),
  ]);

  await prisma.manual.upsert({
    where: { id: "manual-icemax-carrier-60k" },
    update: {
      title: "Manual Carrier Piso Teto 60k",
      brand: "Carrier",
      model: "Piso Teto 60.000",
      equipmentType: "split_piso_teto",
      capacityBtu: 60000,
      fileUrl: "https://example.com/manual-carrier-piso-teto-60k.pdf",
    },
    create: {
      id: "manual-icemax-carrier-60k",
      tenantId: tenant.id,
      title: "Manual Carrier Piso Teto 60k",
      brand: "Carrier",
      model: "Piso Teto 60.000",
      equipmentType: "split_piso_teto",
      capacityBtu: 60000,
      fileUrl: "https://example.com/manual-carrier-piso-teto-60k.pdf",
    },
  });

  await prisma.publicAccessToken.upsert({
    where: {
      tenantId_tokenHash: {
        tenantId: tenant.id,
        tokenHash: "dev-public-token-hash-not-secret",
      },
    },
    update: {
      scope: "service_order_tracking",
      entityType: "service_order",
      entityId: order.id,
      customerId: customer.id,
      customerEmail: customer.email,
      expiresAt: new Date("2026-12-31T23:59:59.000Z"),
      revokedAt: null,
    },
    create: {
      tenantId: tenant.id,
      tokenHash: "dev-public-token-hash-not-secret",
      scope: "service_order_tracking",
      entityType: "service_order",
      entityId: order.id,
      customerId: customer.id,
      customerEmail: customer.email,
      expiresAt: new Date("2026-12-31T23:59:59.000Z"),
      metadata: {
        environment: "development",
        rawTokenStored: false,
        purpose: "smoke test de token publico com hash",
      },
    },
  });

  await prisma.integrationSetting.createMany({
    data: [
      { tenantId: tenant.id, provider: "openai", status: "not_configured" },
      { tenantId: tenant.id, provider: "google_maps", status: "not_configured" },
      { tenantId: tenant.id, provider: "whatsapp", status: "not_configured" },
      { tenantId: tenant.id, provider: "email", status: "not_configured" },
    ],
    skipDuplicates: true,
  });

  console.log({
    tenant: tenant.name,
    owner: admin.email,
    devPassword: "icemax-dev-123",
    technician: technician.email,
    customer: customer.name,
    equipment: equipment.serialNumber,
    order: order.id,
    contract: contract.name,
    checklist: checklist.name,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
