// session-device.model.ts
import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SessionDeviceModel {
  @Field()
  browser: string

  @Field()
  os: string

  @Field()
  type: string
}
