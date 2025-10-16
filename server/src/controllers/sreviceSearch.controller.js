import User from "../models/user.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";

/**
 * Get workers with their services for customer dashboard
 * Returns 15-20 random workers initially, with optional filtering
 */
export const getWorkers = async (req, res) => {
    try {
        const {
            skill,
            service,
            workerName,
            workerPhone,
            ratingMin,
            ratingMax,
            priceMin,
            priceMax,
            location,
            sortBy,
            limit = 20,
        } = req.query;

        // Build match conditions for workers
        const workerMatchConditions = {
            role: "WORKER",
            isVerified: true,
            "workerProfile.verification.status": "APPROVED",
        };

        // Filter by worker name
        if (workerName) {
            workerMatchConditions.name = {
                $regex: workerName,
                $options: "i",
            };
        }

        // Filter by worker phone
        if (workerPhone) {
            workerMatchConditions.phone = {
                $regex: workerPhone,
                $options: "i",
            };
        }

        // Filter by location (city or pincode)
        if (location) {
            workerMatchConditions.$or = [
                { "address.city": { $regex: location, $options: "i" } },
                { "address.pincode": { $regex: location, $options: "i" } },
                { "address.area": { $regex: location, $options: "i" } },
            ];
        }

        // Build skill filter
        let skillFilter = {};
        if (skill) {
            const skillDoc = await Skill.findOne({
                name: { $regex: skill, $options: "i" },
            });
            if (skillDoc) {
                skillFilter.skillId = skillDoc._id;
            }
        }

        // Build service filter
        if (service && skill) {
            const skillDoc = await Skill.findOne({
                name: { $regex: skill, $options: "i" },
            });
            if (skillDoc) {
                const matchingService = skillDoc.services.find((s) =>
                    s.name.toLowerCase().includes(service.toLowerCase())
                );
                if (matchingService) {
                    skillFilter.serviceId = matchingService.serviceId;
                }
            }
        }

        // Build price filter for WorkerService
        const priceFilter = {};
        if (priceMin) priceFilter.$gte = Number(priceMin);
        if (priceMax) priceFilter.$lte = Number(priceMax);

        // Aggregation pipeline
        const pipeline = [
            // Match verified workers
            { $match: workerMatchConditions },

            // Randomly sample workers if no specific filters
            ...((!skill && !service && !workerName && !workerPhone && !location)
                ? [{ $sample: { size: parseInt(limit) } }]
                : []
            ),

            // Lookup worker services
            {
                $lookup: {
                    from: "worker_services",
                    let: { workerId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$workerId", "$$workerId"] },
                                isActive: true,
                                ...skillFilter,
                                ...(Object.keys(priceFilter).length > 0
                                    ? { price: priceFilter }
                                    : {}),
                            },
                        },
                        {
                            $lookup: {
                                from: "skills",
                                localField: "skillId",
                                foreignField: "_id",
                                as: "skillInfo",
                            },
                        },
                        { $unwind: "$skillInfo" },
                        {
                            $addFields: {
                                serviceName: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$skillInfo.services",
                                                as: "svc",
                                                cond: {
                                                    $eq: [
                                                        "$$svc.serviceId",
                                                        "$serviceId",
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    ],
                    as: "services",
                },
            },

            // Filter out workers with no matching services (if filters applied)
            ...(skill || service || Object.keys(priceFilter).length > 0
                ? [
                      {
                          $match: {
                              "services.0": { $exists: true },
                          },
                      },
                  ]
                : []
            ),

            // Lookup reviews/ratings (if you have a reviews collection)
            // This is a placeholder - adjust based on your actual reviews schema
            {
                $addFields: {
                    rating: {
                        $cond: {
                            if: { $isArray: "$reviews" },
                            then: { $avg: "$reviews.rating" },
                            else: 4.5, // Default rating
                        },
                    },
                    reviewCount: {
                        $cond: {
                            if: { $isArray: "$reviews" },
                            then: { $size: "$reviews" },
                            else: 0,
                        },
                    },
                },
            },

            // Filter by rating if specified
            ...(ratingMin || ratingMax
                ? [
                      {
                          $match: {
                              ...(ratingMin
                                  ? { rating: { $gte: Number(ratingMin) } }
                                  : {}),
                              ...(ratingMax
                                  ? { rating: { $lte: Number(ratingMax) } }
                                  : {}),
                          },
                      },
                  ]
                : []
            ),

            // Project final shape
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phone: 1,
                    email: 1,
                    image: { $ifNull: ["$profileImage", null] },
                    category: {
                        $ifNull: [
                            { $arrayElemAt: ["$services.skillInfo.name", 0] },
                            "General",
                        ],
                    },
                    title: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$services.serviceName.name",
                                    0,
                                ],
                            },
                            "Professional",
                        ],
                    },
                    description: {
                        $ifNull: [
                            { $arrayElemAt: ["$services.details", 0] },
                            "Experienced professional ready to help.",
                        ],
                    },
                    rating: 1,
                    reviews: "$reviewCount",
                    experience: {
                        $ifNull: ["$workerProfile.experience", "2+ years"],
                    },
                    available: {
                        $cond: {
                            if: {
                                $eq: [
                                    "$workerProfile.availabilityStatus",
                                    "available",
                                ],
                            },
                            then: true,
                            else: false,
                        },
                    },
                    location: {
                        $concat: [
                            { $ifNull: ["$address.area", ""] },
                            ", ",
                            { $ifNull: ["$address.city", ""] },
                        ],
                    },
                    priceAmount: {
                        $ifNull: [{ $arrayElemAt: ["$services.price", 0] }, 0],
                    },
                    pricingType: {
                        $ifNull: [
                            { $arrayElemAt: ["$services.pricingType", 0] },
                            "HOURLY",
                        ],
                    },
                    services: {
                        $map: {
                            input: "$services",
                            as: "service",
                            in: {
                                id: "$$service._id",
                                skill: "$$service.skillInfo.name",
                                service: "$$service.serviceName.name",
                                price: "$$service.price",
                                pricingType: "$$service.pricingType",
                                details: "$$service.details",
                            },
                        },
                    },
                },
            },

            // Apply sorting
            ...(sortBy
                ? [
                      {
                          $sort:
                              sortBy === "rating"
                                  ? { rating: -1 }
                                  : sortBy === "price"
                                  ? { priceAmount: 1 }
                                  : sortBy === "name"
                                  ? { name: 1 }
                                  : { _id: 1 },
                      },
                  ]
                : []
            ),

            // Limit results
            { $limit: parseInt(limit) },
        ];

        const workers = await User.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: workers.length,
            data: workers,
        });
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch workers",
            error: error.message,
        });
    }
};

/**
 * Get worker details by ID
 */
export const getWorkerById = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
            isVerified: true,
        })
            .select(
                "-password -otp -workerProfile.verification -workerProfile.bankDetails"
            )
            .lean();

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Get worker's services
        const services = await WorkerService.find({
            workerId: worker._id,
            isActive: true,
        })
            .populate("skillId", "name")
            .lean();

        // Enrich services with service names
        const enrichedServices = await Promise.all(
            services.map(async (service) => {
                const skill = await Skill.findById(service.skillId);
                const serviceInfo = skill?.services.find(
                    (s) => s.serviceId.toString() === service.serviceId.toString()
                );

                return {
                    ...service,
                    skillName: skill?.name,
                    serviceName: serviceInfo?.name || "Service",
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                ...worker,
                services: enrichedServices,
            },
        });
    } catch (error) {
        console.error("Error fetching worker details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch worker details",
            error: error.message,
        });
    }
};