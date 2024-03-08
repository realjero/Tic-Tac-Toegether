import {Controller, Get, UseGuards} from '@nestjs/common';
import {IsAdminGuard} from "../../../user/guard/is-admin/is-admin.guard";
import {AdminPanelService} from "../../services/admin-panel/admin-panel.service";

@Controller('api/v1')
@UseGuards(IsAdminGuard)
export class AdminPanelController {
    constructor(
        private adminPanelService: AdminPanelService
    ) {}

    @Get('admin/queue')
    async getMatchmakingQueue(): Promise<any> {
        return await this.adminPanelService.getMatchmakingQueue();
    }


    @Get('admin/games')
    async getGames(): Promise<any> {
        return await this.adminPanelService.getAllGames();
    }
}
