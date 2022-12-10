import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PermissionOptional } from 'src/modules/admin/core/decorators/permission-optional.decorator';
import {
  CreateTwitterDto,
  PaginationOptionsDto,
} from './dto/create-twitter.dto';
import { Twitter, TwitterDocument } from './schemas/twitter.schema';
import { TwitterScanService } from './twitterScan.service';
import { ApiTags } from '@nestjs/swagger';
import { TwitterService } from 'nestjs-twitter-lite';
import { LoggerService } from '@src/shared/logger/logger.service';

@ApiTags('监控-Twitter监控')
@Controller('twitter')
// @ApiExtraModels(ResultData, Twitter)
export class TwitterController {
  constructor(
    private readonly twitterScanService: TwitterScanService,
    private readonly twitterService: TwitterService,
    private logger: LoggerService,
  ) {}

  @Post('add')
  @PermissionOptional()
  async create(@Req() req, @Body() createCatDto: CreateTwitterDto) {
    return await this.twitterScanService.create(req.adminUser, createCatDto);
  }

  @Post('update')
  @PermissionOptional()
  async update(@Body() createCatDto: TwitterDocument) {
    return await this.twitterScanService.update(createCatDto.id, createCatDto);
  }

  @Delete('/delete/:id')
  @PermissionOptional()
  async delete(@Param('id') id: string) {
    return await this.twitterScanService.delete(id);
  }

  @Get('findAllOwner')
  @PermissionOptional()
  async findAll(): Promise<Twitter[]> {
    return await this.twitterScanService.findAll();
  }

  @Post('findTwitterMonitorListByPage')
  @PermissionOptional()
  async findTwitterMonitorListByPage(
    @Req() req,
    @Body() params: PaginationOptionsDto,
  ): Promise<any> {
    return await this.twitterScanService.findTwitterMonitorListByPage(
      req.adminUser,
      params,
    );
  }

  @Post('searchByUserName')
  @PermissionOptional()
  async searchByUserName(
    @Body('username') username: string,
  ): Promise<Twitter[]> {
    const parameters = {
      'user.fields':
        'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics',
    };
    return await this.twitterService
      .get(`users/by/username/${username}`, parameters)
      .catch((error) => {
        this.logger.error(`调用推特API出错: ${JSON.stringify(error)}`);
      });
  }
}
