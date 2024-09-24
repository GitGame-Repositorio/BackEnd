const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../../src/env.ts");
const jsonData = require("./data.json");

const prisma = new PrismaClient();

async function main() {
  const passHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    await tx.chapter.createMany({ data: jsonData.chapter });
    await tx.level.createMany({ data: jsonData.level });

    await tx.orderLevel.createMany({ data: jsonData.orderLevel });
    await tx.assessment.createMany({ data: jsonData.assessment });

    const newSubjects = jsonData.orderLevel
      .map((objOrderLevel) => {
        const level = jsonData.level.find(
          (objLevel) => objLevel.id == objOrderLevel.id_level
        );
        const title = level.title + " " + objOrderLevel.order;
        const text =
          "Omnis et in voluptatum. Cum dolores voluptates nam repellendus. Sunt architecto nostrum rerum. Est quidem dolor ut et.";

        const isActivity = jsonData.activity.some(
          (objActivity) => objActivity.id_order_level === objOrderLevel.id
        );

        if (isActivity) return null;

        const subject = jsonData.subject.find(
          (objSubject) => objSubject.id_order_level === objOrderLevel.id
        );
        const result = subject || {
          title,
          text,
          id_order_level: objOrderLevel.id,
        };

        return result;
      })
      .filter((obj) => obj);

    await tx.activity.createMany({ data: jsonData.activity });
    await tx.subject.createMany({ data: newSubjects });

    const adminMain = await tx.user.create({
      data: {
        userLogged: {
          create: {
            email: ADMIN_EMAIL,
            password: passHash,
            admin: {
              create: {
                privilegies: {
                  create: {
                    canEditPrivilegiesAdmin: true,
                    canReorderContentGame: true,
                    canManageContentGame: true,
                    canManageCRUDReports: true,
                    canManageCRUDPlayer: true,
                    canViewAllAdmin: true,
                    canCreateAdmin: true,
                    canDeleteAdmin: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await tx.reports.createMany({
      data: jsonData.reports.map((obj) => ({ ...obj, id_user: adminMain.id })),
    });
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
