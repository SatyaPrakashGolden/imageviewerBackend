import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
  UploadedFile,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Your auth guard

@Controller('images')
@UseGuards(JwtAuthGuard) 
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * 🔹 Upload image to S3 and store metadata in MongoDB
   */
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('image'))
@Post('upload')
async uploadImage(
  @UploadedFile() file: Express.Multer.File,
  @Body() createImageDto: CreateImageDto,
  @Req() req,
) {
  if (!file) throw new BadRequestException('No file uploaded');
  return this.imageService.create(createImageDto, file, req.user.id);
}
 @Get('my')
  async findAllByUser(@Req() req) {
    const userId = req.user.id; // Extracted from JWT token
    return this.imageService.findAllByUser(userId);
  }

  /**
   * 🔹 Get all images
   */
  @Get()
  async findAll() {
    return this.imageService.findAll();
  }

  /**
   * 🔹 Get a single image by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  /**
   * 🔹 Update image metadata (not the actual file)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imageService.update(id, updateImageDto);
  }

  /**
   * 🔹 Delete image (from DB and S3)
   */
@Delete('delete/:id')
async remove(@Param('id') id: string) {
  return this.imageService.remove(id);
}

}
