import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema'; // ✅ correct import

@Schema({ timestamps: true })
export class Image extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId; 
}

export const ImageSchema = SchemaFactory.createForClass(Image);
