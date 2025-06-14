// session-location.model.ts
import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SessionLocationModel {
  @Field()
  country: string

  @Field()
  city: string

  @Field(() => Float)
  latidute: number

  @Field(() => Float)
  longitude: number
}
