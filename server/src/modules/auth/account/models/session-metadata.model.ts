// session-metadata.model.ts
import { Field, ObjectType } from '@nestjs/graphql'
import { SessionDeviceModel } from './session-device.model'
import { SessionLocationModel } from './session-location.model'

@ObjectType()
export class SessionMetadataModel {
  @Field()
  ip: string

  @Field(() => SessionLocationModel)
  location: SessionLocationModel

  @Field(() => SessionDeviceModel)
  device: SessionDeviceModel
}
