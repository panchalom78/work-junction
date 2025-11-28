import mongoose from "mongoose";
import User from "../models/user.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";

export const fetchWorkers = async (req, res) => {
    try {
        const { area = "", search = "", skill = "", service = "" } = req.query;

        const query = { role: "WORKER" };

        if (area) {
            query.$or = [
                { "address.area": { $regex: area, $options: "i" } },
                { "address.city": { $regex: area, $options: "i" } },
            ];
        }

        if (search) {
            const searchOr = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { "address.area": { $regex: search, $options: "i" } },
                { "address.city": { $regex: search, $options: "i" } },
            ];
            query.$or = Array.isArray(query.$or) ? query.$or.concat(searchOr) : searchOr;
        }

        const workers = await User.find(query)
            .select("-password -otp")
            .populate({ path: "workerProfile.skills.skillId", select: "name description" })
            .lean();

        const workerIds = workers.map((w) => w._id);

        const serviceQuery = { workerId: { $in: workerIds }, isActive: true };
        if (skill) serviceQuery.skillId = new mongoose.Types.ObjectId(skill);
        if (service) serviceQuery.serviceId = new mongoose.Types.ObjectId(service);

        const workerServices = await WorkerService.find(serviceQuery)
            .populate({ path: "skillId", select: "name description services" })
            .lean();

        const serviceIds = [...new Set(workerServices.map((ws) => ws.serviceId))];
        const servicesData = await Skill.aggregate([
            { $unwind: "$services" },
            { $match: { "services.serviceId": { $in: serviceIds } } },
            { $project: { serviceId: "$services.serviceId", serviceName: "$services.name" } },
        ]);

        const serviceNameMap = {};
        servicesData.forEach((s) => {
            serviceNameMap[s.serviceId.toString()] = s.serviceName;
        });

        const servicesByWorker = {};
        workerServices.forEach((s) => {
            const wid = s.workerId.toString();
            if (!servicesByWorker[wid]) servicesByWorker[wid] = [];
            servicesByWorker[wid].push(s);
        });

        let filteredWorkers = workers;
        if (skill || service) {
            filteredWorkers = workers.filter(
                (w) => (servicesByWorker[w._id.toString()] || []).length > 0
            );
        }

        const transformedWorkers = filteredWorkers.map((worker) => {
            const widStr = worker._id.toString();
            const services = (servicesByWorker[widStr] || []).map((s) => ({
                _id: s._id,
                serviceId: s.serviceId,
                skillId: s.skillId?._id,
                name: s.skillId?.name || "Unknown Service",
                serviceName: serviceNameMap[s.serviceId.toString()] || "Unknown Service",
                details: s.details,
                pricingType: s.pricingType,
                price: s.price,
                estimatedDuration: s.estimatedDuration,
            }));

            const skills =
                worker.workerProfile?.skills
                    ?.map((skillObj) => ({
                        _id: skillObj.skillId?._id,
                        name: skillObj.skillId?.name,
                        description: skillObj.skillId?.description,
                    }))
                    .filter((s) => s._id) || [];

            return {
                _id: worker._id,
                name: worker.name,
                phone: worker.phone,
                email: worker.email,
                address: worker.address,
                isActive: worker.isActive,
                workerProfile: {
                    availabilityStatus:
                        worker.workerProfile?.availabilityStatus || "available",
                    skills,
                    services,
                },
                rating: 0,
            };
        });

        return res.status(200).json({
            success: true,
            data: { workers: transformedWorkers },
        });
    } catch (error) {
        console.error("Admin fetchWorkers error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
