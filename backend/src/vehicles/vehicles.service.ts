import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

type Vehicle = CreateVehicleDto & { id: string; ownerId: string; auctionId: string; createdAt: string; updatedAt: string };

@Injectable()
export class VehiclesService {
  constructor(private readonly firebase: FirebaseService) {}

  async create(ownerId: string, dto: CreateVehicleDto) {
    if (new Date(dto.auction.endAt) <= new Date(dto.auction.startAt)) {
      throw new BadRequestException('endAt must be after startAt');
    }
    const vehicleId = this.firebase.database.ref('vehicles').push().key;
    const auctionId = this.firebase.database.ref('auctions').push().key;
    if (!vehicleId || !auctionId) throw new BadRequestException('Could not generate identifiers');
    const now = new Date().toISOString();
    const status = new Date(dto.auction.startAt) <= new Date() ? 'LIVE' : 'SCHEDULED';
    const { auction: auctionInput, ...vehicleInput } = dto;
    const vehicle = { id: vehicleId, ownerId, ...vehicleInput, auctionId, createdAt: now, updatedAt: now };
    const auction = { id: auctionId, vehicleId, ...auctionInput, createdAt: now, updatedAt: now };
    await this.firebase.database.ref().update({
      [`vehicles/${vehicleId}`]: vehicle,
      [`auctions/${auctionId}`]: auction,
      [`auctionStates/${auctionId}`]: {
        public: { currentAmount: 0, hasBids: false, status, lastUpdatedAt: now },
        private: { highestBidderId: null },
      },
    });
    return vehicle;
  }

  async findAll(filters: Record<string, string | undefined>) {
    const snapshot = await this.firebase.database.ref('vehicles').once('value');
    const vehicles = Object.values(snapshot.val() ?? {}) as Vehicle[];
    const allowed = ['year', 'brand', 'model', 'fuelType', 'damageLevel', 'drivetrain'];
    return vehicles.filter((vehicle) => allowed.every((key) => {
      const value = filters[key];
      return value === undefined || String(vehicle[key as keyof Vehicle]) === value;
    }));
  }

  async findMine(ownerId: string) {
    const vehicles = await this.findAll({});
    return vehicles.filter((vehicle) => vehicle.ownerId === ownerId);
  }

  async findOne(id: string) {
    const snapshot = await this.firebase.database.ref(`vehicles/${id}`).once('value');
    if (!snapshot.exists()) throw new NotFoundException('Vehicle not found');
    return snapshot.val() as Vehicle;
  }

  async update(id: string, ownerId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);
    if (vehicle.ownerId !== ownerId) throw new ForbiddenException('You do not own this vehicle');
    const updatedAt = new Date().toISOString();
    await this.firebase.database.ref(`vehicles/${id}`).update({ ...dto, updatedAt });
    return { ...vehicle, ...dto, updatedAt };
  }
}
