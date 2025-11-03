import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { uploadFileToS3 } from '../../utils/s3-upload';
import { Image } from './schemas/image.schema';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { Types } from 'mongoose';
dotenv.config();

@Injectable()
export class ImageService {
    private readonly s3: S3Client;
    private readonly bucketName: string;

    constructor(
        @InjectModel(Image.name) private readonly imageModel: Model<Image>,
    ) {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
        this.s3 = new S3Client({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }
async remove(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid image ID');
  }

  const image = await this.imageModel.findById(id).exec();
  if (!image) throw new NotFoundException('Image not found');

  try {
    const key = image.url.split('.amazonaws.com/')[1];
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  } catch (error) {
    console.error('Failed to delete from S3:', error);
  }

  await this.imageModel.findByIdAndDelete(id).exec();
}


// image.service.ts
async findAllByUser(userId: string): Promise<Image[]> {
  try {
    // ✅ Convert userId string to ObjectId
    const userObjectId = new Types.ObjectId(userId);

    // ✅ Find images belonging to that user
    return await this.imageModel
      .find({ user: userObjectId })
      .sort({ createdAt: -1 }) // latest first
      .exec();
  } catch (error) {
    console.error('Error fetching images by user:', error);
    throw new BadRequestException('Failed to fetch user images');
  }
}


async create(
  createImageDto: CreateImageDto,
  file: Express.Multer.File,
  userId: string,
): Promise<Image> {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  try {
    const url = await uploadFileToS3(file);

    const image = new this.imageModel({
      ...createImageDto,
      url,
      user: new Types.ObjectId(userId), 
    });

    return await image.save();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new BadRequestException('Failed to upload image');
  }

}
    // 🔹 Get all images
    async findAll(): Promise<Image[]> {
        return await this.imageModel.find().exec();
    }

    // 🔹 Get one image by ID
    async findOne(id: string): Promise<Image> {
        const image = await this.imageModel.findById(id).exec();
        if (!image) throw new NotFoundException('Image not found');
        return image;
    }

    // 🔹 Update image metadata
    async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
        const image = await this.imageModel.findByIdAndUpdate(id, updateImageDto, { new: true }).exec();
        if (!image) throw new NotFoundException('Image not found');
        return image;
    }

 
}
