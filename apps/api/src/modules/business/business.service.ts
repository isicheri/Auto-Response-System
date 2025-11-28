import {prisma,PrismaClient} from "@autocall/db";
import jwt from "jsonwebtoken";
import {config} from "../../config/dotenv"



export class BusinessService {

    private prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }


  private async findUnique(businessId: string) {
        return await this.prisma.business.findUnique({
            where: {id: businessId}
        })
    }

   async login(businessId: string) {
        const business = await this.findUnique(businessId);
        if(!business) {
            throw new Error("Business not found")
        }
        const token = jwt.sign({
    businessId: business.id
},config.JWT_SECRET,{expiresIn: "7d"})
return {
    token: token
}
    }


    async currentBusiness(businessId: string) {
        const business = await this.findUnique(businessId);  
        return business;
    }

}