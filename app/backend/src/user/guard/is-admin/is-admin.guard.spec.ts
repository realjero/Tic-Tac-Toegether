import { IsAdminGuard } from './is-admin.guard';

describe('AdminGuard', () => {
  it('should be defined', () => {
    expect(new IsAdminGuard()).toBeDefined();
  });
});
