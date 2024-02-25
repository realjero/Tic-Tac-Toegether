import { HttpAuthenticationGuard } from './http-authentication.guard';

describe('AuthenticationGuard', () => {
    it('should be defined', () => {
        expect(new HttpAuthenticationGuard()).toBeDefined();
    });
});
