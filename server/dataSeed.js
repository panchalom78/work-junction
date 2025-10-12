// Sample Skills and Services Data for Workjunction

import { Skill } from "./src/models/skill.model.js";
import mongoose from "mongoose";
import { config } from "dotenv";

config();
const skillsData = [
    {
        name: "Plumbing",
        services: [
            { serviceId: new mongoose.Types.ObjectId(), name: "Pipe Repair" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Tap Installation",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Water Tank Cleaning",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Drain Unclogging",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Bathroom Fitting",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Kitchen Sink Installation",
            },
        ],
    },
    {
        name: "Electrical",
        services: [
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Fan Installation",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Switchboard Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Wiring Installation",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Light Fitting" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Inverter Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Socket Installation",
            },
        ],
    },
    {
        name: "Carpentry",
        services: [
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Furniture Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Door Installation",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Cabinet Making",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Wood Polishing",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Window Repair" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Custom Furniture",
            },
        ],
    },
    {
        name: "Cleaning",
        services: [
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "House Deep Cleaning",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Office Cleaning",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Carpet Cleaning",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Sofa Cleaning" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Kitchen Deep Cleaning",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Bathroom Sanitization",
            },
        ],
    },
    {
        name: "Painting",
        services: [
            { serviceId: new mongoose.Types.ObjectId(), name: "Wall Painting" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Texture Painting",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Waterproofing" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Wallpaper Installation",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Wood Painting" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Metal Painting",
            },
        ],
    },
    {
        name: "Appliance Repair",
        services: [
            { serviceId: new mongoose.Types.ObjectId(), name: "AC Repair" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Refrigerator Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Washing Machine Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Microwave Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Water Purifier Repair",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Chimney Repair",
            },
        ],
    },
    {
        name: "Pest Control",
        services: [
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Cockroach Control",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Mosquito Control",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Termite Control",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Rodent Control",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Bed Bug Treatment",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "General Pest Control",
            },
        ],
    },
    {
        name: "Automobile",
        services: [
            { serviceId: new mongoose.Types.ObjectId(), name: "Car Wash" },
            { serviceId: new mongoose.Types.ObjectId(), name: "Bike Service" },
            { serviceId: new mongoose.Types.ObjectId(), name: "Car AC Repair" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Tyre Replacement",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Battery Replacement",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "General Vehicle Checkup",
            },
        ],
    },
    {
        name: "Gardening",
        services: [
            { serviceId: new mongoose.Types.ObjectId(), name: "Lawn Mowing" },
            { serviceId: new mongoose.Types.ObjectId(), name: "Planting" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Garden Designing",
            },
            { serviceId: new mongoose.Types.ObjectId(), name: "Tree Pruning" },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Irrigation System",
            },
            {
                serviceId: new mongoose.Types.ObjectId(),
                name: "Organic Farming",
            },
        ],
    },
];

// Function to insert data
async function insertSkillsData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear existing data (optional)
        await mongoose.connection.db.collection("skills").deleteMany({});

        // Insert new data
        for (const skillData of skillsData) {
            const skill = new Skill(skillData);
            await skill.save();
        }

        console.log("Skills and services data inserted successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error inserting data:", error);
    }
}

// Run the insertion
insertSkillsData();
