const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const licenses = await prisma.license.findMany();
    console.log("Licenses:", licenses);
    const files = await prisma.file.findMany();
    console.log("Files:", files);
}
main().catch(console.error).finally(() => prisma.$disconnect());
