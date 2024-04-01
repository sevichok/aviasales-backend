export class RequestDto {
    id: string;
    first_name: string;
    last_name: string;

    static toEntity(entity?: RequestDto) {
        const it = {
            id: entity.id,
            first_name: entity.first_name,
            last_name: entity.last_name,
        };

        return it;
    }
}