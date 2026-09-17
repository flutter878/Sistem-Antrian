import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database SIAP PTSP...");

  // ── Layanan ──────────────────────────────────────────────────
  const layananData = [
    { kode: "INF", nama: "Informasi" },
    { kode: "PBK", nama: "Posbakum" },
    { kode: "ECT", nama: "E-Court" },
    { kode: "PRH", nama: "Produk Hukum" },
  ];

  for (const l of layananData) {
    await prisma.layanan.upsert({
      where: { kode: l.kode },
      update: {},
      create: l,
    });
  }
  console.log("✅ Layanan selesai (4 layanan)");

  // ── Sesi ─────────────────────────────────────────────────────
  const sesiData = [
    { nama: "Pagi", jamMulai: "08:00", jamSelesai: "12:00" },
    { nama: "Siang", jamMulai: "13:00", jamSelesai: "16:00" },
  ];

  for (const s of sesiData) {
    await prisma.sesi.upsert({
      where: { id: sesiData.indexOf(s) + 1 },
      update: {},
      create: s,
    });
  }
  console.log("✅ Sesi selesai (Pagi & Siang)");

  // ── Admin default ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nama: "Administrator",
      username: "admin",
      passwordHash: adminPassword,
      role: "admin",
      aktif: true,
    },
  });
  console.log("✅ Admin default selesai (username: admin, password: Admin@1234)");

  // ── Contoh Petugas ────────────────────────────────────────────
  const petugasPassword = await bcrypt.hash("Petugas@1234", 12);
  const petugasData = [
    { nama: "Petugas Informasi", username: "petugas_inf", loket: "INF" },
    { nama: "Petugas Posbakum", username: "petugas_pbk", loket: "PBK" },
    { nama: "Petugas E-Court", username: "petugas_ect", loket: "ECT" },
    { nama: "Petugas Produk Hukum", username: "petugas_prh", loket: "PRH" },
  ];

  for (const p of petugasData) {
    await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        ...p,
        passwordHash: petugasPassword,
        role: "petugas",
        aktif: true,
      },
    });
  }
  console.log("✅ Contoh petugas selesai (4 petugas, password: Petugas@1234)");

  // ── Contoh Satpam ─────────────────────────────────────────────
  const satpamPassword = await bcrypt.hash("Satpam@1234", 12);
  await prisma.user.upsert({
    where: { username: "satpam" },
    update: {},
    create: {
      nama: "Satpam Utama",
      username: "satpam",
      passwordHash: satpamPassword,
      role: "satpam",
      aktif: true,
    },
  });
  console.log("✅ Satpam default selesai (username: satpam, password: Satpam@1234)");

  console.log("\n🎉 Seeding selesai!");
  console.log("─────────────────────────────────────────");
  console.log("Akun default:");
  console.log("  Admin    : admin / Admin@1234");
  console.log("  Satpam   : satpam / Satpam@1234");
  console.log("  Petugas  : petugas_inf / Petugas@1234");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
