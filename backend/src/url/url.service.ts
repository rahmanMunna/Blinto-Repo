import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { UrlEntity } from './entity/url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UrlService {

    constructor(@InjectRepository(UrlEntity) private urlRepo: Repository<UrlEntity>) { }

    private baseUrl: string = 'http://localhost:3000/url';

    generateShortCode(): string {
        return nanoid(10);
    }

    async createShortUrl(originalUrl: string): Promise<string> {
        const shortCode = this.generateShortCode();

        // save to db
        await this.urlRepo.save({
            short_code: shortCode,
            original_url: originalUrl,
        });

        return `${this.baseUrl}/${shortCode}`;
    }

    async getOriginalUrlByShortCode(shortCode: string): Promise<string> {
        const urlEntity = await this.urlRepo.findOne({
            where: { short_code: shortCode },
        });

        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }

        await this.incrementVisitCount(urlEntity);
        return urlEntity?.original_url;
    }

    async getShortUrlDetailsByShortCode(shortCode: string): Promise<UrlEntity> {
        const urlEntity = await this.urlRepo.findOne({
            where: { short_code: shortCode },
        });

        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }

        return urlEntity;
    }


    async incrementVisitCount(urlEntity: UrlEntity): Promise<void> {
        urlEntity.visit_count += 1;
        await this.urlRepo.save(urlEntity);
    }

    async getVisitCountByShortCode(shortCode: string): Promise<number> {
        const urlEntity = await this.urlRepo.findOne({
            where: { short_code: shortCode },
        })

        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }

        return urlEntity?.visit_count || 0;
    }

    async getAllShortenedUrls(): Promise<UrlEntity[]> {
        return await this.urlRepo.find();
    }

    async deleteShortUrlByShortCode(shortCode: string): Promise<boolean> {
        const urlEntity = await this.urlRepo.findOne({
            where: { short_code: shortCode },
        });

        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }

        await this.urlRepo.remove(urlEntity);
        return true;
    }

    async updateShortUrlByShortCode(shortCode: string, newOriginalUrl: string): Promise<{ short_code: string; new_original_url: string }> {
        const urlEntity = await this.urlRepo.findOne({
            where: { short_code: shortCode },
        });
        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }
        urlEntity.original_url = newOriginalUrl;
        await this.urlRepo.save(urlEntity);

        return {
            short_code: urlEntity.short_code,
            new_original_url: urlEntity.original_url,
        }
    }

}
