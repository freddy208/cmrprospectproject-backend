/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsService } from './interaction.service';

describe('InteractionService', () => {
  let service: InteractionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InteractionsService],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
