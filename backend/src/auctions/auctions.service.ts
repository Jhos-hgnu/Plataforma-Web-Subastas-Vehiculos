import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

interface Auction { id: string; vehicleId: string; basePrice: number; startAt: string; endAt: string; createdAt: string; updatedAt: string; }
interface AuctionState { public: { currentAmount: number; hasBids: boolean; status: string; lastUpdatedAt: string }; private: { highestBidderId: string | null }; }
interface Bid { bidderId: string; amount: number; createdAt: string; }

@Injectable()
export class AuctionsService {
  constructor(private readonly firebase: FirebaseService) {}

  async findOne(id: string) {
    const [auctionSnapshot, stateSnapshot] = await Promise.all([
      this.firebase.database.ref(`auctions/${id}`).once('value'),
      this.firebase.database.ref(`auctionStates/${id}/public`).once('value'),
    ]);
    if (!auctionSnapshot.exists()) throw new NotFoundException('Auction not found');
    return { ...auctionSnapshot.val() as Auction, state: stateSnapshot.val() ?? null };
  }

  async placeBid(auctionId: string, bidderId: string, amount: number) {
    const auctionSnapshot = await this.firebase.database.ref(`auctions/${auctionId}`).once('value');
    if (!auctionSnapshot.exists()) throw new NotFoundException('Auction not found');
    const auction = auctionSnapshot.val() as Auction;
    const now = new Date();
    if (now < new Date(auction.startAt)) throw new BadRequestException('Auction has not started');
    if (now >= new Date(auction.endAt)) throw new BadRequestException('Auction has ended');

    let rejection: string | undefined;
    const stateRef = this.firebase.database.ref(`auctionStates/${auctionId}`);
    const transaction = await stateRef.transaction((current: AuctionState | null) => {
      const attemptedAt = new Date();
      if (attemptedAt < new Date(auction.startAt) || attemptedAt >= new Date(auction.endAt)) {
        rejection = 'Auction is not live';
        return;
      }
      const state = current ?? {
        public: { currentAmount: 0, hasBids: false, status: 'LIVE', lastUpdatedAt: attemptedAt.toISOString() },
        private: { highestBidderId: null },
      };
      const publicState = state.public;
      if (!publicState.hasBids && amount <= auction.basePrice) {
        rejection = 'First bid must be greater than base price';
        return;
      }
      if (publicState.hasBids && (amount <= publicState.currentAmount || amount < publicState.currentAmount * 1.1)) {
        rejection = 'Bid must be at least 10% above the current amount';
        return;
      }
      return {
        public: { currentAmount: amount, hasBids: true, status: 'LIVE', lastUpdatedAt: attemptedAt.toISOString() },
        private: { highestBidderId: bidderId },
      };
    });
    if (!transaction.committed) throw new BadRequestException(rejection ?? 'Bid was not accepted');

    const bidId = this.firebase.database.ref(`bids/${auctionId}`).push().key;
    if (!bidId) throw new BadRequestException('Could not generate bid identifier');
    const bid: Bid = { bidderId, amount, createdAt: new Date().toISOString() };
    await this.firebase.database.ref(`bids/${auctionId}/${bidId}`).set(bid);
    const state = transaction.snapshot.val() as AuctionState;
    return { auctionId, amount: state.public.currentAmount, status: state.public.status };
  }

  async myStatus(auctionId: string, userId: string) {
    const auctionSnapshot = await this.firebase.database.ref(`auctions/${auctionId}`).once('value');
    if (!auctionSnapshot.exists()) throw new NotFoundException('Auction not found');
    const [stateSnapshot, bidsSnapshot] = await Promise.all([
      this.firebase.database.ref(`auctionStates/${auctionId}/private/highestBidderId`).once('value'),
      this.firebase.database.ref(`bids/${auctionId}`).once('value'),
    ]);
    const bids = Object.values(bidsSnapshot.val() ?? {}) as Bid[];
    if (!bids.some((bid) => bid.bidderId === userId)) return { status: 'NO_BID' };
    return { status: stateSnapshot.val() === userId ? 'WINNING' : 'OUTBID' };
  }
}
