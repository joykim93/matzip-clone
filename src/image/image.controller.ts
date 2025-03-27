import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { numbers } from 'src/@common/constants';
import { getUniqueFileName } from 'src/@common/utils';

@Controller('image')
@UseGuards(AuthGuard())
export class ImageController {

    @UseInterceptors(
        FilesInterceptor('images', numbers.MAX_IMAGE_COUNT, {
            limits: { fileSize: numbers.MAX_IMAGE_SIZE },
        })
    )
    @Post('/')
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        const s3Client = new S3Client({
            region: process.env.AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
        })

        const uuid = Date.now();

        const uploadPromises = files.map((file) => {
            const fileName = getUniqueFileName(file, uuid);
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `original/${fileName}`,
                Body: file.buffer,
            }

            const command = new PutObjectCommand(uploadParams)

            return s3Client.send(command);
        })

        await Promise.all(uploadPromises);
    }
}
