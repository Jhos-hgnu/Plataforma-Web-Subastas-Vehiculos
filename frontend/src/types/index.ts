export type DamageLevel = 'GREEN' | 'YELLOW' | 'RED';
export type Drivetrain = 'AWD' | 'FWD' | 'RWD' | '4WD';

export interface Vehicle {
  id: string; ownerId: string; year: number; itemType: string; brand: string; model: string;
  engine: string; transmission: string; fuelType: string; drivetrain: Drivetrain;
  cylinders: number; damageLevel: DamageLevel; images: string[]; auctionId: string;
  createdAt: string; updatedAt: string;
}

export interface Auction { id: string; vehicleId: string; basePrice: number; startAt: string; endAt: string; }
export interface AuctionState { currentAmount: number; hasBids: boolean; status: 'SCHEDULED' | 'LIVE' | 'ENDED'; lastUpdatedAt: string; }
export interface AuctionDetails extends Auction { state: AuctionState | null; }
export interface Session { uid: string; email: string; idToken: string; refreshToken: string; expiresIn: string; }
