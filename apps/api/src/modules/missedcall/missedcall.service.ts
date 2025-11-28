import { Prisma, prisma, PrismaClient } from "@autocall/db";
import { ListCallsQueryDto, MissedCallDto, UpdateCallAsRecoveredDto } from "./schema/validation.schema";

export class MissedCallService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create missed call and trigger AI automation workflow
   */
  async create(data: MissedCallDto) {
    try {
      const missedCall = await this.prisma.missedCall.create({
        data: {
          callerName: data.callerName,
          callerPhone: data.callerPhone,
          businessId: data.businessId,
          timestamp: data.timeStamp,
          status: data.callStatus,
        },
      });

      console.log(`✅ Missed call logged: ${missedCall.id}`);

      // TODO: Trigger Mastra AI workflow here
      // this.triggerAutoResponse(missedCall).catch((error) => {
      //   console.error("Auto-response workflow failed:", error);
      // });

      return {
        success: true,
        data: {
          id: missedCall.id,
          callerName: missedCall.callerName,
          callerPhone: missedCall.callerPhone,
          timestamp: missedCall.timestamp,
          status: missedCall.status,
        },
      };
    } catch (error: any) {
      console.error("Failed to create missed call:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Log customer SMS response
   */
  async logCustomerResponse(missedCallId: string, responseText: string) {
    try {
      const response = await this.prisma.customerResponse.create({
        data: {
          missedCallId,
          responseText,
        },
      });

      await this.prisma.missedCall.update({
        where: { id: missedCallId },
        data: { status: "responded" },
      });

      console.log(`✅ Customer response logged for call: ${missedCallId}`);

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Failed to log customer response:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Find missed call by phone number (for matching SMS replies)
   */
  async findRecentMissedCallByPhone(phone: string) {
    try {
      const missedCall = await this.prisma.missedCall.findFirst({
        where: {
          callerPhone: phone,
          status: { in: ["pending", "responded"] },
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      return missedCall;
    } catch (error: any) {
      console.error("Failed to find missed call:", error);
      return null;
    }
  }

  /**
   * Get today's statistics
   */
  async getTodayStats(businessId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [totalCalls, respondedCalls, recoveredCalls, totalRevenue] = await Promise.all([
      // Total missed calls today
      this.prisma.missedCall.count({
        where: {
          businessId,
          timestamp: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Calls with customer responses today
      this.prisma.missedCall.count({
        where: {
          businessId,
          status: "responded",
          timestamp: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Recovered calls today
      this.prisma.missedCall.count({
        where: {
          businessId,
          status: "recovered",
          timestamp: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Total revenue from recovered calls today
      this.prisma.missedCall.aggregate({
        where: {
          businessId,
          status: "recovered",
          timestamp: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        _sum: {
          estimatedValue: true,
        },
      }),
    ]);

    // Calculate rates
    const responseRate = totalCalls > 0 ? (respondedCalls / totalCalls) * 100 : 0;
    const recoveryRate = totalCalls > 0 ? (recoveredCalls / totalCalls) * 100 : 0;

    return {
      totalCalls,
      respondedCalls,
      recoveredCalls,
      responseRate: Math.round(responseRate * 10) / 10, // Round to 1 decimal
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      totalRevenue: totalRevenue._sum.estimatedValue || 0,
    };
  }

  /**
   * Get current month's statistics
   */
  async getMonthStat(businessId: string) {
    const now = new Date();
    
    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // End of current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const [totalCalls, respondedCalls, recoveredCalls, totalRevenue] = await Promise.all([
      // Total missed calls this month
      this.prisma.missedCall.count({
        where: {
          businessId,
          timestamp: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Calls with customer responses this month
      this.prisma.missedCall.count({
        where: {
          businessId,
          status: "responded",
          timestamp: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Recovered calls this month
      this.prisma.missedCall.count({
        where: {
          businessId,
          status: "recovered",
          timestamp: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Total revenue from recovered calls this month
      this.prisma.missedCall.aggregate({
        where: {
          businessId,
          status: "recovered",
          timestamp: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          estimatedValue: true,
        },
      }),
    ]);

    // Calculate rates
    const responseRate = totalCalls > 0 ? (respondedCalls / totalCalls) * 100 : 0;
    const recoveryRate = totalCalls > 0 ? (recoveredCalls / totalCalls) * 100 : 0;

    return {
      totalCalls,
      respondedCalls,
      recoveredCalls,
      responseRate: Math.round(responseRate * 10) / 10,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      totalRevenue: totalRevenue._sum.estimatedValue || 0,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  }

  /**
   * Get recent activity (last 50 calls)
   */
  async getRecentActivity(businessId: string) {
    return await this.prisma.missedCall.findMany({
      where: {
        businessId,
      },
      take: 50,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        autoResponses: true,
        customerResponse: true,
      },
    });
  }

  /**
   * List calls with pagination and filtering
   */
 async listCalls({ page, limit, status, businessId }: ListCallsQueryDto & { businessId: string }) {
  const skip = (page - 1) * limit;

  const where: Prisma.MissedCallWhereInput = {
    businessId,
  };

  // Only add status filter if provided
  if (status) {
    where.status = status;
  }

  const [calls, totalCount] = await Promise.all([
    this.prisma.missedCall.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        autoResponses: true,
        customerResponse: true,
      },
    }),

    this.prisma.missedCall.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    calls,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

 
  async markCallAsRecovered({
    missedCallId,
    estimatedValue,
    businessId
   }: UpdateCallAsRecoveredDto & { businessId: string }) {
   

    const updated = await this.prisma.$transaction(async (tx) => {
    // First verify ownership
const call = await tx.missedCall.findUnique({
  where: { id: missedCallId },
  include: { customerResponse: true }
});

if (!call || call.businessId !== businessId) {
  throw new Error("Call not found or unauthorized");
}

if (call.status === "pending") {
  throw new Error("Cannot mark as recovered - customer hasn't responded yet");
}


    // Then update
     await tx.missedCall.update({
  where: { id: missedCallId },
  data: {
    estimatedValue,
    status: "recovered"
  }
       });

      if(!call.customerResponse) {
        throw new Error("Customer response not found")
      }

     if (call.customerResponse) {
  await tx.customerResponse.update({
    where: { id: call.customerResponse.id },
    data: { wasRecovered: true }
  });
}

      return call;
    })
   
    return updated
  }

}