import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { AuctionsService } from './auctions.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctions: AuctionsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post(':id/bids') placeBid(@Param('id') id: string, @CurrentUser() user: DecodedIdToken, @Body() dto: CreateBidDto) {
    return this.auctions.placeBid(id, user.uid, dto.amount);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':id/my-status') myStatus(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.auctions.myStatus(id, user.uid);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.auctions.findOne(id); }
}
