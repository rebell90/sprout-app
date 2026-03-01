import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { InterestProfile, SaveInterestProfileRequest, SaveInterestProfileResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<SaveInterestProfileResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = (await req.json()) as SaveInterestProfileRequest;
    const { profile, archetypeTitle, answers, timePerWeekHrs } = body;

    const goals = Object.entries(profile as InterestProfile)
      .filter(([, score]) => score > 0.4)
      .map(([key]) => key);

    await prisma.userInterestProfile.upsert({
      where: { userId },
      update: {
        interests: profile,
        archetypeTitle,
        timePerWeekHrs,
        goals,
        lastAssessedAt: new Date(),
      },
      create: {
        userId,
        interests: profile,
        archetypeTitle,
        timePerWeekHrs,
        goals,
      },
    });

    // TODO: filter resources + call Claude API here (next step)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save interest profile:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
