const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const licenses = await prisma.license.findMany({ take: 1 });
    console.log("Licenses:", licenses);
}
main().catch(console.error).finally(() => prisma.$disconnect());
