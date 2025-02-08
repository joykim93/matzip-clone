import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {

    getPosts(): any {
        return ['a게시글', 'b게시글'];
    }
}
