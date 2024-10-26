import { IsString, IsNumber, IsNotEmpty, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @IsString()
    @IsNotEmpty()
    public productId: string = "";

    @IsString()
    @IsNotEmpty()
    public userId: string = "";

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    public quantity: number = 1;
}

export class RemoveFromCartDto {
    @IsString()
    @IsNotEmpty()
    public productId: string = "";
}

export class CartProductResponseDto {
    @IsString()
    productId: string = "";

    @IsString()
    productName: string = "";

    @IsNumber()
    @IsPositive()
    quantity: number = 0;

    @IsNumber()
    @IsPositive()
    price: number = 0;
}

// Cart Output DTO (response)
export class CartResponseDto {
    @IsString()
    public id: string = "";

    @IsString()
    public userId: string ="";

    @IsNotEmpty({ each: true })
    products: Array<{ productId: string; quantity: number }> = [];

    totalPrice: number = 0;
}
