import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsDefined, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Max, Min, ValidateNested } from 'class-validator';

export enum DamageLevel { GREEN = 'GREEN', YELLOW = 'YELLOW', RED = 'RED' }
export enum Drivetrain { AWD = 'AWD', FWD = 'FWD', RWD = 'RWD', FOUR_WD = '4WD' }

export class AuctionInputDto {
  @IsNumber() @Min(0.01) basePrice: number;
  @IsDateString() startAt: string;
  @IsDateString() endAt: string;
}

export class CreateVehicleDto {
  @IsInt() @Min(1886) @Max(3000) year: number;
  @IsString() @IsNotEmpty() itemType: string;
  @IsString() @IsNotEmpty() brand: string;
  @IsString() @IsNotEmpty() model: string;
  @IsString() @IsNotEmpty() engine: string;
  @IsString() @IsNotEmpty() transmission: string;
  @IsString() @IsNotEmpty() fuelType: string;
  @IsEnum(Drivetrain) drivetrain: Drivetrain;
  @IsInt() @Min(1) cylinders: number;
  @IsEnum(DamageLevel) damageLevel: DamageLevel;
  @IsArray() @ArrayMinSize(5) @IsUrl({}, { each: true }) images: string[];
  @IsDefined() @ValidateNested() @Type(() => AuctionInputDto) auction: AuctionInputDto;
}

export class UpdateVehicleDto {
  @IsOptional() @IsInt() @Min(1886) @Max(3000) year?: number;
  @IsOptional() @IsString() @IsNotEmpty() itemType?: string;
  @IsOptional() @IsString() @IsNotEmpty() brand?: string;
  @IsOptional() @IsString() @IsNotEmpty() model?: string;
  @IsOptional() @IsString() @IsNotEmpty() engine?: string;
  @IsOptional() @IsString() @IsNotEmpty() transmission?: string;
  @IsOptional() @IsString() @IsNotEmpty() fuelType?: string;
  @IsOptional() @IsEnum(Drivetrain) drivetrain?: Drivetrain;
  @IsOptional() @IsInt() @Min(1) cylinders?: number;
  @IsOptional() @IsEnum(DamageLevel) damageLevel?: DamageLevel;
  @IsOptional() @IsArray() @ArrayMinSize(5) @IsUrl({}, { each: true }) images?: string[];
}
