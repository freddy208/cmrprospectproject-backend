/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { SimulateurService } from './simulateur.service';

describe('SimulateurService', () => {
  let service: SimulateurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimulateurService],
    }).compile();

    service = module.get<SimulateurService>(SimulateurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
