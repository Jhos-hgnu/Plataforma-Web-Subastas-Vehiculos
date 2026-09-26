import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get() findAll(@Query() filters: Record<string, string | undefined>) { return this.vehicles.findAll(filters); }

  @UseGuards(FirebaseAuthGuard)
  @Get('mine') findMine(@CurrentUser() user: DecodedIdToken) { return this.vehicles.findMine(user.uid); }

  @Get(':id') findOne(@Param('id') id: string) { return this.vehicles.findOne(id); }

  @UseGuards(FirebaseAuthGuard)
  @Post() create(@CurrentUser() user: DecodedIdToken, @Body() dto: CreateVehicleDto) { return this.vehicles.create(user.uid, dto); }

  @UseGuards(FirebaseAuthGuard)
  @Put(':id') update(@Param('id') id: string, @CurrentUser() user: DecodedIdToken, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, user.uid, dto);
  }
}
