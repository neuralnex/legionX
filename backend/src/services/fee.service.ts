import { AppDataSource } from '../config/database';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { User } from '../entities/User';
import { Logger } from '../utils/logger';
import { LucidService } from './lucid';

export class FeeService {
    private static readonly LISTING_FEE = 1.5; // 1.5 ADA
    private static readonly TRANSACTION_FEE_PERCENTAGE = 0.03; // 3%
    private static readonly PREMIUM_LISTING_FEE = 10.0; // 10 ADA
    private static readonly ANALYTICS_SUBSCRIPTION_FEE = 3.0; // 3 ADA
    private static readonly TREASURY_WALLET = process.env.TREASURY_WALLET_ADDRESS || 'addr1qx...'; // Replace with actual treasury wallet

    private static lucidService: LucidService;

    static initialize(lucidService: LucidService) {
        this.lucidService = lucidService;
    }

    /**
     * Process listing fee payment
     */
    static async processListingFee(listingId: string, userId: number): Promise<boolean> {
        try {
            const listingRepo = AppDataSource.getRepository(Listing);
            const listing = await listingRepo.findOne({ where: { id: listingId } });

            if (!listing) {
                throw new Error('Listing not found');
            }

            // Process listing fee payment to treasury wallet
            const txHash = await this.lucidService.buildFeeTransaction(
                this.LISTING_FEE,
                this.TREASURY_WALLET,
                'Listing Fee'
            );

            // Update listing with fee transaction
            listing.listingFeeTxHash = txHash;
            await listingRepo.save(listing);

            return true;
        } catch (error) {
            Logger.error('Error processing listing fee:', error);
            return false;
        }
    }

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
     * Process transaction fee
     */
    static async processTransactionFee(saleAmount: number, purchaseId: string): Promise<boolean> {
        try {
            const purchaseRepo = AppDataSource.getRepository(Purchase);
            const purchase = await purchaseRepo.findOne({ where: { id: purchaseId } });

            if (!purchase) {
                throw new Error('Purchase not found');
            }

            const feeAmount = this.calculateTransactionFee(saleAmount);
            
            // Process payment to treasury wallet
            const txHash = await this.lucidService.buildFeeTransaction(
                feeAmount,
                this.TREASURY_WALLET,
                'Transaction Fee'
            );

            // Update purchase with fee transaction
            purchase.feeTxHash = txHash;
            await purchaseRepo.save(purchase);

            return true;
        } catch (error) {
            Logger.error('Error processing transaction fee:', error);
            return false;
        }
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

            // Process payment to treasury wallet
            const txHash = await this.lucidService.buildFeeTransaction(
                this.PREMIUM_LISTING_FEE,
                this.TREASURY_WALLET,
                'Premium Listing Fee'
            );

            // Update listing to premium status
            listing.isPremium = true;
            listing.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            listing.premiumTxHash = txHash;
            await listingRepo.save(listing);

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

            // Process payment to treasury wallet
            const txHash = await this.lucidService.buildFeeTransaction(
                this.ANALYTICS_SUBSCRIPTION_FEE,
                this.TREASURY_WALLET,
                'Analytics Subscription Fee'
            );

            // Update user analytics subscription
            user.hasAnalyticsAccess = true;
            user.analyticsExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            user.analyticsTxHash = txHash;
            await userRepo.save(user);

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