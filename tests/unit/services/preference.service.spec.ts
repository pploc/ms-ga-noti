import 'reflect-metadata';
import { PreferenceService } from '../../../src/application/services/preference.service';
import { IPreferenceRepository } from '../../../src/domain/repositories/preference.repository.interface';
import { NotificationPreference } from '../../../src/domain/entities/preference.entity';

describe('PreferenceService', () => {
    let prefService: PreferenceService;
    let prefRepo: jest.Mocked<IPreferenceRepository>;

    const mockDate = new Date();
    const mockPref: any = {
        _id: 'p1',
        customerId: 'c1',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        unsubscribedTopics: [],
        updatedAt: mockDate,
    };

    beforeEach(() => {
        prefRepo = {
            findByCustomerId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        } as any;

        prefService = new PreferenceService(prefRepo);
    });

    describe('getPreferences', () => {
        it('should return preferences if found', async () => {
            prefRepo.findByCustomerId.mockResolvedValue(mockPref);
            const result = await prefService.getPreferences('c1');
            expect(prefRepo.findByCustomerId).toHaveBeenCalledWith('c1');
            expect(result).toEqual(mockPref);
        });

        it('should throw NotFoundError if preferences not found', async () => {
            prefRepo.findByCustomerId.mockResolvedValue(null);
            await expect(prefService.getPreferences('c1')).rejects.toThrow('Preferences for customer not found');
        });
    });

    describe('updatePreferences', () => {
        it('should update and return preferences if found', async () => {
            prefRepo.update.mockResolvedValue(mockPref);
            const result = await prefService.updatePreferences('c1', { emailEnabled: false });
            expect(prefRepo.update).toHaveBeenCalledWith('c1', { emailEnabled: false });
            expect(result).toEqual(mockPref);
        });

        it('should throw NotFoundError if update fails', async () => {
            prefRepo.update.mockResolvedValue(null);
            await expect(prefService.updatePreferences('c1', { emailEnabled: false })).rejects.toThrow('Preferences for customer not found');
        });
    });
});
