const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const file = await prisma.file.findUnique({
        where: { id: "29817bae-2773-47bb-879a-849bfe606d48" }
    });
    console.log("File:", file);
    
    if (file) {
        const fs = require('fs');
        const path = require('path');
        const p = path.join(process.cwd(), "uploads", file.id);
        console.log("Exists:", fs.existsSync(p));
        if (fs.existsSync(p)) {
            console.log("Size:", fs.statSync(p).size);
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
