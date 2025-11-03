import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createToken } from '../../auth/generateToken'; 
import { User, UserDocument } from './schemas/user.schema';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

async register(createUserDto: CreateUserDto) {
  const existingUser = await this.userModel.findOne({ email: createUserDto.email });
  if (existingUser) throw new ConflictException('Email already exists');

  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  const user: UserDocument = await this.userModel.create({
    ...createUserDto,
    password: hashedPassword,
  });

  const token = createToken(user._id.toString());

  return {
    message: 'Registration successful',
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
  };
}

  // 🔹 Login user + return JWT
  async login(loginUserDto: LoginUserDto) {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = createToken(user._id.toString());

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }


  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

async findByEmail(email: string): Promise<User> {
  const user = await this.userModel.findOne({ email }).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}