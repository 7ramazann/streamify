// session.model.ts
import { Field, ObjectType, ID } from '@nestjs/graphql'
import { SessionMetadataModel } from './session-metadata.model'

@ObjectType()
export class SessionModel {
  @Field(() => ID)
  id: string

  @Field()
  userId: string

  @Field()
  createdAt: Date

  @Field(() => SessionMetadataModel)
  metadata: SessionMetadataModel
}
