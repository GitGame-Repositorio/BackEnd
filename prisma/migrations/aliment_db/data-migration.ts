const { mongo, client: clientMongo } = require("../../../src/database/mongo");
const { db: prisma } = require("../../../src/database/postgres");

const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../../src/env.ts");

const bcrypt = require("bcrypt");
const jsonData = require("./data.json");

const createSubject = (objLevel, index) => {
  const title = objLevel.title + "_0" + index;
  const text =
    "Omnis et in voluptatum. Cum dolores voluptates nam repellendus. Sunt architecto nostrum rerum. Est quidem dolor ut et.";
  return { title, text, id_level: objLevel.id, numberOrder: index };
};

async function main() {
  const passHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    await tx.chapter.createMany({ data: jsonData.chapter });
    await tx.level.createMany({ data: jsonData.level });

    const listSubjects = jsonData.level
      .map((objLevel) => {
        const contentForLevel = jsonData.content.subject.filter(
          (obj) => obj.id_level === objLevel.id
        );

        if (contentForLevel.length) return contentForLevel;
        return Array(3)
          .fill("")
          .map((_, index) => createSubject(objLevel, index + 1));
      })
      .flat()
      .map((obj) => ({ ...obj, type: "subject" }));

    const listActivity = jsonData.content.activity.map((obj) => ({
      ...obj,
      type: "activity",
    }));

    const listContent = [...listSubjects, ...listActivity];

    const listRecord = await Promise.all(
      listContent.map(async (objContent) => {
        const { numberOrder, title, id_level, ...rest } = objContent;

        const objFind = await mongo.content.findOne({ numberOrder, id_level });

        const objAny = objFind
          ? objFind._id
          : (await mongo.content.insertOne(rest)).insertedId;

        const id = objAny.toString();

        return await tx.content.create({
          data: { title, id_content: id, numberOrder, id_level },
        });
      })
    );

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
      data: jsonData.reports.map((obj) => ({
        ...obj,
        id_content: String(listRecord[0].id),
        id_user: adminMain.id,
      })),
    });
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await clientMongo.close();
    console.log("Mongo + Postgres disconnect");
  });
