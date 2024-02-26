import { Test, TestingModule } from '@nestjs/testing';
import { UserEloRatingService } from './user-elo-rating.service';

describe('UserEloRatingService', () => {
    let service: UserEloRatingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserEloRatingService],
        }).compile();

        service = module.get<UserEloRatingService>(UserEloRatingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
