import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Listing } from '../entities/Listing'
import { User } from '../entities/User'
import { Agent } from '../entities/Agent'
import { uploadToIPFS } from '../services/pinata'
import { AppError } from '../utils/appError'
import { logger } from '../utils/logger'

const listingRepository = AppDataSource.getRepository(Listing)
const userRepository = AppDataSource.getRepository(User)
const agentRepository = AppDataSource.getRepository(Agent)

export const createListing = async (req: Request, res: Response) => {
  try {
    const { type, name, description, price, metadata, files } = req.body
    const userId = req.user?.id

    if (!userId) {
      throw new AppError('User not authenticated', 401)
    }

    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Check if user has enough points
    if (user.listingPoints < 1) {
      throw new AppError('Insufficient listing points. You need 1 point to create a listing.', 400)
    }

    let ipfsHash = null
    let listingData: any = {
      name,
      description,
      price: parseFloat(price),
      type, // 'agent' or 'model'
      seller: user,
      status: 'active'
    }

    // Handle IPFS upload for core files
    if (files && files.length > 0) {
      try {
        // Upload files to IPFS
        const ipfsResponse = await uploadToIPFS(files, {
          name: `${type}-${name}`,
          description: `Core files for ${name}`,
          metadata: {
            type,
            creator: user.email,
            timestamp: new Date().toISOString()
          }
        })
        
        ipfsHash = ipfsResponse.IpfsHash
        listingData.ipfsHash = ipfsHash
        
        logger.info(`Files uploaded to IPFS for listing ${name}: ${ipfsHash}`)
      } catch (error) {
        logger.error('IPFS upload failed:', error)
        throw new AppError('Failed to upload files to IPFS', 500)
      }
    }

    // Store metadata based on type
    if (type === 'agent') {
      listingData.agentMetadata = {
        setupDoc: metadata.setupDoc,
        dependencies: metadata.dependencies || [],
        abilities: metadata.abilities || [],
        modelType: metadata.modelType || 'custom',
        version: metadata.version || '1.0.0',
        requirements: {
          minMemory: metadata.minMemory || 4,
          minStorage: metadata.minStorage || 1,
          dependencies: metadata.dependencies || []
        }
      }
    } else if (type === 'model') {
      listingData.modelMetadata = {
        url: metadata.url,
        version: metadata.version,
        modelType: metadata.type,
        subscriptionType: metadata.subscriptionType,
        pricing: {
          lifetime: parseFloat(metadata.priceLifetime) || 0,
          monthly: parseFloat(metadata.priceMonthly) || 0,
          yearly: parseFloat(metadata.priceYearly) || 0
        },
        supportedTasks: metadata.tasks || [],
        apiEndpoint: metadata.url
      }
    }

    // Create the listing
    const listing = listingRepository.create(listingData)
    await listingRepository.save(listing)

    // Deduct 1 point from user
    user.listingPoints -= 1
    await userRepository.save(user)

    logger.info(`Listing created: ${listing.id} by user ${userId}`)

    res.status(201).json({
      success: true,
      data: {
        listing: {
          id: listing.id,
          name: listing.name,
          description: listing.description,
          price: listing.price,
          type: listing.type,
          ipfsHash: listing.ipfsHash,
          status: listing.status,
          createdAt: listing.createdAt
        }
      },
      message: 'Listing created successfully'
    })

  } catch (error) {
    logger.error('Create listing error:', error)
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

export const getListings = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type, search, sortBy = 'newest' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const queryBuilder = listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: 'active' })

    // Apply filters
    if (type) {
      queryBuilder.andWhere('listing.type = :type', { type })
    }

    if (search) {
      queryBuilder.andWhere(
        '(listing.name ILIKE :search OR listing.description ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        queryBuilder.orderBy('listing.price', 'ASC')
        break
      case 'price-high':
        queryBuilder.orderBy('listing.price', 'DESC')
        break
      case 'oldest':
        queryBuilder.orderBy('listing.createdAt', 'ASC')
        break
      default:
        queryBuilder.orderBy('listing.createdAt', 'DESC')
    }

    const [listings, total] = await queryBuilder
      .skip(skip)
      .take(parseInt(limit as string))
      .getManyAndCount()

    const totalPages = Math.ceil(total / parseInt(limit as string))

    res.json({
      success: true,
      data: {
        listings: listings.map(listing => ({
          id: listing.id,
          name: listing.name,
          description: listing.description,
          price: listing.price,
          type: listing.type,
          seller: {
            id: listing.seller.id,
            name: listing.seller.name,
            email: listing.seller.email
          },
          metadata: listing.type === 'agent' ? listing.agentMetadata : listing.modelMetadata,
          createdAt: listing.createdAt
        })),
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit as string)
        }
      }
    })

  } catch (error) {
    logger.error('Get listings error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    })
  }
}

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const listing = await listingRepository.findOne({
      where: { id },
      relations: ['seller']
    })

    if (!listing) {
      throw new AppError('Listing not found', 404)
    }

    res.json({
      success: true,
      data: {
        listing: {
          id: listing.id,
          name: listing.name,
          description: listing.description,
          price: listing.price,
          type: listing.type,
          ipfsHash: listing.ipfsHash,
          seller: {
            id: listing.seller.id,
            name: listing.seller.name,
            email: listing.seller.email
          },
          metadata: listing.type === 'agent' ? listing.agentMetadata : listing.modelMetadata,
          createdAt: listing.createdAt
        }
      }
    })

  } catch (error) {
    logger.error('Get listing by ID error:', error)
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch listing'
      })
    }
  }
}

export const getIPFSContent = async (req: Request, res: Response) => {
  try {
    const { ipfsHash } = req.params

    if (!ipfsHash) {
      throw new AppError('IPFS hash is required', 400)
    }

    // Return the IPFS gateway URL for the content
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

    res.json({
      success: true,
      data: {
        ipfsUrl,
        ipfsHash,
        gateway: 'https://gateway.pinata.cloud/ipfs/'
      }
    })

  } catch (error) {
    logger.error('Get IPFS content error:', error)
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get IPFS content'
      })
    }
  }
} 