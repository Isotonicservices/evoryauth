const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const license = await prisma.license.findFirst({
        where: { status: 'ACTIVE' },
        include: { app: true }
    });
    console.log(license);
}
main().catch(console.error).finally(() => prisma.$disconnect());
