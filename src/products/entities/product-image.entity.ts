import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from './product.entity';
import { ApiProperty } from "@nestjs/swagger";


@Entity({name: 'products_images'})
export class ProductImage{
    @ApiProperty({
        example: '1173679a-6f6d-42e3-81a5-a5168f38ffbe',
        description: 'Image ID',
        uniqueItems: true,
      })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 'http://localhost:3000/api/v1/files/product/6c8ba3b2-a0b0-496e-a05a-54d0af39d0cd.png',
        description: 'Image URL',
        uniqueItems: true,
      })
    @Column('text')
    url: string

    @ManyToOne(
        ()=> Product,
        (product)=> product.images,
        {onDelete: 'CASCADE'}
    )
    product: Product

}