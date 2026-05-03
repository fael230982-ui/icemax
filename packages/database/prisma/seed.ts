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

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: "ClimaSul Hotel",
      email: "cliente@climasul.local",
      phone: "+5500000000000",
    },
  });

  const address = await prisma.customerAddress.create({
    data: {
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

  const equipment = await prisma.equipment.create({
    data: {
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

  const order = await prisma.serviceOrder.create({
    data: {
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

  const contract = await prisma.serviceContract.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      addressId: address.id,
      name: "Contrato preventivo trimestral",
      recurrenceMonths: 3,
      startDate: new Date("2026-05-12T00:00:00.000Z"),
      includesPreventive: true,
      includesCleaning: true,
      equipment: {
        create: {
          tenantId: tenant.id,
          equipmentId: equipment.id,
        },
      },
      visits: {
        create: {
          tenantId: tenant.id,
          serviceOrderId: order.id,
          expectedDate: new Date("2026-05-12T00:00:00.000Z"),
          status: "scheduled",
        },
      },
    },
  });

  const capacitor = await prisma.part.create({
    data: {
      tenantId: tenant.id,
      sku: "CAP-45",
      name: "Capacitor 45uF",
      unit: "un",
      costPrice: 32,
      salePrice: 85,
      minimumStock: 6,
    },
  });

  const warehouse = await prisma.stockLocation.create({
    data: {
      tenantId: tenant.id,
      name: "Almoxarifado principal",
      type: "warehouse",
    },
  });

  await prisma.stockItem.create({
    data: {
      tenantId: tenant.id,
      partId: capacitor.id,
      locationId: warehouse.id,
      quantity: 4,
    },
  });

  const checklist = await prisma.checklistTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Preventiva split",
      serviceType: "preventive",
      items: {
        create: [
          { tenantId: tenant.id, label: "Limpeza dos filtros", required: true, sortOrder: 1 },
          { tenantId: tenant.id, label: "Verificacao do dreno", required: true, sortOrder: 2 },
          { tenantId: tenant.id, label: "Medicao de temperatura", required: true, inputType: "number", sortOrder: 3 },
          { tenantId: tenant.id, label: "Fotos antes e depois", required: true, inputType: "photo", sortOrder: 4 },
        ],
      },
    },
  });

  await prisma.manual.create({
    data: {
      tenantId: tenant.id,
      title: "Manual Carrier Piso Teto 60k",
      brand: "Carrier",
      model: "Piso Teto 60.000",
      equipmentType: "split_piso_teto",
      capacityBtu: 60000,
      fileUrl: "https://example.com/manual-carrier-piso-teto-60k.pdf",
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
