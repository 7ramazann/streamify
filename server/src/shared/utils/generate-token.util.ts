import { v4 as uuidv4 } from 'uuid'
import { TokenType, User } from '@prisma/client'
import { PrismaService } from '@/core/prisma/prisma.service'

export async function generateToken(
  prismaService: PrismaService,
  user: User,
  type: TokenType,
  isUUID: boolean = true
) {
  const token = isUUID ? uuidv4() : Math.floor(Math.random() * (1000000 - 100000) + 100000).toString()
  const expiresIn = new Date(Date.now() + 300000) // 5 minutes

  const existingToken = await prismaService.token.findFirst({
    where: { type, user: { id: user.id } }
  })

  if (existingToken) {
    await prismaService.token.delete({ where: { id: existingToken.id } })
  }

  return prismaService.token.create({
    data: {
      token,
      expiresIn,
      type,
      user: { connect: { id: user.id } }
    },
    include: {
        // TODO: add later
    //   user: { include: { notificationSettings: true } }
        user: true
    }
  })
}
