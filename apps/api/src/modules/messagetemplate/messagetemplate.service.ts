import {Prisma, prisma,PrismaClient} from "@autocall/db";
import { ListMessageTemplateQueryDto, MessageTemplateDto, UpdateMessageTemplateDto } from "./schema/messagetemplate.validaton";

export class MessageTemplateService {

    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async create({businessId,name,scenario,messageBody,isActive}:MessageTemplateDto) {
        const template = await this.prisma.messageTemplate.create({
            data: {
                businessId,
                name,
                scenario,
                messageBody,
                isActive
            }
        })
        return template
    }

    async list({page,limit,scenario,search}: ListMessageTemplateQueryDto,businessId:string) {
     const skip = (page - 1) * limit;
     

     let where: Prisma.MessageTemplateWhereInput = {
        businessId
     }

     if(scenario) {
        where.scenario = scenario
     }


     if(search) {
        where.name = {
            contains: search,
            mode: "insensitive"
        }
     }

    const [template,totalCount] = await Promise.all([
        this.prisma.messageTemplate.findMany({where,skip,take:limit}),
        this.prisma.messageTemplate.count({where})
    ])

    const totalPages = Math.ceil(totalCount / limit);

    return {
        templates: template,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        }
    }
    }  

    private async findUnique(templateId: string) {
        const template = await this.prisma.messageTemplate.findUnique({
            where: {id: templateId}
        })
        return template
    }

    async get(templateId: string,businessId: string) {
       const template = await this.findUnique(templateId);
        if(!template || template.businessId !== businessId) {
            throw new Error("Template not found or unauthorized")
        }
        return template
    }

    async update(templateId: string,data: UpdateMessageTemplateDto,businessId: string) {
        const template = await this.findUnique(templateId);
        if(!template) {
            throw new Error("Template not found")
        }
        if(template.businessId !== businessId) {
            throw new Error("Unauthorized")
        }
        const updated = await this.prisma.messageTemplate.update({
            where: {id: templateId},
            data: {
                ...data
            }
        })
        return updated
    }

    async delete(templateId: string,businessId: string) {
        const template = await this.findUnique(templateId);
        if(!template) {
            throw new Error("Template not found")
        }
        if(template.businessId !== businessId) {
            throw new Error("Unauthorized")
        }
        const deleted = await this.prisma.messageTemplate.delete({
            where: {id: templateId}
        })
        return deleted;
    }

    async send() {}


}