import { Test, TestingModule } from '@nestjs/testing';
import { TwitterScanService } from './twitterScan.service';
import { getModelToken } from '@nestjs/mongoose';
import { Twitter } from './schemas/twitter.schema';
import { Model } from 'mongoose';

const mockTwitter = {
  name: 'Twitter #1',
  remark: 'Breed #1',
  description: 4,
};

describe('TwitterScanService', () => {
  let service: TwitterScanService;
  let model: Model<Twitter>;

  const twitterArray = [
    {
      name: 'Twitter #1',
      remark: 'Breed #1',
      description: 4,
    },
    {
      name: 'Twitter #2',
      remark: 'Breed #2',
      description: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitterScanService,
        {
          provide: getModelToken('Twitter'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockTwitter),
            constructor: jest.fn().mockResolvedValue(mockTwitter),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TwitterScanService>(TwitterScanService);
    model = module.get<Model<Twitter>>(getModelToken('Twitter'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all twitter', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(twitterArray),
    } as any);
    const twitter = await service.findAll();
    expect(twitter).toEqual(twitterArray);
  });

  it('should insert a new twitter', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        name: 'Twitter #1',
        remark: 'Breed #1',
        description: 4,
      }),
    );
    const newTwitter = await service.create({
      name: 'Twitter #1',
      remark: 'Breed #1',
      description: 4,
    });
    expect(newTwitter).toEqual(mockTwitter);
  });
});
