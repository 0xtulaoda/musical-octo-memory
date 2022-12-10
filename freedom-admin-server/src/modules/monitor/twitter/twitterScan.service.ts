import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResultData } from '@src/common/utils/result';
import { Model } from 'mongoose';
import { CreateTwitterDto } from './dto/create-twitter.dto';
import { Twitter, TwitterDocument } from './schemas/twitter.schema';
import { LoggerService } from 'src/shared/logger/logger.service';

export type PaginationOptionsInterface = {
  pageSize: number;
  page: number;
  followerOwnerId?: string;
  [key: string]: any;
};

@Injectable()
export class TwitterScanService {
  constructor(
    @InjectModel(Twitter.name)
    private readonly twitterModel: Model<TwitterDocument>,
    private logger: LoggerService,
  ) {}

  async create(
    userInfo,
    createTwitterDto: CreateTwitterDto,
  ): Promise<ResultData> {
    createTwitterDto.monitorUserId = userInfo.uid;
    this.logger.log('createTwitterDto', createTwitterDto);
    const createdTwitter = await this.twitterModel.create(createTwitterDto);
    return ResultData.ok(createdTwitter);
  }

  async update(
    id: string,
    createTwitterDto: Partial<TwitterDocument>,
  ): Promise<ResultData> {
    const result = this.twitterModel.findOneAndUpdate(
      { _id: id },
      createTwitterDto,
      { new: true },
    );
    return ResultData.ok(result);
  }

  async delete(id: string): Promise<ResultData> {
    const createdTwitter = await this.twitterModel.deleteOne({ _id: id });
    return ResultData.ok(createdTwitter);
  }

  async findAll(): Promise<Twitter[]> {
    return this.twitterModel.find().lean();
  }

  async findTwitterMonitorListByPage(
    userInfo,
    params: PaginationOptionsInterface,
  ): Promise<any> {
    const limit = Number(params.pageSize) || 20; //分页参数
    let currentPage = Number(params.page) || 1; //当前页码
    if (currentPage < 1) {
      currentPage = 1;
    }
    const offset = (Number(currentPage) - 1) * Number(limit);
    console.log('userInfo', userInfo);
    const total = await this.twitterModel
      .find(
        {
          monitorUserId: userInfo.uid,
          ...params,
          // description: { $regex: `/${params?.description}/` },
        },
        null,
        null,
      )
      .lean()
      .count();
    const list = await this.twitterModel
      .find({ monitorUserId: userInfo.uid, ...params }, null, null)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .lean();
    const lastList = list.map((item) => ({
      id: item._id.toString(),
      ...item,
    }));
    return { list: lastList, total };
  }
}
