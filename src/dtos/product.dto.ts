import {IsString, IsNumber, IsOptional, IsNotEmpty, Min, IsPositive} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string = "";

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    price: number = 0;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number = 0;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    stock?: number;
}

export class GetProductByIdDto {
    @IsString()
    @IsNotEmpty()
    id: string = "";
}

export class ProductResponseDto {
    @IsString()
    id: string = "";

    @IsString()
    name: string = "";

    @IsNumber()
    price: number = 0;

    @IsNumber()
    stock: number = 0;
}
