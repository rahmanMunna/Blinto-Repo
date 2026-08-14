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

    async createShortUrl(originalUrl: string, user: any): Promise<string> {
        const shortCode = this.generateShortCode();

        // save to db
        await this.urlRepo.save({
            short_code: shortCode,
            original_url: originalUrl,
            user: {
                id : user.sub
            }
        });

        return `${this.baseUrl}/${shortCode}`;
    }

    /**
     * Loads a short URL that belongs to the given user.
     *
     * Being signed in is not enough to reach someone else's link, so every
     * owner-facing lookup goes through here. A code that exists but belongs to
     * another account answers 404 rather than 403, so the response does not
     * reveal which short codes are taken.
     */
    private async findOwnedOrFail(shortCode: string, userId: string): Promise<UrlEntity> {
        const urlEntity = await this.urlRepo.findOne({
            where: {
                short_code: shortCode,
                user: { id: userId },
            },
        });

        if (!urlEntity) {
            throw new NotFoundException('URL not found');
        }

        return urlEntity;
    }

    /**
     * Public on purpose — this backs the redirect, which anyone holding the
     * short link may follow. It exposes only the destination of a code the
     * visitor already has.
     */
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

    async getShortUrlDetailsByShortCode(shortCode: string, userId: string): Promise<UrlEntity> {
        return await this.findOwnedOrFail(shortCode, userId);
    }

    async getAllShortenedUrlByUserId(id: string) {
        const urls = await this.urlRepo.find({
            where: {
                user: {
                    id: id
                }
            }
        })
        return urls;
    }


    async incrementVisitCount(urlEntity: UrlEntity): Promise<void> {
        urlEntity.visit_count += 1;
        await this.urlRepo.save(urlEntity);
    }

    async getVisitCountByShortCode(shortCode: string, userId: string): Promise<number> {
        const urlEntity = await this.findOwnedOrFail(shortCode, userId);

        return urlEntity?.visit_count || 0;
    }

    async deleteShortUrlByShortCode(shortCode: string, userId: string): Promise<boolean> {
        const urlEntity = await this.findOwnedOrFail(shortCode, userId);

        await this.urlRepo.remove(urlEntity);
        return true;
    }

    async updateShortUrlByShortCode(shortCode: string, newOriginalUrl: string, userId: string): Promise<{ short_code: string; new_original_url: string }> {
        const urlEntity = await this.findOwnedOrFail(shortCode, userId);

        urlEntity.original_url = newOriginalUrl;
        await this.urlRepo.save(urlEntity);

        return {
            short_code: urlEntity.short_code,
            new_original_url: urlEntity.original_url,
        }
    }

}
