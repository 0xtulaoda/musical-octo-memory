import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResultData } from '@src/common/utils/result';
import { Model } from 'mongoose';
import { CreateFollowerDto } from './dto/create-twitter.dto';
import { Follower, FollowerDocument } from './schemas/follower.schema';
import {
  NewFollower,
  NewFollowerDocument,
} from './schemas/new-follower.schema';
import { PaginationOptionsInterface } from './twitterScan.service';

@Injectable()
export class FollowerService {
  constructor(
    @InjectModel(Follower.name)
    private readonly followerModel: Model<FollowerDocument>,
    @InjectModel(NewFollower.name)
    private readonly newFollowerModel: Model<NewFollowerDocument>,
  ) {}

  async create(createFollowerDto: CreateFollowerDto): Promise<Follower> {
    const createdFollower = await this.followerModel.create(createFollowerDto);
    return createdFollower;
  }

  // async batchInsertFollower(createFollowerDto: CreateFollowerDto[]): Promise<Follower[]> {
  //   const createdFollower = await this.followerModel.collection.insertMany(createFollowerDto);
  //   return createdFollower;
  // }

  async batchAdd(followList: Array<Follower>): Promise<Follower[]> {
    // @ts-ignore
    return this.followerModel.collection.insertMany(followList);
  }

  async findAll(filter?: { followerOwnerId: string }): Promise<Follower[]> {
    return this.followerModel.find({ ...filter }).lean();
  }

  async findOneAndDelete(filter?: {
    followerOwnerId: string;
  }): Promise<Follower[]> {
    return this.followerModel.findOneAndDelete({ ...filter });
  }

  async deleteMany(filter?: { followerOwnerId: string }): Promise<Follower[]> {
    // @ts-ignore
    return this.followerModel.deleteMany({ ...filter });
  }

  async findTwitterFollowerList(
    params: PaginationOptionsInterface,
  ): Promise<any> {
    const limit = Number(params.pageSize) || 20; //分页参数
    let currentPage = Number(params.page) || 1; //当前页码

    if (currentPage < 1) {
      currentPage = 1;
    }

    const offset = (Number(currentPage) - 1) * Number(limit);
    const total = await this.followerModel
      .find(
        {
          ...params,
        },
        null,
        null,
      )
      .lean()
      .count();
    const list = await this.followerModel
      .find(
        {
          ...params,
        },
        null,
        null,
      )
      .sort({
        syncDate: -1,
      })
      .skip(offset)
      .limit(limit)
      .lean();
    return { list, total };
  }

  // 最新关注
  async batchAddNewFollowerModel(
    followList: Array<NewFollower>,
  ): Promise<Follower[]> {
    // @ts-ignore
    return this.newFollowerModel.collection.insertMany(followList);
  }

  // 最新关注列表
  async findTwitterNewFollowerList(
    params: PaginationOptionsInterface,
  ): Promise<any> {
    const limit = Number(params.pageSize) || 20; //分页参数
    let currentPage = Number(params.page) || 1; //当前页码

    if (currentPage < 1) {
      currentPage = 1;
    }

    const offset = (Number(currentPage) - 1) * Number(limit);
    const total = await this.newFollowerModel
      .find(
        {
          ...params,
        },
        null,
        null,
      )
      .lean()
      .count();
    const list = await this.newFollowerModel
      .find(
        {
          ...params,
        },
        null,
        null,
      )
      .sort({
        syncDate: -1,
      })
      .skip(offset)
      .limit(limit)
      .lean();
    return { list, total };
  }
}
