import { AppDataSource } from '../config/database';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { User } from '../entities/User';
import { Logger } from '../utils/logger';

export class FeeService {
    private static readonly TRANSACTION_FEE_PERCENTAGE = 0.03; // 3%
    private static readonly PREMIUM_LISTING_FEE = 0.1; // 0.1 ADA
    private static readonly ANALYTICS_SUBSCRIPTION_FEE = 1.0; // 1 ADA per month

    /**
     * Calculate transaction fee for a sale
     */
    static calculateTransactionFee(saleAmount: number): number {
        return saleAmount * this.TRANSACTION_FEE_PERCENTAGE;
    }

    /**
     * Calculate final amount after fees
     */
    static calculateFinalAmount(saleAmount: number): number {
        const fee = this.calculateTransactionFee(saleAmount);
        return saleAmount - fee;
    }

    /**
     * Process premium listing purchase
     */
    static async processPremiumListing(listingId: string, userId: number): Promise<boolean> {
        try {
            const listingRepo = AppDataSource.getRepository(Listing);
            const userRepo = AppDataSource.getRepository(User);

            const listing = await listingRepo.findOne({ where: { id: listingId } });
            const user = await userRepo.findOne({ where: { id: userId } });

            if (!listing || !user) {
                throw new Error('Listing or user not found');
            }

            // Update listing to premium status
            listing.isPremium = true;
            listing.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await listingRepo.save(listing);

            // Record premium purchase
            // TODO: Implement actual payment processing

            return true;
        } catch (error) {
            Logger.error('Error processing premium listing:', error);
            return false;
        }
    }

    /**
     * Process analytics subscription
     */
    static async processAnalyticsSubscription(userId: number): Promise<boolean> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new Error('User not found');
            }

            // Update user analytics subscription
            user.hasAnalyticsAccess = true;
            user.analyticsExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await userRepo.save(user);

            // Record subscription purchase
            // TODO: Implement actual payment processing

            return true;
        } catch (error) {
            Logger.error('Error processing analytics subscription:', error);
            return false;
        }
    }

    /**
     * Get premium listing features
     */
    static getPremiumFeatures(): string[] {
        return [
            'Featured placement in marketplace',
            'Priority in search results',
            'Enhanced listing visibility',
            'Custom listing badges',
            'Advanced analytics access'
        ];
    }

    /**
     * Get analytics features
     */
    static getAnalyticsFeatures(): string[] {
        return [
            'Market trend analysis',
            'Price history tracking',
            'Competitor analysis',
            'Sales performance metrics',
            'Custom reports generation'
        ];
    }
} 