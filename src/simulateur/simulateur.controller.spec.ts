/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { SimulateurController } from './simulateur.controller';

describe('SimulateurController', () => {
  let controller: SimulateurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulateurController],
    }).compile();

    controller = module.get<SimulateurController>(SimulateurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
