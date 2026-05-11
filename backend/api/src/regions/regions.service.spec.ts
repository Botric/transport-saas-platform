import { Test, TestingModule } from '@nestjs/testing';
import { RegionsService } from './regions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Region } from '../entities/region.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const makeRegion = (overrides: Partial<Region> = {}) =>
  ({
    id: 'region-1',
    name: 'Central',
    code: 'CTR',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    organisationId: null,
    ...overrides,
  } as unknown as Region);

const orgUser = {
  id: 'user-1',
  role: 'org_admin',
  organisationId: 'org-1',
};

const superAdminUser = {
  id: 'user-2',
  role: 'super_admin',
  organisationId: null,
};

describe('RegionsService', () => {
  let service: RegionsService;

  const regionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: getRepositoryToken(Region), useValue: regionRepo },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    jest.clearAllMocks();
  });

  it('findAll should return active regions ordered by name', async () => {
    regionRepo.find.mockResolvedValueOnce([makeRegion()]);
    const result = await service.findAll(orgUser);
    expect(result).toHaveLength(1);
    expect(regionRepo.find).toHaveBeenCalledWith({
      where: { status: 'active', organisationId: 'org-1' },
      order: { name: 'ASC' },
    });
  });

  it('findAll should not scope super admins to one organisation', async () => {
    regionRepo.find.mockResolvedValueOnce([makeRegion()]);
    await service.findAll(superAdminUser);
    expect(regionRepo.find).toHaveBeenCalledWith({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  });

  it('findOne should throw if missing', async () => {
    regionRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('missing', orgUser)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should save an active region', async () => {
    const region = makeRegion({ organisationId: 'org-1' });
    regionRepo.create.mockReturnValueOnce(region);
    regionRepo.save.mockResolvedValueOnce(region);

    const result = await service.create({ name: 'Central' }, orgUser) as unknown as Region;
    expect(result.status).toBe('active');
    expect(regionRepo.create).toHaveBeenCalledWith({
      name: 'Central',
      organisationId: 'org-1',
      status: 'active',
    });
  });

  it('create should reject non-global users without an organisation', async () => {
    expect(() =>
      service.create({ name: 'Central' }, { ...orgUser, organisationId: null }),
    ).toThrow(ForbiddenException);
  });

  it('update should persist changes', async () => {
    const region = makeRegion({ organisationId: 'org-1' });
    regionRepo.findOne.mockResolvedValueOnce(region);
    regionRepo.save.mockResolvedValueOnce({ ...region, name: 'North' });

    const result = await service.update('region-1', { name: 'North' }, orgUser);
    expect(result.name).toBe('North');
  });

  it('remove should soft-delete the region', async () => {
    const region = makeRegion({ organisationId: 'org-1' });
    regionRepo.findOne.mockResolvedValueOnce(region);
    regionRepo.save.mockResolvedValueOnce({ ...region, status: 'inactive' });

    const result = await service.remove('region-1', orgUser);
    expect(result.status).toBe('inactive');
  });
});
