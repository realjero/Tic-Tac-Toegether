import {Controller, Get, HttpStatus, UseGuards} from '@nestjs/common';
import {IsAdminGuardHttp} from "../../../user/guard/is-admin/is-admin-guard-http.service";
import {AdminPanelService} from "../../services/admin-panel/admin-panel.service";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AdminQueueItemDTO} from "../../payload/AdminQueueItemDTO";
import {AdminGameItemDTO} from "../../payload/AdminGameItemDTO";
import {AdminApiOperation} from "../../../custom-swagger-annotations/ApiAdminOperation";

/**
 * `AdminPanelController` is responsible for handling requests related to the admin panel functionalities,
 * such as retrieving the current matchmaking queue and getting a list of all games. It is secured with an
 * `IsAdminGuardHttp` to ensure that only users with administrative privileges can access its routes. It also
 * utilizes custom decorators for enhanced Swagger/OpenAPI documentation.
 *
 * @ApiTags Decorator that associates this controller with the 'Admin Panel' tag in the OpenAPI documentation.
 * @ApiBearerAuth Decorator that indicates these endpoints require Bearer Token authentication in the Swagger documentation.
 * @Controller Decorator that declares this class as a NestJS controller with a base route of 'api/v1'.
 * @UseGuards Decorator that applies the `IsAdminGuardHttp` to all routes within the controller, ensuring that only admin users can access them.
 */
@ApiTags('Admin Panel')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(IsAdminGuardHttp)
export class AdminPanelController {
    /**
     * Constructor to inject dependencies into the AdminPanelController.
     *
     * @param adminPanelService - Service to perform admin panel related operations, such as retrieving matchmaking queues and games.
     */
    constructor(
        private adminPanelService: AdminPanelService
    ) {}

    /**
     * Retrieves the current matchmaking queue, providing details for each item in the queue.
     * This endpoint is intended for administrative purposes to monitor the matchmaking system.
     *
     * @AdminApiOperation Custom decorator that provides a summary and description for Swagger documentation, specifically highlighting admin-only access.
     * @ApiOkResponse Decorator that documents the successful response structure and status code, including the expected type of the response body.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the route as 'admin/queue'.
     *
     * @returns {Promise<AdminQueueItemDTO[]>} A promise that resolves to an array of `AdminQueueItemDTO`, representing the matchmaking queue.
     */
    @AdminApiOperation('Get Matchmaking Queue', 'Retrieves the current matchmaking queue.')
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Matchmaking queue retrieved successfully.', type: AdminQueueItemDTO, isArray: true })
    @Get('admin/queue')
    async getMatchmakingQueue(): Promise<AdminQueueItemDTO[]> {
        return await this.adminPanelService.getMatchmakingQueue();
    }

    /**
     * Retrieves a list of all games that have been played, intended for administrative review and monitoring.
     *
     * @AdminApiOperation Custom decorator that provides a summary and description for Swagger documentation, emphasizing admin-only access.
     * @ApiOkResponse Decorator that documents the successful response structure and status code, including the expected type of the response body.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the route as 'admin/games'.
     *
     * @returns {Promise<AdminGameItemDTO[]>} A promise that resolves to an array of `AdminGameItemDTO`, representing all games.
     */
    @AdminApiOperation('Get All Games', 'Retrieves all games.')
    @ApiOkResponse({ status: HttpStatus.OK, description: 'All games retrieved successfully.', type: AdminGameItemDTO, isArray: true })
    @Get('admin/games')
    async getGames(): Promise<AdminGameItemDTO[]> {
        return await this.adminPanelService.getAllGames();
    }
}
