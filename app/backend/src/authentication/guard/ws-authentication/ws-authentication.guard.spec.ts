import { WsAuthenticationGuard } from './ws-authentication.guard';

describe('WsAuthenticationGuard', () => {
    it('should be defined', () => {
        expect(new WsAuthenticationGuard()).toBeDefined();
    });
});
