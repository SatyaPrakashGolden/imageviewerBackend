import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Image, ImageSchema } from './schemas/image.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Image.name, schema: ImageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
