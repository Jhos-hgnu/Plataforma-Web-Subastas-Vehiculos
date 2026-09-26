import { IsNumber, Min } from 'class-validator';

export class CreateBidDto {
  @IsNumber() @Min(0.01) amount: number;
}
