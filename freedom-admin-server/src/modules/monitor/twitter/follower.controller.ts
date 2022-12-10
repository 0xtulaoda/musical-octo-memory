import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiResult } from '@src/common/decorators/api-result.decorator';
import { ResultData } from '@src/common/utils/result';
import { PermissionOptional } from 'src/modules/admin/core/decorators/permission-optional.decorator';
import {
  CreateFollowerDto,
  PaginationOptionsDto,
} from './dto/create-twitter.dto';
import { FollowerService } from './follower.service';
import { Follower } from './schemas/follower.schema';

import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

@ApiTags('监控-Follower监控')
@Controller('follower')
@ApiExtraModels(ResultData, Follower)
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post('createFollower')
  @ApiResult()
  @PermissionOptional()
  async create(@Body() createFollowerDto: CreateFollowerDto) {
    await this.followerService.create(createFollowerDto);
  }

  @Get('findAllFollower')
  @ApiResult()
  @PermissionOptional()
  async findAll(): Promise<Follower[]> {
    return await this.followerService.findAll();
  }

  @Post('findTwitterFollowerList')
  @HttpCode(HttpStatus.OK)
  @PermissionOptional()
  @ApiResult(Follower, true, true)
  async findTwitterFollowerList(
    @Body() params: PaginationOptionsDto,
  ): Promise<ResultData> {
    return await this.followerService.findTwitterFollowerList(params);
  }

  @Post('findTwitterNewFollowerList')
  @HttpCode(HttpStatus.OK)
  @PermissionOptional()
  @ApiResult(Follower, true, true)
  async findTwitterNewFollowerList(
    @Body() params: PaginationOptionsDto,
  ): Promise<ResultData> {
    return await this.followerService.findTwitterNewFollowerList(params);
  }
}
