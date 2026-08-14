import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlEntity } from './entity/url.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'decorators/currentUser.decorator';

@ApiTags('URL Shortener')
@Controller('url')
export class UrlController {

  constructor(private readonly urlService: UrlService) { }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Create a shortened URL',
    description: 'Generates a unique short code for the provided original URL.',
  })
  @ApiBody({
    type: CreateUrlDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully',
    schema: {
      example: 'http://localhost:3000/url/aB3xY91Q',
    },
  })
  async createShortUrl(
    @Body() createUrlDto: CreateUrlDto, @CurrentUser() user: any,
  ): Promise<string> {
    return await this.urlService.createShortUrl(createUrlDto.originalUrl, user);
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Get all shortened URLs',
    description: 'Returns a list of all generated shortened URLs.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of shortened URLs retrieved successfully',
    type: [UrlEntity],
  })
  async getAllShortenedUrls() {
    return await this.urlService.getAllShortenedUrls();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get("/user")
  @ApiOperation({
    summary: 'Get all shortened URLs for a specific user',
    description: 'Returns a list of all generated shortened URLs.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of shortened URLs retrieved successfully',
    type: [UrlEntity],
  })
  async getAllShortenedUrlsByUserId(@CurrentUser() user: any) {
    return await this.urlService.getAllShortenedUrlByUserId(user.sub)
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':shortCode')
  @Redirect('', 302)
  @ApiOperation({
    summary: 'Redirect to original URL',
    description:
      'Redirects the user to the original URL associated with the provided short code.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short code of the shortened URL',
    example: 'aB3xY91Q',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async redirectToOriginalUrl(
    @Param('shortCode') shortCode: string,
  ): Promise<{ url: string }> {
    const originalUrl =
      await this.urlService.getOriginalUrlByShortCode(shortCode);

    return {
      url: originalUrl,
    };
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':shortCode/visits')
  @ApiOperation({
    summary: 'Get URL visit count',
    description: 'Returns the number of times a short URL has been accessed.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short code of the shortened URL',
    example: 'aB3xY91Q',
  })
  @ApiResponse({
    status: 200,
    description: 'Visit count retrieved successfully',
    schema: {
      example: {
        visits: 25,
      },
    },
  })
  async getVisitCount(
    @Param('shortCode') shortCode: string,
  ): Promise<{ visits: number }> {
    const visits =
      await this.urlService.getVisitCountByShortCode(shortCode);

    return { visits };
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':shortCode/details')
  @ApiOperation({
    summary: 'Get shortened URL details',
    description:
      'Returns complete information about a shortened URL including creation date and visit count.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short code of the shortened URL',
    example: 'aB3xY91Q',
  })
  @ApiResponse({
    status: 200,
    description: 'URL details retrieved successfully',
    type: UrlEntity,
  })
  async getShortUrlDetailsByShortCode(
    @Param('shortCode') shortCode: string,
  ): Promise<UrlEntity> {
    return await this.urlService.getShortUrlDetailsByShortCode(shortCode);
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch(':shortCode')
  @ApiOperation({
    summary: 'Update original URL',
    description:
      'Updates the destination URL of an existing shortened URL.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Short code of the URL to update',
    example: 'aB3xY91Q',
  })
  @ApiBody({
    type: CreateUrlDto,
  })
  @ApiResponse({
    status: 200,
    description: 'URL updated successfully',
    schema: {
      example: {
        short_code: 'aB3xY91Q',
        new_original_url: 'https://new-example.com',
      },
    },
  })
  async updateShortUrlByShortCode(
    @Param('shortCode') shortCode: string,
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<{ short_code: string; new_original_url: string }> {
    return await this.urlService.updateShortUrlByShortCode(
      shortCode,
      createUrlDto.originalUrl,
    );
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':shortCode')
  @ApiOperation({
    summary: 'Delete shortened URL',
    description:
      'Deletes a shortened URL permanently using its short code.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Short code of the URL to delete',
    example: 'aB3xY91Q',
  })
  @ApiResponse({
    status: 200,
    description: 'URL deleted successfully',
    schema: {
      example: true,
    },
  })
  async deleteShortUrlByShortCode(
    @Param('shortCode') shortCode: string,
  ): Promise<boolean> {
    return await this.urlService.deleteShortUrlByShortCode(shortCode);
  }
}