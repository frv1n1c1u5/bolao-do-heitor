import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const initialAdmins = [
  {
    name: "Heitor",
    nickname: "Heitor",
    phone: "00000000000",
    pin: "0000",
  },
  {
    name: "Vinicius",
    nickname: "Vinicius",
    phone: "99999999999",
    pin: "9999",
  },
];

async function upsertAdmin(admin: (typeof initialAdmins)[number]) {
  const pinHash = await bcrypt.hash(admin.pin, 10);

  return prisma.user.upsert({
    where: { phone: admin.phone },
    update: {
      name: admin.name,
      nickname: admin.nickname,
      role: UserRole.ADMIN,
      pinHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      name: admin.name,
      nickname: admin.nickname,
      phone: admin.phone,
      role: UserRole.ADMIN,
      pinHash,
    },
  });
}

async function main() {
  for (const admin of initialAdmins) {
    await upsertAdmin(admin);
  }

  const settingsCount = await prisma.adminSettings.count();
  if (settingsCount === 0) {
    await prisma.adminSettings.create({
      data: {
        pixReceiverName: "Bolão do Heitor",
        paymentInstructions:
          "Após pagar, clique em Já paguei e aguarde a confirmação manual do admin.",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
