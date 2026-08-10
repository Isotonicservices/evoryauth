const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) return console.log('Please provide email');
  
  await prisma.user.update({
    where: { email: email },
    data: { role: 'ADMIN' }
  });
  console.log('Success! Role changed to ADMIN.');
}

main().catch(console.error);
