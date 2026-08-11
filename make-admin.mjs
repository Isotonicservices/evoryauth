import { PrismaClient } from './src/generated/prisma/index.js'
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log("Please provide an email. Example: node make-admin.mjs admin@hyper.team")
    process.exit(1)
  }
  
  const user = await prisma.user.update({
    where: { email: email },
    data: { role: 'ADMIN' },
  })
  
  console.log('Successfully made user admin:', user.email, 'Role:', user.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
